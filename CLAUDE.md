# Senbon Garden — CLAUDE.md

A zen-garden-themed digital journal at **senbon.ch**, owned by Dominik Könitzer. The guestbook is live, backed by a self-hosted API on Dominik's own VPS (see **Guestbook** below).

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

Package manager: **Bun**. Never use `npm`/`pnpm` here — it creates a competing lockfile that breaks Vercel's `--frozen-lockfile`. The Bun version is pinned in `.bun-version`.

---

## Commands

| What                  | Command         |
| --------------------- | --------------- |
| Dev server            | `bun run dev`   |
| Production build      | `bun run build` |
| Lint                  | `bun run lint`  |
| Start built app       | `bun run start` |
| Reinstall (locked)    | `bun install --frozen-lockfile` |

Always run `bun run lint && bun run build` before declaring work done. Vercel runs `bun install --frozen-lockfile`, so the lockfile must always be committed and consistent with `package.json`.

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
    robots.ts              # Allows search-engine crawl (so noindex is seen); denies AI crawlers
    journal/
      page.tsx             # Journal index (server, fetches all posts)
      loading.tsx          # Streaming skeleton
      [slug]/
        page.tsx           # Single entry (server)
        loading.tsx
    guestbook/
      page.tsx             # Guestbook wall + sign form (server)
      actions.ts           # signGuestbook server action (validates, forwards to the API)
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
    guestbook/
      GuestbookForm.tsx       # Client: useActionState sign form + honeypot
      GuestbookWall.tsx       # Server: renders approved signatures
    ui/                       # shadcn primitives
  constants/
    blog.ts                   # BLOG_CONFIG, ANIMATION_CONFIG, TOC_CONFIG
    guestbook.ts              # GUESTBOOK_CONFIG (length caps, honeypot field name)
  hooks/
    useIntersectionObserver.ts  # TOC scroll-spy
    useSmoothScroll.ts          # ID-targeted scroll with reduced-motion respect
  lib/
    blog.ts                   # getAllPosts, getPostBySlug, getAdjacentPosts (all React.cache wrapped)
    guestbook.ts              # getGuestbookEntries (React.cache) + API config helpers
    toc.ts                    # Markdown heading extractor (dedups, skips fences)
    utils.ts                  # cn() + formatJournalDate + formatRelativeDate
  types/
    blog.ts                   # JournalPost, BlogCardProps, etc.
    guestbook.ts              # GuestbookEntry, GuestbookFormState
    index.ts
server/
  guestbook/                  # Self-hosted guestbook API (deployed to the VPS)
    docker-compose.yml        # Fastify API + Postgres 16, neither publishes a host port
    README.md                 # Moderation commands, deploy steps, Caddy notes
    api/server.js             # The whole API — routes, validation, rate limit, moderation
```

---

## Conventions

### Layout
- Use **`flex flex-col gap-*`**, never `space-y-*`. Sweep complete; do not regress.
- Use **`size-*`** when width === height (e.g. `size-10` not `w-10 h-10`).
- Use **`truncate`** shorthand, not `overflow-hidden text-ellipsis whitespace-nowrap`.

### Colors
- Use **semantic tokens** (`bg-background`, `text-foreground`, `text-primary`, `border-border`) wherever possible.
- The custom palette tokens (`zen-clay`, `zen-gold`, `zen-mist`, `zen-rose`, `zen-sage`) are defined in `tailwind.config.ts` and `globals.css`. Use them when the semantic name doesn't fit.
- **Never** hardcode raw color literals (`#a54d30`, `rgba(...)`). Add a token if the design needs a new one.

**The palette is warm and light by default.** It was redesigned away from a
near-black-and-gold scheme that read as cold and mysterious. The rules that keep
it feeling warm rather than merely bright:

- **Pigment, not metal.** Terracotta `#a54d30`, honey, dusty rose, sage. Metallic
  gold shimmer is what made the old version feel distant — don't reintroduce it.
- **Warm neutrals only.** Grey neutrals drain the whole thing. Even the shadows
  are brown (`--shadow-soft`, `--shadow-lift`); black shadows on cream read as grime.
- **Soft shadows, not hairlines.** Cards lift off the page. A thin cold border is
  the single fastest way to make this feel clinical again.
- **No vignette.** Darkened edges are literally what "closed in" looks like. The
  atmosphere lights from the top instead.
- **Dark mode is evening, not night** — warm brown-black `#211a15`, never a
  blue-black.

### Type & spacing
- Body copy lives at **`text-foreground/80–85`**. **`/70` is the hard floor** for
  anything a person actually reads — below that it fails WCAG AA on the cream
  background (`/40` measured 2.26:1). Only `aria-hidden` ornaments may go lower.
  Build hierarchy with size and weight instead of fading text out.
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

- `robots.ts` **allows** search engines to crawl (`userAgent: "*", allow: "/"`) — this is intentional and load-bearing. `noindex` only works if crawlers can fetch the page and see it; a blanket `disallow` makes Google index the bare URL from external links ("no information available for this page"). Do NOT change it back to deny-all. AI crawlers (GPTBot, ClaudeBot, anthropic-ai, Google-Extended, PerplexityBot, CCBot, Bytespider, etc.) remain explicitly disallowed, since for them the goal is blocking content *fetching*, which robots.txt does correctly.
- `metadata.robots.index/follow: false` on the root layout.
- `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex, noai, noimageai` header on every response (`next.config.ts`).
- Three layers of meta tags in `<head>` for redundancy.

When adding new pages, **do not** add OG/Twitter metadata or canonical URLs. The site is intentionally private.

**Vercel Analytics** is enabled (first-party, in `<Analytics />` in the root layout). It does not violate the no-tracking stance because the pixel goes to your own Vercel project.

---

## Env vars

See `env.example`.

- `NEXT_PUBLIC_SITE_URL` — canonical site URL
- `GUESTBOOK_API_URL` — base URL of the self-hosted guestbook API
- `GUESTBOOK_API_TOKEN` — bearer token for that API

The two guestbook vars are **server-only**. Never give them a `NEXT_PUBLIC_`
prefix — the token grants write access. If either is missing, `/guestbook`
degrades to the old "paused" notice instead of erroring, which is why preview
deployments without them still build fine.

---

## Guestbook

Signing is backed by a **self-hosted API on Dominik's own VPS** — no third-party
database, no managed service to lapse. Source lives in `server/guestbook/`;
see its README for moderation commands and deploy steps.

```
Vercel (server action)  ──HTTPS+token──►  caddy-proxy  ──►  API  ──►  Postgres
                                          (VPS, shared with his other projects)
```

Key facts:

- **Signatures publish instantly** (`AUTO_APPROVE=true` in the VPS `.env`). The
  moderation queue still exists in the API — set `AUTO_APPROVE=false` and
  `docker compose up -d` to hold new entries for approval again. With instant
  publishing, the honeypot, rate limit, and link block are the only defenses,
  so spam lands on the wall until deleted via `DELETE /admin/entries/:id`.
- **The API hostname uses sslip.io**, so it needs **no DNS records** — `senbon.ch`
  DNS is untouched. Only Vercel's server ever calls it; it never appears in HTML.
- **Length caps live in two places** — `src/constants/guestbook.ts` and the API's
  `server.js`. Keep them in sync or the client counter will promise something the
  server rejects.
- **Visitor IPs are never stored raw.** The action forwards `x-visitor-ip`; the
  API HMAC-hashes it before it reaches the database.
- **The rate limiter fails closed.** A request with no `x-visitor-ip` shares one
  bucket rather than skipping the limit. Do not "simplify" this back to
  `if (ipHash)` — that made the limiter a no-op for any direct API caller.
- **`clean()` strips invisible characters**, not just control characters. Zero-
  width and bidi controls defeat the link filter and let a signature visually
  reorder itself on the page.
- **Backups run daily** via `/etc/cron.d/senbon-guestbook-backup` on the VPS.
- **Moderation lives at `/guestbook/admin`** — password login, then a delete
  button per signature. `GUESTBOOK_ADMIN_TOKEN` is server-only and is never sent
  to the browser; every moderation call is proxied through a server action. The
  session cookie is an HMAC keyed by that token, so rotating the token
  invalidates all sessions. `removeEntry` re-checks the session on every call —
  do not rely on the page's conditional render alone.
- **The VPS is shared with unrelated production projects.** Anything touching
  `/srv/caddy/Caddyfile` must back up, `caddy validate`, then `caddy reload` —
  never restart the container.
- **`GuestbookForm` adjusts state during render, not in an effect.** React 19's
  `react-hooks/set-state-in-effect` rejects the effect version. Don't "fix" it
  back into a `useEffect`.

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
- Guestbook signing at `/guestbook` — instant, rate-limited, honeypot-protected.
- Copy button on every code block (appears on hover).
- Themed 404 + error boundaries (route segment + global).
- Aurora + river flowing background (CSS + SVG, seamless loop math).

---

## What NOT to do

- Don't re-add canvas-based backgrounds (particles, constellations, mystical orbs). The old versions were deleted intentionally.
- Don't add OG images, sitemap, structured data, or SEO metadata. The site is deindexed.
- Don't add third-party analytics (PostHog, GA, Plausible, etc.). Vercel Analytics is the only telemetry.
- Don't introduce `space-y-*` / `space-x-*` — use `flex flex-col gap-*`.
- Don't use `npm install`. Always `bun`.
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
