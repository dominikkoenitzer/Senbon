# Contributing

Thanks for taking an interest in **Senbon**. This guide covers local setup, the conventions the codebase follows, and how to get a change merged.

## Local setup

Requires [bun](https://bun.sh).

```bash
bun install
bun run dev        # http://localhost:3000
```

Copy `env.example` to `.env.local` for the guestbook. The API in `server/guestbook/api/` runs separately and needs PostgreSQL; its `Dockerfile` is the reference for how it is deployed.

## Before you open a pull request

Run the same gate that CI runs — all three must pass:

```bash
bun run lint
bun run test
bun run build
```

The guestbook API has its own tests beside its modules (`lib/*.test.js`). Anything touching auth, rate limiting, validation or moderation needs a test that pins the new behaviour — those four files are the security boundary and are covered on purpose.

## Code style

- **Next.js 16 App Router with Turbopack, React Server Components by default.** Reach for `"use client"` only when a component genuinely needs the browser; the home page ships no JavaScript of its own and should stay that way.
- **Tailwind v4, configured entirely in `globals.css`.** There is no `tailwind.config.*`.
- **The site is light-only.** The theme system was removed deliberately — do not reintroduce a dark variant, a toggle, or a `prefers-color-scheme` block.
- **`lucide-react` v1 dropped its brand icons.** Brand marks live in `src/components/icons/` and are drawn to lucide's conventions (1em square, `currentColor`).
- **Fail closed.** The rate limiter, the session check and the validators are all written so that a missing input is a rejection rather than a bypass. Keep new code on that side of the line, and say so in a comment when it is not obvious.

## Commits and pull requests

- Keep commits focused, with a short imperative subject.
- Describe what you changed and how you verified it.

## Reporting bugs and requesting features

Use the issue forms under **New issue**. For anything security-sensitive, do **not** open a public issue — follow [SECURITY.md](SECURITY.md) instead.
