---
title: "Ink on Stone — Reading Progress and Quiet Skeletons"
excerpt: "A hairline at the top of the page that fills as you read. Skeletons that don't shimmer. Small comforts for the long-form reader."
publishedAt: "2026-01-17"
tags:
  - ux
  - reading
  - skeletons
---

I read a lot of long-form on the web. The ones I return to all share something subtle: they tell you, without asking, how much of the piece is left. A thin progress bar. A floating dot. A sentence count in the margin.

So I added one.

## The Hairline

Two pixels at the top of the viewport. It fills with the page's primary color as you scroll. That's the whole feature.

```tsx
const compute = () => {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop;
  const max = doc.scrollHeight - doc.clientHeight;
  const next = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
  setProgress(next);
};
```

Throttled to one update per animation frame. Inert when there's nothing to scroll. Invisible until you start moving. The kind of feature you only notice when it isn't there — which is the highest compliment I can pay a piece of UI.

## Quiet Skeletons

The other thing I added was a set of `loading.tsx` files for the journal routes. Next.js streams them in while the actual page resolves, which means even the first paint has structure rather than a void.

The trick is to make them quiet. A skeleton that pulses too brightly is its own kind of noise — you spend three seconds watching grey bars throb instead of waiting calmly for the content.

```tsx
<div className="h-12 w-2/3 rounded-md bg-white/10 animate-pulse" />
```

That's it. One pulse animation, very low contrast, no shimmer. A whisper of "something is coming," not a strobe.

## Why It Matters

A reader who knows where they are reads more. A reader who's told "wait, content is loading" without being shouted at trusts the page more. These aren't conversion optimisations. They're acts of hospitality.

The page is a room. The reader is your guest. You don't keep them standing at the door.

---

*Two pixels, kindly placed, can settle a whole page.*
