/**
 * Guestbook-related constants.
 *
 * The length caps mirror the validation in the guestbook API — keep the two in
 * sync, so the client-side counter never promises something the server rejects.
 */
export const GUESTBOOK_CONFIG = {
  NAME_MAX: 40,
  MESSAGE_MAX: 280,
  /** How many approved signatures the wall renders. */
  FETCH_LIMIT: 100,
  /** Name of the honeypot field. Bots fill it; humans never see it. */
  HONEYPOT_FIELD: "website",
  /**
   * Cap on calls to the self-hosted API. Without this a stalled VPS (accepting
   * the connection but never answering) leaves the visitor on a spinner until
   * the platform's own execution limit fires.
   */
  REQUEST_TIMEOUT_MS: 8000,
} as const;
