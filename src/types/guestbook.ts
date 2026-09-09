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
 * The database column is wider, since it also permits "rejected", but nothing
 * writes that today and there is no UI that could act on it. The database
 * layer narrows at the boundary instead: anything it does not
 * recognise becomes "pending", so an unfamiliar status lands in the queue that
 * has an approve button rather than rendering as already published. Widen this
 * union only together with UI that can handle the new state.
 */
export type GuestbookEntryStatus = "pending" | "approved";

/**
 * A signature as seen by moderation: everything a public entry has, plus the
 * status the public wall never exposes.
 */
export interface AdminGuestbookEntry extends GuestbookEntry {
  status: GuestbookEntryStatus;
}
