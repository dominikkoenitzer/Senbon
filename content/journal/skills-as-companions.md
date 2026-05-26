---
title: "Skills as Companions — Bringing in External Wisdom"
excerpt: "Six skills installed from Vercel, Anthropic, and the shadcn team. Each one a small library of taste, applied where it fit."
publishedAt: "2026-05-23"
tags:
  - tools
  - agents
  - workflow
---

A new pattern landed in the agent ecosystem this spring: **skills**. Small, focused, version-controlled bundles of guidance — Markdown rules and code snippets that an AI agent can load on demand. Not models. Not prompts. Reference material, written by people who care about a specific domain, that an agent can read before it acts.

I installed six this week.

## The Library

```bash
npx skills add https://github.com/vercel-labs/skills          --skill find-skills
npx skills add https://github.com/anthropics/skills           --skill frontend-design
npx skills add https://github.com/vercel-labs/agent-skills    --skill vercel-react-best-practices
npx skills add https://github.com/shadcn/ui                   --skill shadcn
npx skills add https://github.com/vercel-labs/agent-skills    --skill web-design-guidelines
npx skills add https://github.com/vercel-labs/next-skills     --skill next-best-practices
```

Six skills, six perspectives:

- **find-skills** — a discovery tool for the rest of the ecosystem
- **frontend-design** — taste guidance from Anthropic on avoiding generic AI aesthetics
- **vercel-react-best-practices** — 70 rules, prioritised by impact, for React/Next performance
- **shadcn** — composition rules for the shadcn/ui design system
- **web-design-guidelines** — Vercel's interface review checklist
- **next-best-practices** — the deep Next.js manual: RSC boundaries, fonts, metadata, fonts, hydration, bundling

## What Actually Changed

The skills are guidance, not auto-fixes. They told me what to look for. I did the looking. Here's what landed in the codebase as a result:

- `experimental.optimizePackageImports` added in `next.config.ts` for lucide-react, framer-motion, react-markdown, the unified rehype/remark stack, and the date libraries. Bundle dropped meaningfully on every route.
- All three `next/font` calls now declare explicit `display: "swap"`, system fallback chains, and per-font `preload` flags. The mono font is no longer preloaded; saves a request.
- `getAllPosts` and `getPostBySlug` are wrapped in `React.cache` for per-request dedup. Wrote about this separately in *Dedup the River*.
- `error.tsx` and `global-error.tsx` added at the root, with the styling from *Failing Gently*.
- `loading.tsx` files in journal and guestbook routes for proper streaming UX.
- A noisy `console.log` in the guestbook page dropped down to a dev-only conditional.

```ts
experimental: {
  optimizePackageImports: [
    "lucide-react",
    "framer-motion",
    "react-markdown",
    "remark-gfm",
    "rehype-highlight",
  ],
}
```

Three letters of config, measurable size reduction. That's the kind of recommendation a skill is for.

## What I Didn't Apply

The shadcn skill recommends rewriting every `space-y-*` as `flex-col gap-*`, every `w-4 h-4` as `size-4`, and a handful of other consistency moves. All correct. None essential — the codebase already reads cleanly and a stylistic sweep would touch dozens of files for no functional gain. I noted it for the next deliberate refactor pass.

The `frontend-design` and `web-design-guidelines` skills are review-style. They want a file or pattern to chew on and produce a critique. I'll run them as a separate ritual when the next visual change lands.

## What Skills Feel Like

The best skill is one that gives you a *specific* recommendation with a *specific* reason. The Next.js skill telling me to use `React.cache` for per-request dedup is concrete. The frontend-design skill telling me to "commit to a bold aesthetic direction" is suggestive.

Both are valuable. The first changes a line of code. The second changes how I sit down to design the next thing.

A skill is a colleague who has read more documentation than I have time for, distilled into a file I can grep.

---

*The garden is tended by many hands now. Mine, and a small library of guidance from people I'll never meet.*
