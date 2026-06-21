<div align="center">

# 千本 · Senbon Garden

### A digital garden. One thousand entries. The story remains untold.

A quiet, zen-themed personal **journal** — markdown entries, an ambient flowing background, and an unhurried reading experience.

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
- [Scripts](#scripts)
- [Writing a journal entry](#writing-a-journal-entry)
- [Project structure](#project-structure)
- [Privacy](#privacy)
- [Deployment & CI/CD](#deployment--cicd)
- [Author](#author)

## About

Senbon (千本, "one thousand") is a personal digital garden: a place to publish long-form journal entries. It leans into atmosphere — an aurora-and-river background, editorial typography, and unhurried motion — while staying fast and accessible.

Journal entries are plain markdown files committed to the repo. There is no CMS and no third-party tracking.

> The site also has a **guestbook** page, but signing is **currently paused** — the page shows a short notice while its backend is being re-tended.

## Features

- **Journal** — markdown entries with frontmatter, a featured strip, search across titles, excerpts, and tags, tag filtering, and load-more pagination.
- **Reading experience** — auto-generated table of contents, a reading-progress hairline, reading-time estimates, prev/next navigation, relative dates ("3 weeks ago"), and copy buttons on code blocks.
- **Command palette** — <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>/</kbd>) to jump between pages.
- **Guestbook** — a quiet wall for visitors to sign (currently paused — the page shows a "resting" notice).
- **Atmosphere** — a single ambient aurora + flowing-river background (CSS + SVG), with `prefers-reduced-motion` respected.
- **Polish** — themed 404 and error boundaries, back-to-top, per-route scroll restoration, and a skip-to-content link.

## Tech stack

- **[Next.js 16](https://nextjs.org/)** — App Router, Turbopack, React Server Components
- **[React 19](https://react.dev/)** + **[TypeScript 5](https://www.typescriptlang.org/)**
- **[Tailwind CSS 4](https://tailwindcss.com/)** with `@theme inline` tokens + **[shadcn/ui](https://ui.shadcn.com/)** (Radix-backed) primitives
- **[Framer Motion](https://www.framer.com/motion/)** for entrance animations
- **[react-markdown](https://github.com/remarkjs/react-markdown)** + `rehype-highlight` + `remark-gfm` for entry rendering
- **[Vercel](https://vercel.com/)** hosting + first-party `@vercel/analytics`

Package manager: **Bun** (do not introduce an `npm`/`yarn`/`pnpm` lockfile).

## Getting started

**Prerequisites:** [Bun](https://bun.sh/) 1.1.39+ (this repo pins `1.3.14` via `.bun-version`). Bun is the runtime and package manager.

```bash
# Clone
git clone https://github.com/dominikkoenitzer/Senbon.git
cd Senbon

# Install dependencies
bun install

# Start the dev server → http://localhost:3000
bun run dev
```

No configuration is required to run the journal locally — entries are read from `content/journal/`. The only optional environment variable is `NEXT_PUBLIC_SITE_URL` (see `env.example`).

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the Next.js dev server on [http://localhost:3000](http://localhost:3000) |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run lint` | Run ESLint |

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
├── app/                # App Router: home, journal, guestbook, robots
│   └── journal/        # Index + [slug] entry pages (server components)
├── components/         # AtmosphereBackground, CommandPalette, blog/, ui/
├── constants/          # blog + animation config
├── hooks/              # intersection observer (TOC scroll-spy), smooth scroll
├── lib/                # blog (posts), toc, utils
└── types/              # JournalPost and friends
```

## Privacy

Senbon is built to stay out of the public index:

- `robots.ts` denies all search engines and AI crawlers (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, CCBot, and others), reinforced by `noindex` response headers and root metadata.
- No OG images, sitemap, or structured data — the site is intentionally not optimized for discovery.
- The only telemetry is **first-party Vercel Analytics** (no third-party trackers).

## Deployment & CI/CD

Senbon deploys on **[Vercel](https://vercel.com/)** (live at **[senbon.ch](https://senbon.ch)**).

GitHub Actions:

- **[`ci.yml`](.github/workflows/ci.yml)** — on every push and pull request to `master`: install, **lint**, and **build**.
- **[`deploy.yml`](.github/workflows/deploy.yml)** — optional production deploy via the Vercel CLI, gated on the `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets; a no-op otherwise (Vercel's Git integration handles deploys by default).

[Dependabot](.github/dependabot.yml) keeps npm and GitHub Actions dependencies current weekly.

## Author

Made by **[Dominik Könitzer](https://github.com/dominikkoenitzer)** · [senbon.ch](https://senbon.ch)
