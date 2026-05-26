---
title: "Path of Stones — A Command Palette"
excerpt: "Every garden needs a path. ⌘K opens one between any two points in the site, plus a back door for the keyboard-only visitor."
publishedAt: "2025-12-22"
tags:
  - keyboard
  - navigation
  - ui
---

There's a kind of visitor I want to design for above all others: the one who never lifts their hand from the keyboard. They press `⌘K` on every site they open, because the world should respond to their fingers.

So I built the path.

## The Surface

A modal. A search field. A short list. Arrow keys to navigate, enter to commit, escape to dismiss. Nothing the visitor hasn't seen elsewhere — that's the point. The palette is a convention, and conventions are quiet.

```tsx
const actions = [
  { id: "home",      label: "Go home",            perform: () => router.push("/") },
  { id: "journal",   label: "Open journal",       perform: () => router.push("/journal") },
  { id: "guestbook", label: "Sign the guestbook", perform: () => router.push("/guestbook") },
  { id: "theme",     label: "Toggle dark / light", perform: toggleTheme },
  { id: "top",       label: "Scroll to top",      perform: () => window.scrollTo({ top: 0 }) },
];
```

The whole feature is a list and a router. The interesting part isn't the data — it's the keyboard plumbing.

## The Listening

Three keys open the palette:

- `⌘K` or `Ctrl+K`, the universal convention.
- `/`, the GitHub convention, but only when no input is focused.
- A small chip in the corner, for the visitor who scrolls before they type.

```tsx
const onKey = (e: KeyboardEvent) => {
  const mod = isMac ? e.metaKey : e.ctrlKey;
  if (mod && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openPalette();
  }
  if (e.key === "/" && !open) {
    const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    e.preventDefault();
    openPalette();
  }
};
```

The guard on `/` is important. A search palette is no good if pressing `/` inside a textarea also dismisses your draft.

## The Hard Part

The hard part wasn't the keys. It was the hydration.

`document.documentElement.classList.contains("dark")` is a perfectly reasonable thing to ask. It also doesn't exist on the server, and reading it inside `useMemo` will explode the page on first render. I worked around it with `useSyncExternalStore`, which is React's quiet promise that the server and the client agree to disagree, and that's okay.

I'll write more about that hook another time. It deserves its own post.

## What it Feels Like

Pressing `⌘K` and arriving somewhere else, three keystrokes later, is a small joy. Like remembering the way through your own house in the dark.

---

*The path of stones leads anywhere you've already been.*
