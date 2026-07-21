import { cache } from "react";
import type { GuestbookEntry } from "@/types/guestbook";
import { GUESTBOOK_CONFIG } from "@/constants/guestbook";

/**
 * The guestbook API is self-hosted. Both values are server-only — never
 * expose them with a NEXT_PUBLIC_ prefix, since the token grants write access.
 */
const API_URL = process.env.GUESTBOOK_API_URL;
const API_TOKEN = process.env.GUESTBOOK_API_TOKEN;

export const isGuestbookConfigured = (): boolean =>
  Boolean(API_URL && API_TOKEN);

export const guestbookApi = (path: string): string =>
  `${API_URL?.replace(/\/$/, "")}${path}`;

export const guestbookAuthHeader = (): Record<string, string> => ({
  authorization: `Bearer ${API_TOKEN}`,
});

/**
 * Fetch approved signatures. Wrapped in React.cache so metadata and the page
 * body share one request, matching the pattern in lib/blog.ts.
 *
 * A guestbook that fails to load should never take the page down — on any
 * error we render an empty wall and log server-side.
 */
export const getGuestbookEntries = cache(
  async (): Promise<GuestbookEntry[]> => {
    if (!isGuestbookConfigured()) return [];

    try {
      const response = await fetch(
        guestbookApi(`/entries?limit=${GUESTBOOK_CONFIG.FETCH_LIMIT}`),
        {
          headers: guestbookAuthHeader(),
          // Signatures appear as soon as they are approved.
          cache: "no-store",
          signal: AbortSignal.timeout(GUESTBOOK_CONFIG.REQUEST_TIMEOUT_MS),
        },
      );

      if (!response.ok) {
        console.error(
          `[guestbook] fetch failed: ${response.status} ${response.statusText}`,
        );
        return [];
      }

      const data = (await response.json()) as { entries?: GuestbookEntry[] };
      return data.entries ?? [];
    } catch (error) {
      console.error("[guestbook] fetch threw:", error);
      return [];
    }
  },
);
