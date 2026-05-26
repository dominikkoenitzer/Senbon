---
title: "Dedup the River — React.cache and the Quiet Waterfall"
excerpt: "Two functions, one fetch. Wrapping post lookups in React.cache so metadata and the page itself stop racing each other to the same file."
publishedAt: "2026-02-06"
tags:
  - performance
  - rsc
  - next.js
---

In a React Server Component world, the same function can be called multiple times during a single render — and unless you tell React otherwise, each call does the work again. I had two call sites for `getPostBySlug`: one in `generateMetadata`, one in the page itself. Two reads of the same file. Two parses of the same frontmatter. Two computations of the same reading time.

Worse, inside the page I had a *nested* `getPostBySlug` inside a Suspense boundary that re-read the post a third time on the same request. A waterfall of one drop, falling three times.

## The Fix

`React.cache` is the right primitive here. It memoizes the call **per request**, server-side. The cache is automatically cleared between requests, so there's no staleness window to reason about.

```ts
import { cache } from "react";

export const getAllPosts = cache(async (): Promise<JournalPost[]> => {
  await ensureDirectory();
  const files = await fs.readdir(contentDir);
  const posts = await Promise.all(
    files.filter(isMarkdownFile).map(parsePostFile)
  );
  return posts.sort(sortByDateDesc);
});

export const getPostBySlug = cache(
  async (slug: string): Promise<JournalPost | null> => {
    const posts = await getAllPosts();
    return posts.find((post) => post.slug === slug) ?? null;
  }
);
```

The signature didn't change. The call sites didn't change. Everything that asked for the same slug during the same request now gets the same in-flight promise.

## And Then the Real Fix

The cache helped, but the deeper problem was the architecture. The nested Suspense + second-fetch pattern existed because I'd copied a pattern from the Next.js docs without asking whether it fit. The post page is small enough that there's no waterfall to break up — the entire body fits in one fetch path.

So I flattened it. One `getPostBySlug` at the top of the page. The post object is passed down to the components that need it. No nested data fetch, no nested Suspense. The cache is still in place for `generateMetadata`'s call, which happens above the component tree.

The page went from three reads per request to one. The lighthouse trace shows the difference. The page itself, on second pass, looks the same.

## What I Learned

The most expensive function calls in a server component are the ones you didn't realize you were making. `React.cache` is the seatbelt — but the real win was noticing the duplication in the first place.

---

*Quiet code makes a quiet river. One source, one flow.*
