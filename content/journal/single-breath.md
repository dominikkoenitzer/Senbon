---
title: "Single Breath — One Atmosphere Instead of Four"
excerpt: "Four canvas backgrounds were all doing the same thing badly. I replaced them with one CSS layer and the page started to breathe."
publishedAt: "2026-03-27"
tags:
  - backgrounds
  - performance
  - refactor
---

The site had four background layers when I sat down with it today.

- `ParticleBackground` — a canvas painting ninety dim gold dots every frame.
- `FloatingElements` — three blurred radial gradients in absolutely-positioned divs, animated with framer-motion.
- `ConstellationBackground` — another canvas, fifty stars with lines between them, mouse-reactive.
- `MysticalBackground` — on the post pages only, six more gradient orbs and twenty floating particles.

The combined effect was: dim gold haze. Everything was doing the same job. Everything was doing it imprecisely. The page paid the cost of four animation loops to achieve the visual impact of one.

## What I Removed

All four. Folders included. About four hundred lines of imperative canvas code, gone.

## What I Replaced Them With

One ambient layer, pure CSS:

- A warm base gradient sized to fill the viewport.
- A drifting gradient mesh, animated with a 38-second `translate3d` keyframe.
- A grain SVG mixed in at 7% opacity.
- A vignette at the edges.

Zero canvas. Zero JavaScript per frame. The GPU does the compositing. The CPU does nothing.

## What I Learned

The previous version had been *building atmosphere through quantity*. Each layer alone was subtle. Together they were noise. The replacement builds atmosphere through *intention* — one carefully-mixed layer that does the job of all four.

There's a principle in here that I keep relearning: when something feels overwhelming, the answer is rarely "tune each part down." The answer is "remove every part except one, and tune that one carefully."

```tsx
const AtmosphereBackground = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <div className="atmosphere-base" />
    <div className="atmosphere-mesh" />
    <div className="atmosphere-grain" />
    <div className="atmosphere-vignette" />
  </div>
);
```

Four divs. No state. No effects. The whole component is data.

## Aside: The Stacking Trap

I shipped this and didn't see it on the page. Spent ten minutes confused.

The wrapper was at `-z-10`. The body had `background-color: var(--background)`. A fixed element behind the body's background paint is invisible. Moved the base color to `html`, set the body to transparent, gave the wrapper `z-0`. Visible immediately.

CSS stacking is a science of millimeters. Half of debugging is just looking in the right place.

---

*One layer, well-mixed, beats four layers competing.*
