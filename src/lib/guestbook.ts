// Poison pill: this module must never reach a client bundle. It pulls in the
// database layer, and with it the Supabase secret key.
//
// Nothing else here enforced that. A "use client" file importing it compiled
// clean, and the failure surfaced only at runtime, in the worst possible shape:
// Next blanks non-NEXT_PUBLIC_ env vars in the browser, so the secret is not
// inlined, it is simply undefined, and isGuestbookConfigured() reports false,
// making a misplaced import look like a deploy with missing env vars.
//
// This turns that into a build error naming the cause. Next resolves the
// specifier itself, so it adds no dependency.
import "server-only";

import { cache } from "react";
import type { GuestbookEntry } from "@/types/guestbook";
import { GUESTBOOK_CONFIG } from "@/constants/guestbook";
import { isGuestbookConfigured, readApprovedEntries } from "@/lib/guestbook-db";

export { isGuestbookConfigured };

/**
 * Fetch approved signatures. Wrapped in React.cache to dedupe within a single
 * request; the guestbook page has one caller today, but the wrapper keeps that
 * true for free if a second (e.g. metadata) is ever added, matching lib/blog.ts.
 *
 * A guestbook that fails to load should never take the page down, so every
 * failure is caught. It must not be caught silently, though: this once returned
 * `[]` for both "nobody has signed" and "the database never answered", and
 * those two render identically, as the coy empty-wall card. A week-long outage
 * was invisible on the one surface guaranteed to be looked at.
 *
 * So the two cases are distinct: `[]` means the database answered and had
 * nothing, `null` means it could not be reached (or was never configured) and
 * nothing about the wall is known. Callers must render those differently.
 */
export const getGuestbookEntries = cache(
  async (): Promise<GuestbookEntry[] | null> => {
    if (!isGuestbookConfigured()) return null;

    try {
      return await readApprovedEntries(GUESTBOOK_CONFIG.FETCH_LIMIT);
    } catch (error) {
      console.error("[guestbook] fetch threw:", error);
      return null;
    }
  },
);
