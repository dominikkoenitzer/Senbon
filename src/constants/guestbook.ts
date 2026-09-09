/**
 * Guestbook-related constants.
 *
 * The length caps are enforced here, in the sign action, and as CHECK
 * constraints in the database migration. Keep the three in sync, so the
 * client-side counter never promises something the database rejects.
 */
export const GUESTBOOK_CONFIG = {
  NAME_MAX: 40,
  MESSAGE_MAX: 280,
  /**
   * One signature per visitor bucket per window. Counted against the entries
   * table itself, so deleting a test signature frees the slot immediately.
   */
  RATE_LIMIT_SECONDS: 30,
  /** How many approved signatures the wall renders. */
  FETCH_LIMIT: 100,
  /**
   * Name of the honeypot field. Bots fill it; humans never see it. Kept to a
   * neutral token on purpose: common names like "website"/"url"/"email" are
   * autofill targets, and a browser filling a hidden one would get a real
   * visitor silently discarded as a bot.
   */
  HONEYPOT_FIELD: "contact_time",
} as const;
