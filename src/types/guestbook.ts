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
