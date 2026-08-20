# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — do not open a public GitHub issue for anything security-sensitive.

- Preferred: open a [private security advisory](https://github.com/dominikkoenitzer/Senbon/security/advisories/new) on this repository.
- Alternatively: email **dominik.koenitzer@gmail.com** with the details.

Please include:

- a description of the issue and its impact,
- steps to reproduce (a URL, request, or minimal example), and
- any relevant logs, screenshots, or proof of concept.

## What to expect

- An acknowledgement of your report, typically within a few days.
- An assessment and, where applicable, a fix deployed to the live site.
- Credit for the report if you would like it, once the issue is resolved.

## Scope

Two halves, with very different surfaces.

**The site** (`src/`) is a statically rendered journal. It has no accounts, stores nothing about a visitor, and is served `X-Robots-Tag: noindex` on purpose. Interesting reports here are content injection through journal Markdown, and dependency vulnerabilities with a path to the browser.

**The guestbook API** (`server/guestbook/api/`) is the real surface — a self-hosted Fastify service in front of PostgreSQL. It is where a report is most likely to matter:

- **Session forgery.** Admin sessions are HMAC-signed and compared with `timingSafeEqual` behind a length guard (`lib/auth.js`). Anything that forges a session, or that leaks the signing secret, is the highest-severity bug in this repository.
- **Rate limiting that fails open.** `lib/rate-limit.js` is deliberately written so a missing or spoofed client-IP header cannot switch limiting off — every caller lands in a bucket, unknown ones share `UNKNOWN_IP_BUCKET`. A path that escapes a bucket, or that lets one visitor exhaust another's, is in scope.
- **Stored injection through an entry.** Entries are visitor-authored and rendered back to every reader; anything that survives `lib/validation.js` and `lib/text.js` into another visitor's page is in scope.
- **SQL injection, or any query built by concatenation.**
- **Moderation bypass** that publishes an entry without approval when auto-approve is off.

Out of scope: the moderation word list is a judgement call, not a vulnerability — open a normal issue for a false positive or a gap.
