/**
 * A single approved signature on the guestbook wall.
 */
export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  signedAt: string;
}

/**
 * Result of a sign attempt, surfaced back to the form via useActionState.
 */
export interface GuestbookFormState {
  status: "idle" | "success" | "error";
  message: string;
}

export interface GuestbookWallProps {
  entries: GuestbookEntry[];
}

/**
 * Moderation state of a signature, as this app models it. Only present on
 * admin responses.
 *
 * The API's own schema is wider — its status column also permits "rejected" —
 * but nothing writes that today and there is no UI that could act on it.
 * `fetchAllEntries` narrows at the boundary instead: anything it does not
 * recognise becomes "pending", so an unfamiliar status lands in the queue that
 * has an approve button rather than rendering as already published. Widen this
 * union only together with UI that can handle the new state.
 */
export type GuestbookEntryStatus = "pending" | "approved";

/**
 * A signature as seen by the moderation API — everything a public entry has,
 * plus the status the public `/entries` endpoint never exposes.
 */
export interface AdminGuestbookEntry extends GuestbookEntry {
  status: GuestbookEntryStatus;
}

/** Moderation settings. Currently a single switch: publish on sight, or hold for review. */
export interface GuestbookSettings {
  autoApprove: boolean;
}
