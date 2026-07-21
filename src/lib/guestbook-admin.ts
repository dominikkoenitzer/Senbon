import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import type {
  AdminGuestbookEntry,
  GuestbookEntryStatus,
  GuestbookSettings,
} from "@/types/guestbook";
import { GUESTBOOK_CONFIG } from "@/constants/guestbook";
import { guestbookApi } from "@/lib/guestbook";

/**
 * Moderation credentials. All three are server-only.
 *
 * - ADMIN_PASSWORD is what the human types.
 * - ADMIN_TOKEN is the API's admin bearer secret. It must never reach the
 *   browser, so every moderation call is proxied through a server action.
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
 * It carries no data — it only proves the holder knew the password once. An
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
 * zero, and a deploy wipes every counter. This is best-effort — a speed bump
 * that turns a tight guessing loop into a slow one — not a guarantee.
 *
 * It is worth having anyway because the fixed delay on a wrong password only
 * slows *sequential* guesses; ten parallel requests each waited 600ms and then
 * all returned. What actually keeps this door shut is the password itself
 * (12 random alphanumerics). A real distributed limiter belongs on the VPS,
 * where there is one process and a database to count in.
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
  while (signInAttempts.size > MAX_TRACKED_CLIENTS) {
    let oldestKey: string | null = null;
    let oldestExpiry = Number.POSITIVE_INFINITY;

    for (const [key, record] of signInAttempts) {
      if (record.expiresAt < oldestExpiry) {
        oldestExpiry = record.expiresAt;
        oldestKey = key;
      }
    }

    if (oldestKey === null) break;
    signInAttempts.delete(oldestKey);
  }
};

/**
 * An opaque per-client key. The address is HMAC'd with the admin token for the
 * same reason the API hashes visitor IPs: nothing here should hold a raw one.
 *
 * Fails closed, like the public rate limiter — a request with no usable
 * address shares a single bucket rather than skipping the limit entirely.
 */
export const signInClientKey = async (): Promise<string> => {
  const head = await headers();
  const forwarded = head.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || head.get("x-real-ip")?.trim() || "unknown";

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

const adminHeaders = (): Record<string, string> => ({
  authorization: `Bearer ${ADMIN_TOKEN}`,
});

/**
 * The API's status column is wider than this app's union — it also permits
 * "rejected" — and nothing stops it widening again. Only the exact string
 * "approved" is treated as published; everything else, known or not, falls
 * into the review queue.
 *
 * The failure this prevents is one-directional and deliberate: an unfamiliar
 * status showing up with an approve button is a shrug, whereas one silently
 * rendering as "published" would tell the owner a signature is live and
 * vetted when neither is established.
 */
const narrowStatus = (status: unknown): GuestbookEntryStatus =>
  status === "approved" ? "approved" : "pending";

/** Every signature, approved or pending, newest first. */
export const fetchAllEntries = async (): Promise<AdminGuestbookEntry[]> => {
  const response = await fetch(guestbookApi("/admin/entries?status=all"), {
    headers: adminHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(GUESTBOOK_CONFIG.REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`admin list failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    entries?: (Omit<AdminGuestbookEntry, "status"> & { status?: unknown })[];
  };

  return (data.entries ?? []).map((entry) => ({
    ...entry,
    status: narrowStatus(entry.status),
  }));
};

export const deleteEntry = async (id: string): Promise<void> => {
  const response = await fetch(guestbookApi(`/admin/entries/${id}`), {
    method: "DELETE",
    headers: adminHeaders(),
    signal: AbortSignal.timeout(GUESTBOOK_CONFIG.REQUEST_TIMEOUT_MS),
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`admin delete failed: ${response.status}`);
  }
};

export const approveEntry = async (id: string): Promise<void> => {
  const response = await fetch(guestbookApi(`/admin/entries/${id}/approve`), {
    method: "POST",
    headers: adminHeaders(),
    signal: AbortSignal.timeout(GUESTBOOK_CONFIG.REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`admin approve failed: ${response.status}`);
  }
};

/** Whether new signatures publish unreviewed. Defaults closed-mouthed on failure — callers decide the fallback. */
export const fetchAutoApprove = async (): Promise<boolean> => {
  const response = await fetch(guestbookApi("/admin/settings"), {
    headers: adminHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(GUESTBOOK_CONFIG.REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`admin settings fetch failed: ${response.status}`);
  }

  const data = (await response.json()) as GuestbookSettings;
  return Boolean(data.autoApprove);
};

/** Returns the value the API actually persisted, not just an echo of the request. */
export const setAutoApprove = async (autoApprove: boolean): Promise<boolean> => {
  const response = await fetch(guestbookApi("/admin/settings"), {
    method: "POST",
    headers: {
      ...adminHeaders(),
      "content-type": "application/json",
    },
    body: JSON.stringify({ autoApprove }),
    signal: AbortSignal.timeout(GUESTBOOK_CONFIG.REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`admin settings update failed: ${response.status}`);
  }

  const data = (await response.json()) as { ok: boolean; autoApprove: boolean };
  return Boolean(data.autoApprove);
};
