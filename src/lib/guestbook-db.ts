// Poison pill: this module must never reach a client bundle. It holds the
// Supabase secret key, which bypasses row level security on every table.
// See the note in lib/guestbook.ts for why the import is here at all.
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminGuestbookEntry,
  GuestbookEntry,
  GuestbookEntryStatus,
} from "@/types/guestbook";

/**
 * Both values are server-only. Never expose them with a NEXT_PUBLIC_ prefix.
 * The secret key is the whole of the guestbook's write and moderation access;
 * there is no anon path, since RLS is on with no policies.
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

export const isGuestbookConfigured = (): boolean =>
  Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY);

const ENTRIES = "guestbook_entries";
const SETTINGS = "guestbook_settings";
const AUTO_APPROVE_KEY = "auto_approve";

/** Hard cap on any single read, whatever a caller asks for. */
const FETCH_LIMIT_MAX = 200;

interface EntryRow {
  id: number;
  name: string;
  message: string;
  status: string;
  created_at: string;
}

let client: SupabaseClient | null = null;

/**
 * One client per server instance. Created lazily so an unconfigured deploy
 * (preview without the secrets) never constructs a client with empty strings,
 * and so importing this module in a test does not need the environment.
 */
const db = (): SupabaseClient => {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error("guestbook database is not configured");
  }
  client ??= createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
};

/**
 * The status column permits "rejected" and nothing stops it widening again.
 * Only the exact string "approved" is treated as published; everything else,
 * known or not, falls into the review queue. An unfamiliar status showing up
 * with an approve button is a shrug, whereas one silently rendering as
 * "published" would tell the owner a signature is live and vetted when
 * neither is established.
 */
const narrowStatus = (status: unknown): GuestbookEntryStatus =>
  status === "approved" ? "approved" : "pending";

const toEntry = (row: EntryRow): AdminGuestbookEntry => ({
  id: String(row.id),
  name: row.name,
  message: row.message,
  signedAt: row.created_at,
  status: narrowStatus(row.status),
});

const clampLimit = (requested: number): number =>
  Number.isFinite(requested)
    ? Math.min(Math.max(Math.trunc(requested), 1), FETCH_LIMIT_MAX)
    : 50;

/** Approved signatures, newest first. Throws when the database cannot be reached. */
export const readApprovedEntries = async (
  limit: number,
): Promise<GuestbookEntry[]> => {
  const { data, error } = await db()
    .from(ENTRIES)
    .select("id, name, message, status, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(clampLimit(limit))
    .returns<EntryRow[]>();

  if (error) throw new Error(`entries read failed: ${error.message}`);
  // The public wall never sees the status column, even though every row here
  // is approved by construction.
  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: row.name,
    message: row.message,
    signedAt: row.created_at,
  }));
};

/** Every signature, approved or pending, newest first. */
export const readAllEntries = async (): Promise<AdminGuestbookEntry[]> => {
  const { data, error } = await db()
    .from(ENTRIES)
    .select("id, name, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(FETCH_LIMIT_MAX)
    .returns<EntryRow[]>();

  if (error) throw new Error(`admin list failed: ${error.message}`);
  return (data ?? []).map(toEntry);
};

/**
 * Whether this bucket signed within the window. Reads the entries table
 * itself rather than a separate counter, so there is nothing to expire and a
 * deleted signature frees the slot, which is the behaviour a moderator
 * expects after removing a test entry.
 */
export const signedRecently = async (
  ipHash: string,
  windowSeconds: number,
): Promise<boolean> => {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { data, error } = await db()
    .from(ENTRIES)
    .select("id")
    .eq("ip_hash", ipHash)
    .gt("created_at", since)
    .limit(1);

  if (error) throw new Error(`rate-limit read failed: ${error.message}`);
  return (data ?? []).length > 0;
};

export const insertEntry = async (entry: {
  name: string;
  message: string;
  status: GuestbookEntryStatus;
  ipHash: string;
}): Promise<AdminGuestbookEntry> => {
  const { data, error } = await db()
    .from(ENTRIES)
    .insert({
      name: entry.name,
      message: entry.message,
      status: entry.status,
      ip_hash: entry.ipHash,
    })
    .select("id, name, message, status, created_at")
    .single<EntryRow>();

  if (error || !data) {
    throw new Error(`insert failed: ${error?.message ?? "no row returned"}`);
  }
  return toEntry(data);
};

/** Resolves false when nothing matched, so callers can say "already gone". */
export const deleteEntryById = async (id: number): Promise<boolean> => {
  const { data, error } = await db()
    .from(ENTRIES)
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(`delete failed: ${error.message}`);
  return (data ?? []).length > 0;
};

export const approveEntryById = async (id: number): Promise<boolean> => {
  const { data, error } = await db()
    .from(ENTRIES)
    .update({ status: "approved" })
    .eq("id", id)
    .select("id");

  if (error) throw new Error(`approve failed: ${error.message}`);
  return (data ?? []).length > 0;
};

/**
 * The auto-publish switch. A missing row reads as ON, which matches the seed
 * in the migration and the only mode that makes sense when nobody is looking
 * at a queue.
 */
export const readAutoApprove = async (): Promise<boolean> => {
  const { data, error } = await db()
    .from(SETTINGS)
    .select("value")
    .eq("key", AUTO_APPROVE_KEY)
    .maybeSingle<{ value: string }>();

  if (error) throw new Error(`settings read failed: ${error.message}`);
  return data ? data.value === "true" : true;
};

/** Returns the value actually persisted, not just an echo of the request. */
export const writeAutoApprove = async (value: boolean): Promise<boolean> => {
  const { data, error } = await db()
    .from(SETTINGS)
    .upsert(
      { key: AUTO_APPROVE_KEY, value: String(value), updated_at: new Date().toISOString() },
      { onConflict: "key" },
    )
    .select("value")
    .single<{ value: string }>();

  if (error || !data) {
    throw new Error(`settings write failed: ${error?.message ?? "no row"}`);
  }
  return data.value === "true";
};
