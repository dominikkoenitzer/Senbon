# Senbon Garden — CLAUDE.md

A zen-garden-themed digital journal at **senbon.ch**, owned by Dominik Könitzer. (A guestbook page exists but signing is currently paused — it renders a static notice.)

This file is the load-bearing context for AI agents working on the codebase. Read it first, then act.

---

## Stack

- **Next.js 16** (App Router, Turbopack, RSC)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** with `@theme inline` tokens
- **shadcn/ui** primitives (Radix-backed)
- **Framer Motion** for entrance animations
- **react-markdown + rehype-highlight + remark-gfm** for journal entries
- **Vercel Analytics** for traffic stats (first-party, no third-party tracking)

Package manager: **pnpm** (10.x). Never use `npm install` here — it creates a competing lockfile that breaks Vercel's `--frozen-lockfile`.

---

## Commands

| What                  | Command         |
| --------------------- | --------------- |
| Dev server            | `pnpm dev`      |
| Production build      | `pnpm build`    |
| Lint                  | `pnpm lint`     |
| Start built app       | `pnpm start`    |
| Reinstall (locked)    | `pnpm install --frozen-lockfile` |

Always run `pnpm lint && pnpm build` before declaring work done. Vercel runs `pnpm install --frozen-lockfile`, so the lockfile must always be committed and consistent with `package.json`.

---

## Project structure

```
content/
  journal/                 # Markdown entries (frontmatter + body)
public/                    # Static assets (currently sparse)
src/
  app/
    layout.tsx             # Root layout: fonts, atmosphere, metadata, analytics
    page.tsx               # Home (editorial hero + two nav cards)
    error.tsx              # Route-segment error boundary (themed)
    global-error.tsx       # Root error boundary (re-declares <html>/<body>)
    not-found.tsx          # 404
    robots.ts              # Deny-all robots config (incl. AI crawlers)
    journal/
      page.tsx             # Journal index (server, fetches all posts)
      loading.tsx          # Streaming skeleton
      [slug]/
        page.tsx           # Single entry (server)
        loading.tsx
    guestbook/
      page.tsx             # Guestbook page — signing paused, renders a static notice
  components/
    AtmosphereBackground.tsx  # Single ambient layer (CSS + SVG ribbons)
    BackToTop.tsx
    CommandPalette.tsx        # ⌘K + / launcher
    ReadingProgress.tsx       # Hairline at top of viewport
    ScrollRestoration.tsx     # Per-pathname scroll memory
    ErrorBoundary.tsx         # Class-based for nested boundaries
    blog/
      BlogCard.tsx
      JournalBrowser.tsx      # Client: search + tag filter + load more
      JournalHero.tsx
      MarkdownRenderer.tsx
      PostGrid.tsx
      PostHeader.tsx
      PostHero.tsx
      PostNavigation.tsx      # Prev/next links at bottom of post
      TableOfContents.tsx
      LoadingStates.tsx
      MysticalBackground.tsx  # (removed; do not re-add)
      markdown/               # ReactMarkdown component overrides
        Heading.tsx           # H1-H4 with slug anchors
        Text.tsx              # P, Link (external ↗), Strong, Em, Hr, Blockquote
        List.tsx
        Code.tsx              # Inline + Pre with copy button
        Media.tsx
        Table.tsx
        types.ts
        utils.ts
        index.ts
    ui/                       # shadcn primitives
  constants/
    blog.ts                   # BLOG_CONFIG, ANIMATION_CONFIG, TOC_CONFIG
  hooks/
    useIntersectionObserver.ts  # TOC scroll-spy
    useSmoothScroll.ts          # ID-targeted scroll with reduced-motion respect
  lib/
    blog.ts                   # getAllPosts, getPostBySlug, getAdjacentPosts (all React.cache wrapped)
    toc.ts                    # Markdown heading extractor (dedups, skips fences)
    utils.ts                  # cn() + formatJournalDate + formatRelativeDate
  types/
    blog.ts                   # JournalPost, BlogCardProps, etc.
    index.ts
```

---

## Conventions

### Layout
- Use **`flex flex-col gap-*`**, never `space-y-*`. Sweep complete; do not regress.
- Use **`size-*`** when width === height (e.g. `size-10` not `w-10 h-10`).
- Use **`truncate`** shorthand, not `overflow-hidden text-ellipsis whitespace-nowrap`.

### Colors
- Use **semantic tokens** (`bg-background`, `text-foreground`, `text-primary`, `border-foreground/10`) wherever possible.
- The custom palette tokens (`zen-gold`, `zen-mist`, `zen-rose`, `zen-sage`) are defined in `tailwind.config.ts` and `globals.css`. Use them when the semantic name doesn't fit.
- **Never** hardcode raw color literals (`#e6c281`, `rgba(...)`). Add a token if the design needs a new one.

### Type & spacing
- Body copy lives at **`text-foreground/80–85`** — don't push below `/45` without good reason.
- Headlines use `font-display` (Playfair Display).
- Kicker labels use the `.kicker` utility (mono, uppercase, wide tracking, gold).
- Apply `display-balance` (`text-wrap: balance`) on display headlines, `read-prose` (`text-wrap: pretty`) on body paragraphs.

### Components
- New shadcn components go in `src/components/ui/`. Install via `npx shadcn@latest add <name>`.
- For markdown overrides, edit the matching file in `src/components/blog/markdown/`.
- For loading UI, use the streaming `loading.tsx` convention. Skeletons live in `src/components/blog/LoadingStates.tsx`.

### Animation
- Framer Motion is used for entrance animations only — don't add hover-state JS animations when CSS `transition` works.
- Respect `prefers-reduced-motion`. The global atmosphere already does; new motion-heavy components should too.

### Background
- The site has **one** ambient background layer: `<AtmosphereBackground />` in the root layout.
- Do NOT add per-page background components, particle systems, or extra orb layers. The old `ConstellationBackground`, `MysticalBackground`, `FloatingElements`, and `ParticleBackground` have been deliberately deleted — do not resurrect them.
- The atmosphere ribbons are SVG paths with two cycles inside `viewBox 0..600`, positioned `left: 0; width: 200%`, animated by a `-50%` translate. Loop math is in `globals.css` near `.atmosphere-ribbon`.

---

## Privacy posture

This site is deliberately **non-indexable**:

- `robots.ts` denies all search engines and AI crawlers explicitly (GPTBot, ClaudeBot, anthropic-ai, Google-Extended, PerplexityBot, CCBot, Bytespider, etc.).
- `metadata.robots.index/follow: false` on the root layout.
- `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex, noai, noimageai` header on every response (`next.config.ts`).
- Three layers of meta tags in `<head>` for redundancy.

When adding new pages, **do not** add OG/Twitter metadata or canonical URLs. The site is intentionally private.

**Vercel Analytics** is enabled (first-party, in `<Analytics />` in the root layout). It does not violate the no-tracking stance because the pixel goes to your own Vercel project.

---

## Env vars

See `env.example`. The only variable is:

- `NEXT_PUBLIC_SITE_URL` — canonical site URL

---

## Adding a journal entry

Create a markdown file at `content/journal/<slug>.md` with frontmatter:

```yaml
---
title: "Entry Title"
excerpt: "One-line summary that appears on the index card."
publishedAt: "2026-05-26"
tags:
  - design
  - performance
featured: true                              # optional, surfaces on /journal top
hero: "/images/journal/your-image.jpg"      # optional, must exist in public/
---
```

The site rebuilds on commit. Posts are sorted newest-first. Slug = filename without extension.

- `featured: true` floats the post into the "Featured" strip on `/journal` (max 2 shown).
- `hero:` is **only rendered if the file exists** at the given path under `public/`. Missing files silently degrade — no broken images. Drop placeholder images into `public/images/journal/`.
- TOC auto-generates from H2–H4 headings. Code fences are skipped. Duplicate slugs are auto-suffixed (`-2`, `-3`).

---

## Existing user-facing features

- **⌘K / Ctrl+K / `/`** opens the command palette (nav + theme toggle).
- Reading progress bar at the top of every page.
- Back-to-top button after 600px scroll.
- Search + tag filter + load-more pagination on `/journal`.
- Featured posts surfaced at the top of the journal index.
- Prev/next entry links at the bottom of each post.
- Relative time on cards ("3 weeks ago"), absolute date on hover.
- External link arrows (↗) on links in markdown.
- Skip-to-content link for keyboard users.
- Copy button on every code block (appears on hover).
- Themed 404 + error boundaries (route segment + global).
- Aurora + river flowing background (CSS + SVG, seamless loop math).

---

## What NOT to do

- Don't re-add canvas-based backgrounds (particles, constellations, mystical orbs). The old versions were deleted intentionally.
- Don't add OG images, sitemap, structured data, or SEO metadata. The site is deindexed.
- Don't add third-party analytics (PostHog, GA, Plausible, etc.). Vercel Analytics is the only telemetry.
- Don't introduce `space-y-*` / `space-x-*` — use `flex flex-col gap-*`.
- Don't use `npm install`. Always `pnpm`.
- Don't suppress lint rules (`eslint-disable-next-line`) without a comment explaining why.

---

## Architecture decisions worth remembering

- **`React.cache` wraps `getAllPosts`, `getPostBySlug`, `getAllPostSlugs`, `getAdjacentPosts`** so the metadata and page render call the same function once per request.
- **`optimizePackageImports`** in `next.config.ts` covers `lucide-react`, `framer-motion`, `react-markdown`, `remark-gfm`, `rehype-highlight`, `date-fns`, `dayjs` — keeps bundle small even with deep barrel imports.
- **`useSyncExternalStore`** is used in `CommandPalette` for SSR-safe dark-mode detection. Don't replace it with a `useEffect + setState` pattern — React 19's lint rule will scream and the hydration story breaks.
- **The atmosphere loop relies on path geometry**, not crossfading. If you edit `AtmosphereBackground.tsx`, the path must have exactly 2 sine cycles inside its viewBox, and the wrapper must be `left: 0; width: 200%; transform: translateX(-50%)`. See the comment in `globals.css`.
- **fonts** use explicit `display: "swap"` + a system fallback chain. Mono is `preload: false` (saves a request).

---

## Skills installed

The project has these agent skills under `.agents/skills/`:

- `find-skills` — discovery
- `frontend-design` — Anthropic's distinctive-UI guidance
- `vercel-react-best-practices` — 70 perf rules
- `shadcn` — composition + rules
- `web-design-guidelines` — Vercel's UI review checklist
- `next-best-practices` — file conventions, RSC, fonts, metadata, etc.

These were applied in commits during the spring 2026 polish pass. Refer to the journal entries `skills-as-companions.md` and adjacent posts for context.

---

## Owner

**Dominik Könitzer** — [github.com/dominikkoenitzer](https://github.com/dominikkoenitzer)
