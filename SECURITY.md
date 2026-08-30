# Security Policy

## Reporting a vulnerability

Please report security issues **privately**. Don't open a public GitHub issue for anything security-sensitive.

- Preferred: open a [private security advisory](https://github.com/dominikkoenitzer/Senbon/security/advisories/new) on this repository.
- Alternatively: email **dominikkoenitzer@users.noreply.github.com** with the details.

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

**The guestbook** is the real surface. Its API is a separate external service whose source is not in this repo; the parts that live here are the admin session, the sign-in throttle, and how visitor-authored entries are rendered back. Reports most likely to matter:

- **Session forgery.** Admin sessions are HMAC-signed with the server-only admin token and compared with `timingSafeEqual` behind a length guard (`src/lib/guestbook-admin.ts`). Anything that forges a session, or that leaks the signing secret, is the highest-severity bug in this repo.
- **Throttle / rate-limit bypass.** The sign-in throttle and the guestbook abuse key are derived from a trusted client-IP source, not a client-spoofable one. A path that lets an attacker rotate a header for a fresh bucket, or that lets one visitor exhaust another's, is in scope (the volume limiter itself lives in the external API).
- **Stored injection through an entry.** Entries are visitor-authored and rendered back to every reader; anything that renders as markup rather than escaped text in another visitor's page is in scope.
- **Moderation bypass** that publishes an entry without approval when auto-approve is off.

Out of scope: the moderation word list is a judgement call, not a vulnerability. Open a normal issue for a false positive or a gap.
