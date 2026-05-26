---
title: "Tend the Hooks — React 19 and the Set-State Trap"
excerpt: "A new lint rule caught three setState-in-effect patterns I'd been getting away with for years. Fixing them taught me useSyncExternalStore properly."
publishedAt: "2026-04-28"
tags:
  - react
  - hooks
  - hydration
---

React 19 shipped a lint rule called `react-hooks/set-state-in-effect`. The rule says, roughly: don't call `setState` synchronously inside an effect. It triggers a cascading render. You almost never need to.

I ran the linter on the new command palette and got three errors. Three patterns I'd been writing for years.

## The Three Patterns

```tsx
useEffect(() => {
  setMounted(true);
  setIsDark(document.documentElement.classList.contains("dark"));
}, []);

useEffect(() => setActive(0), [query, open]);

useEffect(() => {
  if (open) {
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }
}, [open]);
```

All three look reasonable. All three are doing the same thing differently — using an effect as a place to react to *something that the user did* by setting state in response.

The fix in each case is to do the state update in the event handler that caused the change, not in an effect that observes the change.

## The Fixes

**Reset active index on query change** → do it inside `onChange`:

```tsx
const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setQuery(e.target.value);
  setActive(0);
};
```

**Clear query and focus on open** → do it in the `openPalette` helper that the keyboard handler calls anyway:

```tsx
const openPalette = useCallback(() => {
  setQuery("");
  setActive(0);
  setOpen(true);
  requestAnimationFrame(() => inputRef.current?.focus());
}, []);
```

Both of those were just bad architecture. The effect was a workaround for not having a clear "open" event handler in the first place.

## The Third Fix: useSyncExternalStore

The hydration case is more interesting. I need to know whether the document has the `dark` class on it, but only on the client — the server has no DOM. The naive fix is:

```tsx
const [isDark, setIsDark] = useState(false);
useEffect(() => {
  setIsDark(document.documentElement.classList.contains("dark"));
}, []);
```

Lint hates it. But more importantly, it's wrong — `isDark` is stale the moment somebody else toggles the class.

The right primitive is `useSyncExternalStore`:

```tsx
const subscribeDark = (cb: () => void) => {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => obs.disconnect();
};
const getDarkSnapshot = () =>
  document.documentElement.classList.contains("dark");
const getDarkServerSnapshot = () => true;

const isDark = useSyncExternalStore(
  subscribeDark,
  getDarkSnapshot,
  getDarkServerSnapshot
);
```

Three pure functions:

- **Subscribe** — set up a listener. Return a cleanup. React calls this once.
- **Get snapshot** — read the current value from the DOM. React calls this whenever it needs to render.
- **Get server snapshot** — what to render during SSR. The server can't read the DOM, so it returns a sensible default.

The result: `isDark` is always live, hydration mismatches are impossible, and the lint rule has nothing to complain about. The hook was designed for exactly this kind of "the DOM is the source of truth" problem.

## What I Learned

Lint rules age well or age badly. This one ages well — it caught real bugs I'd been carrying. I removed three effects, added one `useSyncExternalStore`, and the component got simpler.

When a new React rule yells at you, listen for a minute before suppressing it. Sometimes the rule knows.

---

*The hook you reach for first is usually the wrong one. The right one is two letters shorter and three letters longer.*
