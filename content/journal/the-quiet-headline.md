---
title: "The Quiet Headline — Editorial Type"
excerpt: "Playfair Display as the voice of the journal. A short kicker above. An italic accent inside. The architecture of a sentence that wants to be read."
publishedAt: "2026-04-11"
tags:
  - typography
  - editorial
  - design
---

The most important design decision on a journal site is the headline. Not the color, not the layout, not the animation. The headline. It's the single piece of typography that sets the entire tone — and once it lands, everything else either supports it or fights it.

I spent a long time getting this one right.

## The Three Pieces

A headline on a journal entry has three parts, in this order:

1. The **kicker** — a tiny uppercase line above, in the mono font, tracking widely spaced out. It's not the title. It's the room the title is in. "The Journal · 日記" or "01 — Journal."
2. The **headline** — Playfair Display, big, tracking tight, leading at roughly 0.95. Mostly upright, with a phrase or word set in italic for rhythm.
3. The **lede** — one paragraph in the body face, with a left rule the color of the primary, sitting in the column.

The kicker is small. The headline is loud. The lede is medium and intimate. Three voices, in order, like an introduction at a small reading.

```tsx
<p className="kicker">The Journal · 日記</p>
<h1 className="font-display text-5xl md:text-7xl tracking-tight display-balance">
  Notes from a
  <span className="italic text-foreground/80"> thousand-fold</span>{" "}
  garden.
</h1>
<p className="border-l-2 border-primary/40 pl-5 text-foreground/80">
  Field notes on building, breaking, and reassembling.
</p>
```

## Why Italic in the Middle

Italic in the middle of a roman sentence does one specific thing: it slows you down. Your eye sees the shape change and pauses. In an oral sense, it's the place a writer would lean in.

In a journal title, the italic phrase is the thing the entry is *actually* about — the precise word or phrase that earns its weight. "A journal, *kept slowly*." The first half is the category. The second half is the promise.

## text-wrap: balance

A small thing that made a large difference: `text-wrap: balance` on headlines. Browsers now distribute words across lines so each line is roughly the same length. No more headlines where the last line is one short word dangling alone. It's a single CSS property, and once you turn it on you can't go back.

I wrapped it in a utility:

```css
.display-balance {
  text-wrap: balance;
}
.read-prose {
  text-wrap: pretty;
}
```

`balance` for headlines, `pretty` for body. Pretty is less aggressive — it just prevents widows. Both are quiet improvements you only notice in their absence.

## What Type Does

A page is a voice. The headline is the voice's first word. Get that right and the reader is already listening.

---

*Quiet, but heard. The right size, set the right way.*
