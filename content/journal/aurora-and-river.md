---
title: "Aurora and River — Two Ribbons That Breathe"
excerpt: "Three flowing aurora ribbons in the upper field, two waves drifting across the bottom. Pure SVG. Pure CSS. Mathematically seamless loops."
publishedAt: "2026-05-14"
tags:
  - motion
  - svg
  - atmosphere
---

The atmosphere layer I'd shipped in March was calm. Too calm. It was a still photograph where the page wanted a slow film. So I went back in and added motion — not the busy kind, the kind a river has.

## Five Ribbons, Five Speeds

The visible motion is five flowing SVG paths arranged in two bands:

- **Top (aurora):** gold ribbon at 38s, rose ribbon at 52s in reverse, sage ribbon at 64s.
- **Bottom (river):** gold wave at 46s, sage wave at 30s in reverse.

Each speed is prime-ish relative to the others, so the phase relationships between ribbons never repeat inside a normal session. Your eye reads them as alive rather than looped.

```css
.ribbon-gold  { animation: river-flow 38s linear infinite;          }
.ribbon-rose  { animation: river-flow 52s linear infinite reverse;  }
.ribbon-sage  { animation: river-flow 64s linear infinite;          }
.wave-back    { animation: river-flow 46s linear infinite;          }
.wave-front   { animation: river-flow 30s linear infinite reverse;  }
```

One keyframe drives them all. Different elements, different durations, different directions.

## The Seamless Loop

The interesting part is how the loop hides. Each SVG is positioned `left: -50%` with `width: 200%`. Inside, the path holds **exactly two sine cycles**. The keyframe translates the element by `-50%` of its own width over the chosen duration.

The math:

```
element width   = 200% of viewport
translate range = -50% of element  =  100% of viewport
path cycle      = 50% of element width

translate by one path cycle  =  perfect alignment with the original
```

Because the wave is periodic with the exact period that the keyframe travels, the end-state of the animation is visually identical to the start-state. The loop is seamless not by clever fading or crossfading, but by mathematics. You can stare at any ribbon for an hour and never see the wraparound.

```svg
<path d="M0,50 C100,15 200,85 300,50
          C400,15 500,85 600,50
          L600,100 L0,100 Z" />
```

Two cycles inside `viewBox="0 0 600 100"`. Each cycle is 300 wide. Translating 300 (which is 50% of the element) lands the second cycle exactly where the first started.

## Why Translate, Not Path Morph

I considered animating the `d` attribute itself — SMIL or a JS animation — but that asks the browser to recompute the path geometry every frame. A CSS `translate3d` is a GPU-composited transform. No layout, no paint, just a matrix on a layer. The whole effect costs almost nothing.

The blur and the `mix-blend-mode: screen` are the only expensive parts, and they run on the GPU too.

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .atmosphere-mesh,
  .atmosphere-ribbon,
  .atmosphere-wave {
    animation: none !important;
  }
}
```

If the visitor has told the OS they don't want motion, the ribbons hold still. The base gradient and grain remain — the page is still warm, just no longer flowing.

## What Motion Should Feel Like

Background motion is the easiest thing to overdo. The trick isn't "make it move." The trick is "make it move slowly enough that the eye stops watching the motion and starts watching the page."

A river you can read against. That's the test.

---

*Five layers, five speeds, one keyframe. The page breathes on its own.*
