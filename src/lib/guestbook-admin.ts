import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { GuestbookEntry } from "@/types/guestbook";
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

/** Every signature, approved or pending, newest first. */
export const fetchAllEntries = async (): Promise<GuestbookEntry[]> => {
  const response = await fetch(guestbookApi("/admin/entries?status=all"), {
    headers: adminHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(GUESTBOOK_CONFIG.REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`admin list failed: ${response.status}`);
  }

  const data = (await response.json()) as { entries?: GuestbookEntry[] };
  return data.entries ?? [];
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
