/**
 * Guestbook-related constants.
 *
 * The length caps mirror the validation in the guestbook API, so keep the two in
 * sync, so the client-side counter never promises something the server rejects.
 */
export const GUESTBOOK_CONFIG = {
  NAME_MAX: 40,
  MESSAGE_MAX: 280,
  /** How many approved signatures the wall renders. */
  FETCH_LIMIT: 100,
  /**
   * Name of the honeypot field. Bots fill it; humans never see it. Kept to a
   * neutral token on purpose: common names like "website"/"url"/"email" are
   * autofill targets, and a browser filling a hidden one would get a real
   * visitor silently discarded as a bot.
   */
  HONEYPOT_FIELD: "contact_time",
  /**
   * Cap on calls to the external API. Without this a stalled server (accepting
   * the connection but never answering) leaves the visitor on a spinner until
   * the platform's own execution limit fires.
   */
  REQUEST_TIMEOUT_MS: 8000,
} as const;
