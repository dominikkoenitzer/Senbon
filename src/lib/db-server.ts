import { sql } from "@vercel/postgres";
import type { GuestbookEntry, GuestbookStatus } from "./db";

// Server-side database functions that directly query the database
// Use these in server components instead of making HTTP requests

function useDb() {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

// Hydrate POSTGRES_URL from various env var names
(function hydratePostgresEnv() {
  if (process.env.POSTGRES_URL) return;

  const directCandidates = [
    "POSTGRES_URL",
    "DATABASE_URL",
    "POSTGRES_POSTGRES_URL",
    "POSTGRES_DATABASE_URL",
    "POSTGRES_URL_NON_POOLING",
    "POSTGRES_POSTGRES_URL_NON_POOLING",
    "POSTGRES_DATABASE_URL_NON_POOLING",
  ] as const;

  for (const key of directCandidates) {
    const v = process.env[key as keyof NodeJS.ProcessEnv];
    if (v) {
      process.env.POSTGRES_URL = v;
      return;
    }
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (!value) continue;
    const k = key.toUpperCase();
    if (/_PRISMA_/.test(k) || /NO_SSL/.test(k)) continue;
    if (/^POSTGRES_.*_URL$/.test(k) || /^POSTGRES_.*_DATABASE_URL$/.test(k)) {
      process.env.POSTGRES_URL = value;
      return;
    }
  }
})();

async function ensureTable() {
  if (!useDb()) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS guestbook (
        id TEXT PRIMARY KEY,
        name TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        edited BOOLEAN NOT NULL DEFAULT FALSE,
        approved BOOLEAN NOT NULL DEFAULT TRUE,
        ip_hash TEXT,
        rejected BOOLEAN NOT NULL DEFAULT FALSE
      )
    `;

    await sql`ALTER TABLE guestbook ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT TRUE`;
    await sql`ALTER TABLE guestbook ADD COLUMN IF NOT EXISTS ip_hash TEXT`;
    await sql`ALTER TABLE guestbook ADD COLUMN IF NOT EXISTS rejected BOOLEAN NOT NULL DEFAULT FALSE`;

    await sql`CREATE INDEX IF NOT EXISTS guestbook_created_at_idx ON guestbook (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS guestbook_ip_hash_idx ON guestbook (ip_hash)`;
  } catch {
    // ignore to avoid failing requests if DDL is restricted
  }
}

function normalizeEntry(item: any): GuestbookEntry {
  const createdAt = item.created_at || item.createdAt || new Date().toISOString();
  const approved = item.approved !== false;
  const rejected = item.rejected === true;

  let status: GuestbookStatus = "approved";
  if (rejected) status = "rejected";
  else if (!approved) status = "pending";

  return {
    id: item.id,
    name: item.name || "Anonymous",
    message: item.message,
    status,
    createdAt,
    created_at: item.created_at,
    updated_at: item.updated_at,
    edited: item.edited,
    approved: item.approved,
    rejected: item.rejected,
  };
}

const FALLBACK_ENTRIES: GuestbookEntry[] = [];

export const fetchGuestbookEntriesServer = async ({
  includePending = false,
  limit,
}: {
  includePending?: boolean;
  limit?: number;
} = {}): Promise<GuestbookEntry[]> => {
  await ensureTable();

  if (!useDb()) {
    return includePending
      ? FALLBACK_ENTRIES
      : FALLBACK_ENTRIES.slice(0, limit || 3);
  }

  try {
    type Row = {
      id: string;
      name: string | null;
      message: string;
      created_at: string;
      updated_at: string | null;
      edited: boolean;
      approved: boolean;
      rejected: boolean;
    };

    let rows: Row[];

    if (limit) {
      const result = await sql<Row>`
        SELECT id, name, message, created_at, updated_at, edited, approved, rejected
        FROM guestbook
        WHERE approved = TRUE AND rejected = FALSE
        ORDER BY created_at DESC, id DESC
        LIMIT ${limit}
      `;
      rows = result.rows;
    } else {
      const result = await sql<Row>`
        SELECT id, name, message, created_at, updated_at, edited, approved, rejected
        FROM guestbook
        WHERE approved = TRUE AND rejected = FALSE
        ORDER BY created_at DESC, id DESC
      `;
      rows = result.rows;
    }

    const items = rows.map(normalizeEntry);

    if (includePending) {
      // Fetch pending entries too
      const { rows: pendingRows } = await sql<Row>`
        SELECT id, name, message, created_at, updated_at, edited, approved, rejected
        FROM guestbook
        WHERE approved = FALSE AND rejected = FALSE
        ORDER BY created_at ASC
      `;

      const pendingItems = pendingRows.map(normalizeEntry);
      return [...pendingItems, ...items];
    }

    return items;
  } catch (error) {
    // Silently fall back to demo entries if database is not configured
    // This is expected behavior when DATABASE_URL is not set
    if (!useDb()) {
      return includePending
        ? FALLBACK_ENTRIES
        : FALLBACK_ENTRIES.slice(0, limit || 3);
    }
    
    // Only log actual database errors (not missing config)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes("fetch failed") && !errorMessage.includes("ECONNREFUSED")) {
      console.warn("Database query failed, using fallback entries:", errorMessage);
    }
    
    return includePending
      ? FALLBACK_ENTRIES
      : FALLBACK_ENTRIES.slice(0, limit || 3);
  }
};

