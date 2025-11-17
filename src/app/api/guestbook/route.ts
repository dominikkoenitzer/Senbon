export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

// Initialize Neon client
const getSql = () => {
  // Try unpooled connection first (better for serverless), then pooled, then any DATABASE_URL
  const connectionString = 
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL;
    
  if (!connectionString) {
    console.error("[getSql] No database connection string found. Available env vars:", 
      Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES')).join(', '));
    throw new Error("DATABASE_URL or POSTGRES_URL environment variable is required");
  }
  
  try {
    const sql = neon(connectionString);
    return sql;
  } catch (error) {
    console.error("[getSql] Failed to initialize Neon client:", error);
    throw error;
  }
};

type GuestbookRow = {
  id: string;
  name: string | null;
  message: string;
  created_at: string;
  updated_at: string | null;
  edited: boolean;
};

const memory: Array<
  GuestbookRow & { ip_hash?: string; approved?: boolean; rejected?: boolean }
> = [];

const MAX_LIMIT = 50;
const MAX_MESSAGE_LENGTH = 480;
const RATE_LIMIT_WINDOW_MS = 30_000;

function isDbConfigured() {
  const hasDb = Boolean(
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL
  );
  
  if (!hasDb) {
    console.warn("[isDbConfigured] Database not configured. Check environment variables.");
  }
  
  return hasDb;
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

function isAutoApprove() {
  const v = (process.env.GUESTBOOK_AUTO_APPROVE || "true").toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function isRateLimitEnabled() {
  const v = (process.env.GUESTBOOK_DISABLE_RATE_LIMIT || "false").toLowerCase();
  const disabled = v === "1" || v === "true" || v === "yes";
  return !disabled;
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

    await sql`CREATE INDEX IF NOT EXISTS guestbook_created_at_idx ON guestbook (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS guestbook_ip_hash_idx ON guestbook (ip_hash)`;
  } catch {
    // Ignore DDL errors if restricted
  }
}

function getClientIpHash(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const real = req.headers.get("x-real-ip") || "";
  const cf = req.headers.get("cf-connecting-ip") || "";
  const ip = (fwd.split(",")[0] || real || cf || "").trim();
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export async function GET(req: NextRequest) {
  if (!isDbConfigured()) {
    console.warn("[GET /api/guestbook] Database not configured, using memory");
    const { searchParams } = new URL(req.url);
    const parsedLimit = parseInt(searchParams.get("limit") || "10", 10);
    const parsedOffset = parseInt(searchParams.get("offset") || "0", 10);
    const limit = Math.min(
      Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 10, 1),
      MAX_LIMIT,
    );
    const offset = Math.max(
      Number.isFinite(parsedOffset) ? parsedOffset : 0,
      0,
    );

    const items = memory
      .slice()
      .filter((a) => a.approved !== false && a.rejected !== true)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(offset, offset + limit);

    return NextResponse.json({ items });
  }

  try {
    await ensureTable();
    const sql = getSql();
    const { searchParams } = new URL(req.url);
    const parsedLimit = parseInt(searchParams.get("limit") || "10", 10);
    const parsedOffset = parseInt(searchParams.get("offset") || "0", 10);
    const limit = Math.min(
      Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 10, 1),
      MAX_LIMIT,
    );
    const offset = Math.max(
      Number.isFinite(parsedOffset) ? parsedOffset : 0,
      0,
    );

    console.log(`[GET /api/guestbook] Querying database with limit=${limit}, offset=${offset}`);
    const rows = await sql`
      SELECT id, name, message, created_at, updated_at, edited, approved, rejected
      FROM guestbook
      WHERE approved = TRUE AND rejected = FALSE
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as (GuestbookRow & { approved: boolean; rejected: boolean })[];

    console.log(`[GET /api/guestbook] Returning ${rows.length} items`);
    return NextResponse.json({ items: rows });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[GET /api/guestbook] Database error:", errorMessage);
    if (errorStack) console.error("[GET /api/guestbook] Error stack:", errorStack);
    const { searchParams } = new URL(req.url);
    const parsedLimit = parseInt(searchParams.get("limit") || "10", 10);
    const parsedOffset = parseInt(searchParams.get("offset") || "0", 10);
    const limit = Math.min(
      Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 10, 1),
      MAX_LIMIT,
    );
    const offset = Math.max(
      Number.isFinite(parsedOffset) ? parsedOffset : 0,
      0,
    );

    const items = memory
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(offset, offset + limit);

    return NextResponse.json({ items });
  }
}

export async function POST(req: NextRequest) {
  await ensureTable();

  const ipHash = getClientIpHash(req);
  let body: { name?: string; message?: string; hp?: string } = {};

  try {
    body = await req.json();
  } catch {
    // Ignore parse errors
  }

  const { name = null, message = "", hp = "" } = body;

  if (hp && hp.trim().length > 0) {
    return NextResponse.json({ error: "rejected" }, { status: 400 });
  }

  const trimmed = (message || "").trim();

  if (trimmed.length === 0 || trimmed.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }

  const safeName = name ? String(name).slice(0, 50).trim() : null;

  if (!isDbConfigured()) {
    if (isRateLimitEnabled()) {
      const lastForIp = memory
        .filter((r) => r.ip_hash === ipHash)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )[0];

      if (lastForIp) {
        const last = new Date(lastForIp.created_at).getTime();
        if (Date.now() - last < RATE_LIMIT_WINDOW_MS) {
          return NextResponse.json({ error: "rate_limited" }, { status: 429 });
        }
      }
    }

    const id = crypto.randomUUID();
    const row: GuestbookRow & {
      ip_hash: string;
      approved?: boolean;
      rejected?: boolean;
    } = {
      id,
      name: safeName,
      message: trimmed,
      created_at: new Date().toISOString(),
      updated_at: null,
      edited: false,
      ip_hash: ipHash,
      approved: isAutoApprove(),
      rejected: false,
    };

    memory.push(row);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ip_hash, ...item } = row;

    return NextResponse.json(
      { item, approved: row.approved !== false },
      { status: 201 },
    );
  }

  if (isRateLimitEnabled()) {
    const sql = getSql();
    const recent = await sql`
      SELECT created_at FROM guestbook
      WHERE ip_hash = ${ipHash}
      ORDER BY created_at DESC
      LIMIT 1
    ` as { created_at: string }[];

    if (recent.length > 0) {
      const last = new Date(recent[0].created_at).getTime();
      const now = Date.now();

      if (now - last < RATE_LIMIT_WINDOW_MS) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      }
    }
  }

  const id = crypto.randomUUID();
  const approved = isAutoApprove();
  const rejected = false;

  try {
    await ensureTable();
    const sql = getSql();
    console.log(`[POST /api/guestbook] Inserting entry: id=${id}, name=${safeName?.substring(0, 20)}...`);
    
    const inserted = await sql`
      INSERT INTO guestbook (id, name, message, ip_hash, approved, rejected)
      VALUES (${id}, ${safeName}, ${trimmed}, ${ipHash}, ${approved}, ${rejected})
      RETURNING id, name, message, created_at, updated_at, edited
    ` as GuestbookRow[];

    if (!inserted || inserted.length === 0) {
      console.error("[POST /api/guestbook] Insert returned no rows");
      throw new Error("Failed to insert entry");
    }

    console.log(`[POST /api/guestbook] Successfully inserted entry: ${inserted[0].id}`);
    return NextResponse.json(
      { item: inserted[0], approved },
      { status: 201 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[POST /api/guestbook] Database error:", errorMessage);
    if (errorStack) console.error("[POST /api/guestbook] Error stack:", errorStack);
    return NextResponse.json(
      { error: "database_error" },
      { status: 500 },
    );
  }
}

export async function PATCH() {
  return NextResponse.json({ error: "editing_disabled" }, { status: 405 });
}

export async function DELETE(req: NextRequest) {
  await ensureTable();

  const { searchParams } = new URL(req.url);
  let id = (searchParams.get("id") || "").trim();

  if (!id) {
    try {
      const body = await req.json();
      id = (body?.id || "").trim();
    } catch {
      // Ignore parse errors
    }
  }

  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const adminHeader = req.headers.get("x-admin-token") || "";
  const isAdmin = Boolean(
    process.env.GUESTBOOK_ADMIN_TOKEN &&
      adminHeader === process.env.GUESTBOOK_ADMIN_TOKEN,
  );

  if (!isDbConfigured()) {
    if (isAdmin) {
      const idx = memory.findIndex((r) => r.id === id);
      if (idx === -1)
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      memory.splice(idx, 1);
      return NextResponse.json({ ok: true });
    }

    const ipHash = getClientIpHash(req);
    const idx = memory.findIndex((r) => r.id === id && r.ip_hash === ipHash);
    if (idx === -1)
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    memory.splice(idx, 1);
    return NextResponse.json({ ok: true });
  }

  const sql = getSql();
  if (isAdmin) {
    // Check if row exists first
    const existing = await sql`SELECT id FROM guestbook WHERE id = ${id}`;
    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    await sql`DELETE FROM guestbook WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }

  const ipHash = getClientIpHash(req);
  // Check if row exists and belongs to this IP
  const existing = await sql`SELECT id FROM guestbook WHERE id = ${id} AND ip_hash = ${ipHash}`;
  if (!existing || existing.length === 0) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await sql`DELETE FROM guestbook WHERE id = ${id} AND ip_hash = ${ipHash}`;
  return NextResponse.json({ ok: true });
}
