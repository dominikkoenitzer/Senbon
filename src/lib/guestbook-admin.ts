// Poison pill. See the note in lib/guestbook.ts. This module holds the
// moderation password and the admin bearer token.
//
// Here it genuinely is belt and braces: node:crypto and next/headers already
// break a client build. But they do so by naming those imports, which sends
// you looking at the crypto call rather than at the fact that a secret-bearing
// module was imported from the browser at all. This says that directly.
import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import type { AdminGuestbookEntry } from "@/types/guestbook";
import {
  approveEntryById,
  deleteEntryById,
  readAllEntries,
  readAutoApprove,
  writeAutoApprove,
} from "@/lib/guestbook-db";

/**
 * Moderation credentials. Both are server-only.
 *
 * - ADMIN_PASSWORD is what the human types.
 * - ADMIN_TOKEN is a server secret that keys every HMAC in the guestbook: the
 *   session cookie, the sign-in throttle buckets and the stored visitor
 *   hashes. It never reaches the browser. Rotating it signs every admin out
 *   and resets every rate-limit bucket, and nothing else.
 */
const ADMIN_PASSWORD = process.env.GUESTBOOK_ADMIN_PASSWORD;
const ADMIN_TOKEN = process.env.GUESTBOOK_ADMIN_TOKEN;

export const SESSION_COOKIE = "senbon_admin";

/** Seven days; moderation is occasional, re-typing it every visit is friction. */
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const isAdminConfigured = (): boolean =>
  Boolean(ADMIN_PASSWORD && ADMIN_TOKEN);

const constantTimeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
};

/**
 * The session cookie is an HMAC over a fixed label, keyed by the admin token.
 * It carries no data. It only proves the holder knew the password once. An
 * attacker cannot forge it without the token, and it changes if the token is
 * rotated, which invalidates every outstanding session for free.
 */
const sessionValue = (): string =>
  createHmac("sha256", ADMIN_TOKEN ?? "").update("senbon-admin-v1").digest("hex");

export const passwordMatches = (candidate: string): boolean =>
  Boolean(ADMIN_PASSWORD) && constantTimeEqual(candidate, ADMIN_PASSWORD ?? "");

/* ------------------------------------------------------------------------ *
 * Sign-in throttle
 *
 * Honest about what this is: a module-level Map lives in ONE serverless
 * instance's memory. Vercel runs several in parallel and recycles them
 * whenever it likes, so an attacker routed to a cold instance starts from
 * zero, and a deploy wipes every counter. This is best-effort, a speed bump
 * that turns a tight guessing loop into a slow one, not a guarantee.
 *
 * It is worth having anyway because the fixed delay on a wrong password only
 * slows sequential guesses; ten parallel requests each waited 600ms and then
 * all returned. What actually keeps this door shut is the password itself
 * (12 random alphanumerics). The public sign limiter, by contrast, counts in
 * the database and survives instance churn.
 * ------------------------------------------------------------------------ */

interface AttemptRecord {
  failures: number;
  /** Epoch ms before which no further attempt is accepted. */
  blockedUntil: number;
  /** Epoch ms after which the record is forgotten entirely. */
  expiresAt: number;
}

/** Wrong guesses allowed before the backoff starts biting. */
const FREE_ATTEMPTS = 5;
/** A quiet ten minutes clears the slate. */
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const BASE_BACKOFF_MS = 20 * 1000;
const MAX_BACKOFF_MS = 15 * 60 * 1000;
/** Bounded so a spray of forged addresses cannot grow this without limit. */
const MAX_TRACKED_CLIENTS = 512;

const signInAttempts = new Map<string, AttemptRecord>();

const pruneAttempts = (now: number): void => {
  for (const [key, record] of signInAttempts) {
    if (record.expiresAt <= now) signInAttempts.delete(key);
  }

  // Still over the cap after pruning: evict whatever expires soonest, which is
  // the record with the least time left to serve.
  //
  // A record that is currently serving a block is spared while any idle record
  // remains, because eviction returns a client to zero failures. Without that
  // preference the cap became a way through the throttle: a blocked client's
  // record is older than the traffic that follows it, so 512 forged addresses
  // pushed it out and cleared the block.
  while (signInAttempts.size > MAX_TRACKED_CLIENTS) {
    let victimKey: string | null = null;
    let victimBlocked = true;
    let victimExpiry = Number.POSITIVE_INFINITY;

    for (const [key, record] of signInAttempts) {
      const blocked = record.blockedUntil > now;
      if (blocked && !victimBlocked) continue;
      if (blocked === victimBlocked && record.expiresAt >= victimExpiry) continue;

      victimKey = key;
      victimBlocked = blocked;
      victimExpiry = record.expiresAt;
    }

    if (victimKey === null) break;
    signInAttempts.delete(victimKey);
  }
};

/**
 * The HMAC key for hashing visitor addresses before they are stored. Lives
 * here because it is the same secret the session cookie uses, and exposing it
 * through one named function keeps the sign action from reading the env var
 * for itself.
 */
export const visitorHashKey = (): string => ADMIN_TOKEN ?? "";

/**
 * An opaque per-client key. The address is HMAC'd with the admin token for the
 * same reason the sign action hashes visitor IPs: nothing here should hold a
 * raw one.
 *
 * Fails closed, like the public rate limiter: a request with no usable
 * address shares a single bucket rather than skipping the limit entirely.
 */
export const signInClientKey = async (): Promise<string> => {
  const head = await headers();
  // Prefer the platform-set x-real-ip; fall back to the right-most (trusted)
  // forwarded hop. The left-most x-forwarded-for entry is client-controllable,
  // so keying the throttle off it would let an attacker rotate it for a fresh
  // bucket on every guess.
  const realIp = head.get("x-real-ip")?.trim();
  const hops =
    head
      .get("x-forwarded-for")
      ?.split(",")
      .map((hop) => hop.trim())
      .filter(Boolean) ?? [];
  const address = realIp || hops[hops.length - 1] || "unknown";

  return createHmac("sha256", ADMIN_TOKEN ?? "")
    .update(`signin:${address}`)
    .digest("hex");
};

/** Milliseconds this client must wait, or 0 if it may try now. */
export const signInBlockedFor = (key: string): number => {
  const now = Date.now();
  const record = signInAttempts.get(key);
  if (!record || record.expiresAt <= now) return 0;
  return Math.max(0, record.blockedUntil - now);
};

export const recordFailedSignIn = (key: string): void => {
  const now = Date.now();
  pruneAttempts(now);

  const previous = signInAttempts.get(key);
  const failures =
    (previous && previous.expiresAt > now ? previous.failures : 0) + 1;

  const overage = failures - FREE_ATTEMPTS;
  const blockedUntil =
    overage > 0
      ? now + Math.min(BASE_BACKOFF_MS * 2 ** (overage - 1), MAX_BACKOFF_MS)
      : 0;

  signInAttempts.set(key, {
    failures,
    blockedUntil,
    // Never forget a record while it is still serving a block.
    expiresAt: Math.max(now + ATTEMPT_WINDOW_MS, blockedUntil),
  });
};

/** A correct password wipes the client's history. */
export const clearSignInAttempts = (key: string): void => {
  signInAttempts.delete(key);
};

export const startSession = async (): Promise<void> => {
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
};

export const endSession = async (): Promise<void> => {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
};

export const isSignedIn = async (): Promise<boolean> => {
  if (!isAdminConfigured()) return false;
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return Boolean(value) && constantTimeEqual(value ?? "", sessionValue());
};

/** Reject anything that is not a positive integer before it reaches the database. */
const parseId = (raw: string): number | null => {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

/** Every signature, approved or pending, newest first. */
export const fetchAllEntries = async (): Promise<AdminGuestbookEntry[]> =>
  readAllEntries();

/** Idempotent: a signature that is already gone is not an error. */
export const deleteEntry = async (id: string): Promise<void> => {
  const parsed = parseId(id);
  if (parsed === null) throw new Error("invalid id");
  await deleteEntryById(parsed);
};

export const approveEntry = async (id: string): Promise<void> => {
  const parsed = parseId(id);
  if (parsed === null) throw new Error("invalid id");
  if (!(await approveEntryById(parsed))) throw new Error("not found");
};

/** Whether new signatures publish unreviewed. Throws on failure, so callers decide the fallback. */
export const fetchAutoApprove = async (): Promise<boolean> => readAutoApprove();

/** Returns the value actually persisted, not just an echo of the request. */
export const setAutoApprove = async (autoApprove: boolean): Promise<boolean> =>
  writeAutoApprove(autoApprove);
