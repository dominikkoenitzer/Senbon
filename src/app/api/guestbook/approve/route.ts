export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

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

function getHeaderToken(req: NextRequest): string {
  const header = req.headers.get("x-admin-token") || "";
  if (header) return header.trim();

  const auth = req.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();

  const url = new URL(req.url);
  const qp = url.searchParams.get("token") || "";
  return qp.trim();
}

function requireAdmin(req: NextRequest): NextResponse | null {
  const provided = getHeaderToken(req);
  const expected = (process.env.GUESTBOOK_ADMIN_TOKEN || "").trim();

  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return null;
}

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
  } catch {
    // Ignore DDL errors if restricted
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || "pending").toLowerCase();

  await ensureTable();

  if (!isDbConfigured()) {
    return NextResponse.json({ items: [] });
  }

  try {
    const sql = getSql();
    const rows =
      status === "approved"
        ? await sql`
            SELECT id, name, message, created_at, updated_at, edited, approved, rejected
            FROM guestbook
            WHERE approved = TRUE AND rejected = FALSE
            ORDER BY created_at DESC, id DESC
          `
        : await sql`
            SELECT id, name, message, created_at, updated_at, edited, approved, rejected
            FROM guestbook
            WHERE approved = FALSE AND rejected = FALSE
            ORDER BY created_at ASC
          `;

    return NextResponse.json({ items: rows });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth) return auth;

  await ensureTable();

  if (!isDbConfigured())
    return NextResponse.json({ error: "no_db" }, { status: 400 });

  const body = await req.json().catch(() => ({} as { id?: string; approved?: boolean; rejected?: boolean }));

  const id = (body.id || "").trim();
  const approved = Boolean(body.approved);
  const rejected = body.hasOwnProperty("approved")
    ? !approved
    : Boolean(body.rejected);

  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  try {
    const sql = getSql();
    await sql`UPDATE guestbook SET approved = ${approved}, rejected = ${rejected} WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
