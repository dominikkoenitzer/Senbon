---
title: "Failing Gently — error.tsx as Ritual"
excerpt: "When the garden cracks, what do you show? Not a stack trace. A bow, a reason, and a path back."
publishedAt: "2026-02-24"
tags:
  - errors
  - resilience
  - design
---

The default error page on most frameworks looks like a punishment. Red text, a stack trace, a sense that something fundamental has been wronged. The user, who did nothing, is shown the inside of the kitchen.

I don't want that here.

## Three Layers, Three Bows

Next.js gives you three error boundaries. I used all three:

- `not-found.tsx` — when the URL points nowhere. A 404, but written like a missed turn.
- `error.tsx` — when a render fails inside a route segment. The garden cracked. Not the whole sky.
- `global-error.tsx` — when the root layout itself fails. The sky cracked too. This is the only one that has to re-declare `<html>` and `<body>` because the layout is gone.

Each one says the same thing in different shapes: *something went wrong, here's a way back, and a reference number if you care to send it.*

```tsx
<p className="kicker">静寂が乱れた</p>
<h1>A ripple passed through the garden.</h1>
<p>Something went wrong while loading this page. The stones can be set back in place.</p>
```

The kanji at the top says "the stillness has been disturbed." The headline says the same thing softer. The body explains, briefly, without apologising in a way that suggests the user did something wrong.

## The Reset Button

Every `error.tsx` is handed a `reset` function. It tells React to re-run the failed segment. Sometimes that works — a transient network blip, a momentary database hiccup. Sometimes it doesn't. Either way, the user gets to try, and if it still fails, they get the home link as a second option.

```tsx
<button onClick={() => reset()}>Try again</button>
<Link href="/">Home</Link>
```

Two buttons. One soft, one definite. Both are escape routes.

## The Digest

Next.js attaches an opaque `digest` to errors that occurred during server rendering. It's not the error message — that's hidden from the client for security. But it's a reference the user can send if they want to. I render it small, monospaced, in the corner.

```tsx
{error.digest && (
  <p>ref · {error.digest}</p>
)}
```

A polite acknowledgement that yes, something happened, and yes, I'll know what to look for if you tell me.

## What Errors Should Feel Like

Errors are part of the experience. They are not the absence of the experience. A well-designed error page is the difference between "this site is broken" and "this site had a moment."

The garden cracks. You sweep up. The garden continues.

---

*The right apology is short, specific, and ends with a door open.*
