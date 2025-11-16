---
title: "Fixing the Invisible Elements — Solving Initial Load Rendering"
excerpt: "A deep dive into why some elements weren't appearing on initial page load and how I fixed it by understanding Framer Motion's viewport detection."
publishedAt: "2025-11-16"
tags:
  - debugging
  - performance
  - framer-motion
  - react
  - hydration
---

The issue was subtle but frustrating: some elements on the site wouldn't appear until the page was refreshed. Constellation nodes, blog cards, markdown content — all invisible on first load, then suddenly appearing after a hard refresh.

## The Problem

When I first investigated, I found several components using a `mounted` state pattern:

```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;
```

This pattern is common in Next.js to avoid hydration mismatches, but it creates a delay where elements don't render until after client-side JavaScript loads. I removed these checks, but the problem persisted.

## The Real Culprit: `whileInView`

The actual issue was more subtle. Many components were using Framer Motion's `whileInView` prop:

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>
```

`whileInView` relies on the Intersection Observer API to detect when elements enter the viewport. On initial page load, especially with server-side rendering, the Intersection Observer might not fire immediately. Elements start with `opacity: 0` and never become visible because the viewport detection doesn't trigger.

## The Solution

For elements that should be visible on initial load, I switched from `whileInView` to `animate`:

```typescript
// Before (problematic)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>

// After (fixed)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
```

The `animate` prop triggers immediately when the component mounts, ensuring elements become visible right away.

## What I Fixed

1. **BlogCard** — Changed from `whileInView` to `animate` so blog cards appear immediately in the grid
2. **MarkdownRenderer** — Updated all markdown elements (headings, paragraphs, blockquotes, lists, images) to use `animate` instead of `whileInView`
3. **Background Components** — Removed `mounted` state checks from MysticalBackground, ConstellationBackground, and FloatingElements

## When to Use `whileInView` vs `animate`

- **Use `animate`** for elements that should be visible on initial load (above the fold content, headers, main content)
- **Use `whileInView`** for elements that are below the fold and should animate when scrolled into view (lazy-loaded content, long-form articles)

The key insight: if an element is already in the viewport on initial load, `whileInView` might not fire reliably. Use `animate` instead.

## The Result

Now all elements render immediately on initial page load. No more invisible content waiting for a refresh. The animations still work beautifully, but they trigger immediately rather than waiting for viewport detection that might never come.

The garden is visible from the first moment the page loads.

---

*Elements now appear immediately. The Intersection Observer is no longer a bottleneck for initial render.*

