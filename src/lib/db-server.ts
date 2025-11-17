import { neon } from "@neondatabase/serverless";
import type { GuestbookEntry, GuestbookStatus } from "./db";

// Initialize Neon client
const getSql = () => {
  // Try all possible environment variable names in order of preference
  const possibleVars = [
    'DATABASE_URL_UNPOOLED',
    'POSTGRES_URL_NON_POOLING',
    'DATABASE_URL',
    'POSTGRES_URL',
    'POSTGRES_POSTGRES_URL',
    'POSTGRES_DATABASE_URL',
    'POSTGRES_POSTGRES_URL_NON_POOLING',
    'POSTGRES_DATABASE_URL_NON_POOLING',
  ];
  
  let connectionString: string | undefined;
  let foundKey: string | undefined;
  
  for (const key of possibleVars) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      connectionString = value;
      foundKey = key;
      break;
    }
  }
    
  if (!connectionString) {
    const availableKeys = Object.keys(process.env)
      .filter(k => k.includes('DATABASE') || k.includes('POSTGRES'))
      .join(', ');
    console.error(`[getSql] No database connection string found. Available env vars: ${availableKeys || 'none'}`);
    throw new Error("DATABASE_URL or POSTGRES_URL environment variable is required");
  }
  
  console.log(`[getSql] Using connection string from: ${foundKey}`);
  
  try {
    const sql = neon(connectionString);
    return sql;
  } catch (error) {
    console.error("[getSql] Failed to initialize Neon client:", error);
    throw error;
  }
};

function isDbConfigured() {
  // Check all possible environment variable names that Neon/Vercel might use
  const possibleVars = [
    'DATABASE_URL_UNPOOLED',
    'POSTGRES_URL_NON_POOLING',
    'DATABASE_URL',
    'POSTGRES_URL',
    'POSTGRES_POSTGRES_URL',
    'POSTGRES_DATABASE_URL',
    'POSTGRES_URL_NON_POOLING',
    'POSTGRES_POSTGRES_URL_NON_POOLING',
    'POSTGRES_DATABASE_URL_NON_POOLING',
  ];
  
  const found = possibleVars.find(key => {
    const value = process.env[key];
    return value && value.trim().length > 0;
  });
  
  if (!found) {
    const availableKeys = Object.keys(process.env)
      .filter(k => k.includes('DATABASE') || k.includes('POSTGRES'))
      .join(', ');
    console.warn(`[isDbConfigured] Database not configured. Available env vars: ${availableKeys || 'none'}`);
  } else {
    console.log(`[isDbConfigured] Database configured using: ${found}`);
  }
  
  return Boolean(found);
}

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
  if (!isDbConfigured()) return;

  try {
    const sql = getSql();
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
    // Ignore DDL errors if restricted
  }
}

function normalizeEntry(item: {
  id: string;
  name?: string | null;
  created_at?: string;
  createdAt?: string;
  approved?: boolean;
  rejected?: boolean;
  message: string;
  updated_at?: string | null;
  edited?: boolean;
}): GuestbookEntry {
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
  if (!isDbConfigured()) {
    console.warn("[fetchGuestbookEntriesServer] Database not configured");
    return includePending
      ? FALLBACK_ENTRIES
      : FALLBACK_ENTRIES.slice(0, limit || 3);
  }

  try {
    await ensureTable();
    const sql = getSql();
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
      const result = await sql`
        SELECT id, name, message, created_at, updated_at, edited, approved, rejected
        FROM guestbook
        WHERE approved = TRUE AND rejected = FALSE
        ORDER BY created_at DESC, id DESC
        LIMIT ${limit}
      `;
      rows = result as Row[];
    } else {
      const result = await sql`
        SELECT id, name, message, created_at, updated_at, edited, approved, rejected
        FROM guestbook
        WHERE approved = TRUE AND rejected = FALSE
        ORDER BY created_at DESC, id DESC
      `;
      rows = result as Row[];
    }

    console.log(`[fetchGuestbookEntriesServer] Fetched ${rows.length} rows from database`);
    const items = rows.map(normalizeEntry);

    if (includePending) {
      const pendingRows = await sql`
        SELECT id, name, message, created_at, updated_at, edited, approved, rejected
        FROM guestbook
        WHERE approved = FALSE AND rejected = FALSE
        ORDER BY created_at ASC
      `;

      const pendingItems = (pendingRows as Row[]).map(normalizeEntry);
      return [...pendingItems, ...items];
    }

    return items;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[fetchGuestbookEntriesServer] Database query failed:", errorMessage);
    console.error("[fetchGuestbookEntriesServer] Full error:", error);

    return includePending
      ? FALLBACK_ENTRIES
      : FALLBACK_ENTRIES.slice(0, limit || 3);
  }
};
