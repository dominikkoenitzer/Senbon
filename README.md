<div align="center">

# 千本 · Senbon Garden

### A digital garden. One thousand entries. The story remains untold.

A quiet, zen-themed personal **journal and guestbook** — markdown entries, an ambient flowing background, and a small place for visitors to leave a mark.

[![CI](https://github.com/dominikkoenitzer/Senbon/actions/workflows/ci.yml/badge.svg)](https://github.com/dominikkoenitzer/Senbon/actions/workflows/ci.yml)
[![Live](https://img.shields.io/badge/live-senbon.ch-1f2937?logo=vercel&logoColor=white)](https://senbon.ch)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)

</div>

---

> [!NOTE]
> Senbon is **deliberately un-indexed**. The live site asks search engines and AI crawlers not to index it (`robots.ts` + `noindex` headers), and it carries no OG/SEO metadata. It's a private garden that happens to be open source.

## Table of contents

- [About](#about)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Writing a journal entry](#writing-a-journal-entry)
- [Project structure](#project-structure)
- [Privacy](#privacy)
- [Deployment & CI/CD](#deployment--cicd)
- [Author](#author)

## About

Senbon (千本, "one thousand") is a personal digital garden: a place to publish long-form journal entries and let visitors sign a guestbook. It leans into atmosphere — an aurora-and-river background, editorial typography, and unhurried motion — while staying fast and accessible.

Journal entries are plain markdown files committed to the repo. The guestbook is backed by serverless  with light moderation tools. There is no CMS and no third-party tracking.

## Features

- **Journal** — markdown entries with frontmatter, a featured strip, search across titles, excerpts, and tags, tag filtering, and load-more pagination.
- **Reading experience** — auto-generated table of contents, a reading-progress hairline, reading-time estimates, prev/next navigation, relative dates ("3 weeks ago"), and copy buttons on code blocks.
- **Command palette** — <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>/</kbd>) to jump between pages.
- **Guestbook** — leave a signed message, backed by  serverless , with a honeypot, per-IP rate limiting, and hashed IPs for privacy.
- **Admin moderation** — a token-gated `/admin` panel to approve or remove entries (optional auto-approve).
- **Atmosphere** — a single ambient aurora + flowing-river background (CSS + SVG), with `prefers-reduced-motion` respected.
- **Polish** — themed 404 and error boundaries, back-to-top, per-route scroll restoration, and a skip-to-content link.

## Tech stack

- **[Next.js 16](https://nextjs.org/)** — App Router, Turbopack, React Server Components
- **[React 19](https://react.dev/)** + **[TypeScript 5](https://www.typescriptlang.org/)**
- **[Tailwind CSS 4](https://tailwindcss.com/)** with `@theme inline` tokens + **[shadcn/ui](https://ui.shadcn.com/)** (Radix-backed) primitives
- **[Framer Motion](https://www.framer.com/motion/)** for entrance animations
- **[react-markdown](https://github.com/remarkjs/react-markdown)** + `rehype-highlight` + `remark-gfm` for entry rendering
- **[react-hook-form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** for forms and API validation
- **[ serverless ](https://.tech/)** for the guestbook
- **[Vercel](https://vercel.com/)** hosting + first-party `@vercel/analytics`

Package manager: **pnpm** (do not introduce an `npm`/`yarn` lockfile).

## Getting started

**Prerequisites:** [Node.js](https://nodejs.org/) 20+ and [pnpm](https://pnpm.io/) 10+.

```bash
# Clone
git clone https://github.com/dominikkoenitzer/Senbon.git
cd Senbon

# Install dependencies
pnpm install

# Configure environment (see the table below)
cp env.example .env.local

# Start the dev server → http://localhost:3000
pnpm dev
```

The **journal** runs with no configuration — it reads markdown from `content/journal/`. The **guestbook** needs a  connection (`DATABASE_URL`); without it, journal browsing still works and guestbook calls simply fail gracefully.

## Environment variables

Copy `env.example` to `.env.local` and fill in what you need.

| Variable | When | Purpose |
|---|---|---|
| `DATABASE_URL` / `_URL` | guestbook | / connection (provided by Vercel's  integration in prod) |
| `DATABASE_URL_UNPOOLED` | guestbook | Non-pooled connection for one-shot writes |
| `GUESTBOOK_ADMIN_TOKEN` | guestbook | Gates `/admin` and the admin API routes |
| `IP_HASH_SALT` | recommended | HMAC salt for hashing visitor IPs (falls back to plain SHA-256 if unset) |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical site URL |
| `GUESTBOOK_AUTO_APPROVE` | optional | `true` (default) — set `false` to require moderation |
| `GUESTBOOK_DISABLE_RATE_LIMIT` | optional | `false` (default) — set `true` to skip the per-IP rate limit in dev |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the Next.js dev server on [http://localhost:3000](http://localhost:3000) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |

## Writing a journal entry

Create a markdown file at `content/journal/<slug>.md` with frontmatter:

```yaml
---
title: "Entry Title"
excerpt: "One-line summary that appears on the index card."
publishedAt: "2026-05-26"
tags:
  - design
  - performance
featured: true                          # optional — surfaces on the /journal featured strip
hero: "/images/journal/your-image.jpg"  # optional — only rendered if the file exists in public/
---
```

The slug is the filename without its extension. Posts sort newest-first, the table of contents is generated from `H1`–`H4` headings, and a missing `hero` image degrades silently. The site rebuilds on commit.

## Project structure

```
content/journal/        # Markdown journal entries (frontmatter + body)
src/
├── app/                # App Router: home, journal, guestbook, admin, api/, robots
│   ├── journal/        # Index + [slug] entry pages (server components)
│   ├── guestbook/      # Guestbook page + form
│   ├── admin/          # Token-gated moderation panel
│   └── api/            # auth + guestbook routes (GET/POST/DELETE/approve)
├── components/         # AtmosphereBackground, CommandPalette, blog/, guestbook/, ui/
├── constants/          # blog + animation config
├── hooks/              # intersection observer (TOC scroll-spy), smooth scroll
├── lib/                # blog (posts), /db (guestbook), auth, toc, utils
└── types/              # JournalPost and friends
```

## Privacy

Senbon is built to stay out of the public index:

- `robots.ts` denies all search engines and AI crawlers (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, CCBot, and others), reinforced by `noindex` response headers and root metadata.
- No OG images, sitemap, or structured data — the site is intentionally not optimized for discovery.
- The only telemetry is **first-party Vercel Analytics** (no third-party trackers).
- Guestbook IP addresses are one-way hashed, and user-submitted content is never logged.

## Deployment & CI/CD

Senbon deploys on **[Vercel](https://vercel.com/)** (live at **[senbon.ch](https://senbon.ch)**). Provision a   database (via Vercel's integration) and set the environment variables above.

GitHub Actions:

- **[`ci.yml`](.github/workflows/ci.yml)** — on every push and pull request to `master`: install, **lint**, and **build** (no database required — the build prerenders static pages and leaves guestbook routes dynamic).
- **[`deploy.yml`](.github/workflows/deploy.yml)** — optional production deploy via the Vercel CLI, gated on the `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets; a no-op otherwise (Vercel's Git integration handles deploys by default).

[Dependabot](.github/dependabot.yml) keeps npm and GitHub Actions dependencies current weekly.

## Author

Made by **[Dominik Könitzer](https://github.com/dominikkoenitzer)** · [senbon.ch](https://senbon.ch)
