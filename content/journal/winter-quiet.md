---
title: "Winter Quiet — Muting the Audience"
excerpt: "Pulling analytics, blocking crawlers, and writing the robots file that says no — politely, three times over."
publishedAt: "2025-12-08"
tags:
  - privacy
  - infra
  - ritual
---

December came in soft. The kind of cold that makes you close one tab at a time and notice how much was running in the background. I started with the analytics script.

## Saying No, Politely

Most sites today are loud by default. A new project gets analytics before it has a third page. Telemetry endpoints get wired before the content does. Search-engine optimisation is the first design constraint, not the last consideration. I wanted the opposite of that here — a garden, not a storefront.

So I peeled it back.

```ts
// next.config.ts
const noIndexHeaders = [
  {
    key: "X-Robots-Tag",
    value:
      "noindex, nofollow, noarchive, nosnippet, noimageindex, noai, noimageai",
  },
  { key: "Referrer-Policy", value: "no-referrer" },
];
```

Three layers of refusal:

1. A `robots.ts` route with explicit `Disallow: /` for every crawler I could name — Googlebot, Bingbot, but also GPTBot, ClaudeBot, anthropic-ai, Google-Extended, PerplexityBot, CCBot, Bytespider, Amazonbot, Applebot-Extended, cohere-ai. Anything I knew about, on the list.
2. Meta tags on every page (`robots`, `googlebot`, `bingbot`, `ai-content-declaration`).
3. The `X-Robots-Tag` header above, served at the edge so it covers responses that bypass the document entirely.

No single layer is enough. But three layers, in agreement, are.

## Removing the Audience

The analytics package went next. Three lines of import, two lines of usage, gone in a single commit. The site felt lighter immediately — not in bytes, in intent. I am no longer making decisions for an imagined dashboard.

There's a particular dignity in writing for nobody. The same dignity, I think, as raking sand at dusk when nobody is watching. The rake doesn't know.

## What I Got Back

- A faster first paint, because nothing has to ping a third party.
- A smaller bundle.
- A clearer head — every change is now judged on whether **I** like it, not whether some metric does.

The garden is private. That's the point.

---

*Next: a key for the rooms — ⌘K.*
