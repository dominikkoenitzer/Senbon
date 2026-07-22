# Senbon Garden — CLAUDE.md

A zen-garden-themed digital journal at **senbon.ch**, owned by Dominik Könitzer. The guestbook is live, backed by a self-hosted API on Dominik's own VPS (see **Guestbook** below).

This file is the load-bearing context for AI agents working on the codebase. Read it first, then act.

---

## Stack

- **Next.js 16** (App Router, Turbopack, RSC)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** with `@theme inline` tokens, configured **entirely in
  `globals.css`**. There is no JS config — `tailwind.config.ts` was deleted on
  2026-07-22 because nothing loaded it: v4 only reads a JS config through an
  `@config` directive, and there was none. It had been sitting there defining a
  `zen` palette with hex values that *disagreed* with the real ones in
  `globals.css`, which is a trap, not documentation.
- **Lenis** for smooth scrolling (gentle: `lerp: 0.2`, skipped entirely under
  reduced motion)

**Route navigation is deliberately unanimated.** It ran through React's
`<ViewTransition>` for a few hours on 2026-07-22, with shared-element morphs
pairing each journal card title to its entry headline. It looked good and the
cost was unacceptable: `experimental.viewTransition` switches the whole app onto
Next's bundled **prerelease React build**, because `<ViewTransition>` does not
exist in stable react, and clicks stalled for seconds while server response
stayed under 0.4s. Reverted. Do not re-enable that flag without measuring
click-to-render in a real browser first.

The **theme toggle still uses `document.startViewTransition`** — that is the
native browser API, needs no flag and no framework support, and is unaffected.
- **react-markdown + rehype-highlight + remark-gfm** for journal entries
- **Vercel Analytics** for traffic stats (first-party, no third-party tracking)

No **Framer Motion** (not installed; entrance animation is the CSS `.fade-up`),
no **shadcn/ui** primitives and no **Radix** (see Components below). Both were
listed here long after they were removed.

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
                           # NOTE: no public/ directory exists. It is not
                           # "sparse", it is absent — create it before
                           # referencing any static asset path.
src/
  app/
    layout.tsx             # Root layout: fonts, atmosphere, theme script,
                           # view transitions, Lenis, metadata, analytics
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
      actions.ts             # signGuestbook + resolveAutoPublish server actions
      admin/
        page.tsx             # Moderation: login gate, auto-publish toggle, entries
        actions.ts           # signIn, signOut, removeEntry, approveSignature, updateAutoApprove
  components/
    AtmosphereBackground.tsx  # Single ambient layer (three CSS layers, no SVG)
    chrome/
      ChromeControls.tsx      # Client: theme toggle + back-to-top, fixed bottom-right
      SmoothScroll.tsx        # Client: Lenis instance + getLenis(); route scroll reset
      ThemeScript.tsx         # Inline pre-paint script that sets .dark on <html>
    blog/
      MarkdownRenderer.tsx
      markdown/               # ReactMarkdown component overrides
        Heading.tsx           # H1-H4 with slug anchors
        Text.tsx              # P, Link (external ↗), Strong, Em, Hr, Blockquote
        List.tsx
        Code.tsx              # Inline + Pre with copy button
        Media.tsx
        Table.tsx
        types.ts
        utils.ts              # generateHeadingId
        index.ts
    guestbook/
      GuestbookForm.tsx       # Client: useActionState sign form + honeypot
      GuestbookWall.tsx       # Server: renders approved signatures
      AdminLogin.tsx          # Client: password form
      AutoApproveToggle.tsx   # Client: auto-publish switch (useOptimistic)
      EntryRow.tsx            # Client: one signature + approve / two-step delete
  constants/
    blog.ts                   # BLOG_CONFIG (content dir + file extensions only)
    theme.ts                  # localStorage key + toggle event name
    guestbook.ts              # GUESTBOOK_CONFIG (length caps, honeypot field name)
  lib/
    blog.ts                   # getAllPosts, getPostBySlug, getAllPostSlugs (all React.cache wrapped)
    guestbook.ts              # getGuestbookEntries (React.cache) + API config helpers
    guestbook-admin.ts        # Server-only moderation client + HMAC session cookie
    utils.ts                  # cn() + formatJournalDate + formatRelativeDate
  types/
    blog.ts                   # JournalPost, PostFrontmatter, MarkdownRendererProps
    guestbook.ts              # GuestbookEntry, GuestbookFormState
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
- The custom palette tokens (`--zen-clay`, `--zen-gold`, `--zen-gold-warm`,
  `--zen-mist`, `--zen-rose`, `--zen-sage`, `--zen-ink`, `--zen-ink-warm`) live
  in `globals.css` only, in both `:root` and `.dark`. **Nothing currently uses
  them** — they are not mapped into the `@theme inline` block, so there is no
  `bg-zen-clay` utility; reaching one means `var(--zen-clay)` or adding it to
  `@theme` first. They are kept as the written-down palette, not because
  anything reads them.
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
- Headlines use `font-display`, which is **Fraunces** — not Playfair Display.
  Playfair was replaced because it read as solemn; this file claimed both in two
  different places for a while.
- Kicker labels use the `.kicker` utility: **body face (Nunito), lowercase,
  semibold, ~0.95rem, near-zero tracking**, in the primary rose-plum at full
  opacity. It has been walked back twice — first from 0.35em metallic gold at
  85% (read like a luxury watch advert, failed contrast at 3.42:1), then from
  mono + uppercase + `0.2em` tracking, which the owner rejected on sight as
  "not cute".
- **No uppercase, wide-tracked micro-labels anywhere.** That treatment was swept
  out of all twelve chrome files in one pass — back links, buttons, badges,
  timestamps, counters. It reads as a luxury brand, not as this site, and mixing
  it across the mono and body faces made two identical "← journal" links render
  in visibly different typefaces. Chrome is lowercase, normal tracking, body
  face. **Mono (Space Grotesk) is for code blocks only** — do not put it on a UI
  label.
- The site uses exactly **two faces in the chrome**: Fraunces (`font-display`)
  for headlines, Nunito for everything else. Fraunces loads upright only — do
  not set it in italic without adding `style: ["normal", "italic"]` to the
  loader in `layout.tsx`, or you get a synthesised oblique that looks broken on
  a high-`SOFT` serif.
- Apply `display-balance` (`text-wrap: balance`) on display headlines, `read-prose` (`text-wrap: pretty`) on body paragraphs.

### Components
- There are currently **no shadcn primitives** — all nine were installed but never imported, so they and their five Radix dependencies were removed. `components.json` remains, so `npx shadcn@latest add <name>` still works and will recreate `src/components/ui/`. Only add one when something actually uses it.
- `ErrorBoundary.tsx` was **deleted** — nothing imported it, and `app/error.tsx`
  plus `app/global-error.tsx` already cover both boundary levels. Do not re-add
  a class-based boundary unless something genuinely needs one.
- **`.zen-card` and `.kicker` live in `@layer components`** (fixed 2026-07-22).
  Tailwind v4 emits utilities into the later `utilities` layer, so a `bg-*` /
  `border-*` utility on a `.zen-card` element now **wins**, which is what call
  sites always meant. While these rules were unlayered they outranked every
  utility and such classes were silently discarded — that cost one admin
  highlight and one pending-row tint, both of which had to be hand-built from
  scratch. Both are now plain `zen-card` + tint utilities. Two dead `bg-muted`
  classes on the 404 and error cards were **removed** rather than allowed to
  activate, so those pages look exactly as before. If you want them muted, add
  it back deliberately — it will now render.
  - The `pre, code { box-shadow: none !important }` reset stays **unlayered on
    purpose**: `!important` reverses layer precedence, so layering it would make
    it outrank an important utility instead of yielding to one.
- For markdown overrides, edit the matching file in `src/components/blog/markdown/`.
- For loading UI, use the streaming `loading.tsx` convention. Skeletons are written inline in each `loading.tsx`; there is no shared `LoadingStates.tsx` (this file used to claim one).

### Animation
- Framer Motion is used for entrance animations only — don't add hover-state JS animations when CSS `transition` works.
- Respect `prefers-reduced-motion`. The global atmosphere already does; new motion-heavy components should too.

### Background
- The site has **one** ambient background layer: `<AtmosphereBackground />` in the root layout.
- Do NOT add per-page background components, particle systems, or extra orb layers. The old `ConstellationBackground`, `MysticalBackground`, `FloatingElements`, and `ParticleBackground` have been deliberately deleted — do not resurrect them.
- The atmosphere is **three layers**: `.atmosphere-base`, `.atmosphere-mesh`, `.atmosphere-grain`. It previously had eleven, including three SVG aurora ribbons and a two-wave river. That machinery produced most of the mysterious, watched feeling and cost a full-screen SVG plus several large blur filters. Warmth comes from colour, not moving parts — do not add layers back.

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
- `GUESTBOOK_ADMIN_TOKEN` — bearer token for the moderation endpoints, and the
  HMAC key backing the admin session cookie. Rotating it invalidates every
  session.
- `GUESTBOOK_ADMIN_PASSWORD` — what you type at `/guestbook/admin`

All four guestbook vars are **server-only**. Never give them a `NEXT_PUBLIC_`
prefix — the tokens grant write and moderation access. If the API URL or token
is missing, `/guestbook` degrades to the old "paused" notice instead of
erroring, which is why preview deployments without them still build fine.

(This section listed only the first three for a long time, while the Guestbook
section below referred to `GUESTBOOK_ADMIN_TOKEN` as though it had been
introduced here.)

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

- **Auto-publish is a runtime setting in Postgres, not an env var.** It lives in
  the `settings` table under `auto_approve`, is read through `GET/POST
  /admin/settings`, and is toggled from `/guestbook/admin`. `AUTO_APPROVE` in
  the VPS `.env` only **seeds** the row the very first time it is created
  (`ON CONFLICT DO NOTHING`) — after that the DB wins, so editing `.env` and
  restarting does **nothing**. Currently ON: signatures publish instantly.
  With it on, the honeypot, rate limit, link block, slur filter and mash filter
  are the only defences, so spam lands on the wall until deleted.
- **The publish-timing copy is derived, never hardcoded.** `/guestbook` resolves
  the live setting server-side and passes one boolean to the form; the success
  message branches on the `status` the API actually returned. Three surfaces
  previously each carried their own hardcoded promise and contradicted each
  other. Do not reintroduce a literal "goes up instantly" string anywhere.
- **The content filters have two failure modes that already bit once.** Keep
  both in mind before touching them:
  - `isMashed` must **not** divide unique-character count by unbounded length —
    distinct characters top out around 40 in real English, so a plain ratio
    rejects every ordinary message past ~165 chars. The denominator is capped.
  - `hasBlockedWord` splits into `BLOCKED_SUBSTRINGS` (long, unambiguous slurs,
    matched against the space-stripped projection so `n i g g e r` and
    `niiiigger` are caught) and `BLOCKED_TOKENS` (short/ambiguous terms, matched
    as **whole words only**). Collapsing them back into one substring list
    re-breaks "raccoon", "cocoon", "flame retardant" and "a chink in the
    armour" — this was live for hours.
- **The API hostname uses sslip.io** (`senbon.<ip>.sslip.io`), which resolves any
  hostname containing an IP to that IP. It needs **no DNS records** — `senbon.ch`
  DNS is untouched — and gives Caddy a real hostname to get a Let's Encrypt cert
  for, which a bare IP cannot. Only Vercel's server ever calls it; it never
  appears in HTML. **Trade-off:** it is a third-party dependency. If sslip.io
  stops resolving, signing degrades to the "it's down" card. Swapping to a real
  `api.senbon.ch` A record is a five-minute change (record, Caddyfile hostname,
  `GUESTBOOK_API_URL`).
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
---
```

The site rebuilds on commit. Posts are sorted newest-first. Slug = filename without extension.

**Those four keys are the whole schema.** `PostFrontmatter` in `src/types/blog.ts`
declares exactly `title`, `excerpt`, `publishedAt`, `tags`, and `parsePostFile`
reads nothing else. This section used to document `featured:` and `hero:` — both
were **silently ignored**, since neither the type nor the parser has ever known
about them. If you want either, add it to the type, the parser and the page
first.

- Heading anchors are generated from H2–H4 by `generateHeadingId`. Duplicate
  slugs are auto-suffixed (`-2`, `-3`). There is no rendered TOC consuming them.

---

## Existing user-facing features

- **Dark mode toggle**, bottom-right, or press **`d`**. Class-based (`.dark` on
  `<html>`), stored in `localStorage` under `senbon-theme`. An inline script in
  `<head>` (`ThemeScript`) sets the class before first paint so there is no
  light flash. Until 2026-07-22 nothing ever set `.dark`, so the whole evening
  palette was unreachable dead CSS.
  - **The OS preference is the default and stays live.** With no stored choice,
    changing the system theme changes the site immediately, not just on the next
    reload. An explicit toggle wins from then on.
  - `d` is a bare key, so the handler bails on modifiers, on IME composition and
    on `INPUT`/`TEXTAREA`/`SELECT`/`contenteditable` targets — otherwise it
    would fire while someone types "d" into the guestbook.
- Back-to-top button, appears past 600px, bottom-right beside the toggle.
- Relative time on cards ("3 weeks ago"), absolute date on hover.

**Deliberately absent** — these were listed here as features but did not exist
in the code, and several were removed on purpose. Do not "restore" them without
being asked:

- No command palette (⌘K). Three routes do not need a launcher.
- No reading-progress bar. Entries run a few hundred words.
- No search, tag filter or load-more on `/journal` — deleted as blog-platform
  furniture; see the comment at the top of `journal/page.tsx`.
- No featured-post strip, no prev/next links, no TOC, no reading-time estimate,
  no hero images.
- External link arrows (↗) on links in markdown.
- Skip-to-content link for keyboard users.
- Guestbook signing at `/guestbook` — instant, rate-limited, honeypot-protected.
- Copy button on every code block (appears on hover).
- Themed 404 + error boundaries (route segment + global).
- Warm ambient background (three CSS layers, no SVG).

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

- **`React.cache` wraps `getAllPosts`, `getPostBySlug`, `getAllPostSlugs`** so the metadata and page render call the same function once per request. (`getAdjacentPosts` was also wrapped until it was deleted on 2026-07-22 as an unimported leftover of prev/next navigation.)
- **`optimizePackageImports`** in `next.config.ts` covers exactly `lucide-react`, `react-markdown`, `remark-gfm`, `rehype-highlight`, `dayjs` — keeps bundle small even with deep barrel imports. (It never covered `framer-motion` or `date-fns`; neither package is installed.)
- **`useSyncExternalStore`** is how `ChromeControls` reads both the theme class and scroll position. Don't replace it with a `useEffect + setState` pattern — React 19's lint rule will scream and the hydration story breaks. (This note used to name `CommandPalette`, which has never existed in this codebase.)
- **The atmosphere is intentionally minimal.** The old SVG ribbon/river system and its seamless-loop path geometry were deleted, not broken. If a background feels too static, adjust colour and the mesh drift — do not reintroduce moving layers.
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

These were applied in commits during the spring 2026 polish pass. This section
used to point at a journal entry `skills-as-companions.md` "and adjacent posts"
for context — there is exactly one entry in `content/journal/`, and it is the
one explaining that the previous sixteen were deleted with no archive.

---

## Owner

**Dominik Könitzer** — [github.com/dominikkoenitzer](https://github.com/dominikkoenitzer)
