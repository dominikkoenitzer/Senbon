---
title: "Database Migration — From Memory to Persistence"
excerpt: "The guestbook moves from ephemeral storage to Neon's persistent garden. Messages now survive the winter of server restarts."
publishedAt: "2025-11-17"
tags:
  - database
  - guestbook
  - migration
  - neon
  - persistence
hero: "/images/journal/database-migration.jpg"
---

The guestbook lived in memory. Beautiful while the server ran, but gone with each restart. Like morning dew that evaporates, messages disappeared when the server slept. They needed a persistent garden where they could root and grow.

## The Migration Path

The journey from `@vercel/postgres` to `@neondatabase/serverless` required careful translation. Each query needed conversion. Each connection string needed verification. The database schema remained unchanged — only the driver shifted.

```typescript
// Old: Vercel Postgres
import { sql } from '@vercel/postgres';
const result = await sql`SELECT * FROM guestbook`;

// New: Neon Serverless
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const result = await sql`SELECT * FROM guestbook`;
```

The syntax is nearly identical, but the connection lives differently. Neon's serverless driver connects on-demand, perfect for edge functions. Each request opens a connection, queries, then closes. Like a gate that opens only when needed.

## The Approval System Removal

The guestbook originally required approval. Messages waited in a pending state, like stones waiting to be placed. But the garden needed to flow more naturally. Visitors should see their messages immediately, not wait for moderation.

The default changed: `approved BOOLEAN NOT NULL DEFAULT TRUE`. Now every message appears instantly, like water flowing directly into the stream. The admin panel remains for deletion, but approval is automatic.

## The Environment Variable Quest

Production had a problem: the database wasn't connecting. Logs showed `Database not configured. Available env vars: none`. The connection strings existed in Neon, but Vercel wasn't seeing them.

The detection logic improved to check nine different possible variable names:
- `DATABASE_URL_UNPOOLED` (preferred for serverless)
- `POSTGRES_URL_NON_POOLING`
- `DATABASE_URL`
- `POSTGRES_URL`
- And five more variations

The code now tries each one, logging which it finds. Like checking multiple gates to find the one that's open.

```typescript
const possibleVars = [
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
  'DATABASE_URL',
  'POSTGRES_URL',
  // ... more variations
];

const found = possibleVars.find(key => {
  const value = process.env[key];
  return value && value.trim().length > 0;
});
```

## The Refresh Button Removal

The guestbook had a refresh button. Users could click it to reload messages. But browser refresh should be enough. The page uses `dynamic = "force-dynamic"` and `revalidate = 0`, so each page load fetches fresh data from the server.

The refresh buttons were removed from both the public guestbook and admin panel. Now the interface is cleaner. Like removing an unnecessary step in a tea ceremony — the flow is more direct.

## The Message Length Fix

There was a mismatch: the form allowed 480 characters, but the API only accepted 280. Messages that passed client validation failed on the server. The limit was unified to 480 characters everywhere, like aligning stones in a path so they're all the same height.

## The Logging Improvement

When things break in production, logs are the only window into what's happening. Detailed logging was added throughout:

```typescript
console.log(`[POST /api/guestbook] Inserting entry: id=${id}`);
console.log(`[POST /api/guestbook] Successfully inserted entry: ${inserted[0].id}`);
console.warn(`[isDbConfigured] Database not configured. Available env vars: ${availableKeys}`);
```

Each log message is prefixed with its location, making it easy to trace the flow. Like leaving breadcrumbs in a forest — you can always find your way back.

## The Connection String Priority

Neon provides multiple connection strings. Pooled connections work for most cases, but unpooled connections are better for serverless functions. Unpooled connections were prioritized:

```typescript
const connectionString = 
  process.env.DATABASE_URL_UNPOOLED ||  // Best for serverless
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||           // Fallback
  process.env.POSTGRES_URL;
```

Like choosing the right tool for the task — unpooled for serverless, pooled for traditional servers.

## What Was Learned

Migration is about careful translation. Not changing what works, but moving it to a better home. The guestbook schema stayed the same. The queries stayed the same. Only the connection method changed.

Environment variables are fragile. They must be set correctly in each environment. Production, preview, development — each needs its own configuration. The code can check for them, but it can't create them.

Logging is essential. When production breaks, detailed logs are the only way to diagnose. Each function now logs its actions, making debugging possible even from afar.

The guestbook is now persistent. Messages root in the database, growing into a permanent record of visitors. Like stones placed in a garden — they remain, even when the server sleeps.

---

*The guestbook migrated. Messages persist. The garden remembers.*
