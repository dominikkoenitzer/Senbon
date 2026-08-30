"use server";

import { revalidatePath } from "next/cache";
import {
  approveEntry,
  clearSignInAttempts,
  deleteEntry,
  endSession,
  isAdminConfigured,
  isSignedIn,
  passwordMatches,
  recordFailedSignIn,
  setAutoApprove,
  signInBlockedFor,
  signInClientKey,
  startSession,
} from "@/lib/guestbook-admin";

export interface AdminFormState {
  status: "idle" | "error";
  message: string;
}

/**
 * Deliberately slow and vague. There is one password and one person who knows
 * it; a wrong attempt should not distinguish "no such password" from anything
 * else, and should not be free to retry in a tight loop.
 *
 * The 600ms delay only slows sequential guessing. Ten parallel requests all
 * wait the same 600ms and all answer. So the per-client throttle in
 * `guestbook-admin` runs first, before the password is even read. It is
 * best-effort by construction; see the comment there.
 *
 * These three messages are the only place that distinguishes one failure from
 * another, and each one says exactly as much as it already did: not
 * configured, wrong password, too many attempts. Do not merge them, and do not
 * add a fourth without deciding what it teaches a stranger.
 */
export const signIn = async (
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> => {
  if (!isAdminConfigured()) {
    return {
      status: "error",
      message: "moderation isn't set up on this deploy. there's no door here.",
    };
  }

  const client = await signInClientKey();
  const waitMs = signInBlockedFor(client);

  if (waitMs > 0) {
    const seconds = Math.ceil(waitMs / 1000);
    return {
      status: "error",
      message: `too many wrong guesses. wait ${seconds} seconds. i'll be here.`,
    };
  }

  const password = String(formData.get("password") ?? "");

  if (!passwordMatches(password)) {
    recordFailedSignIn(client);
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { status: "error", message: "that's not the password. try again." };
  }

  clearSignInAttempts(client);
  await startSession();
  revalidatePath("/guestbook/admin");
  return { status: "idle", message: "" };
};

export const signOut = async (): Promise<void> => {
  await endSession();
  revalidatePath("/guestbook/admin");
};

export interface ModerationResult {
  ok: boolean;
  /** `expired` means the session lapsed, so the row can say so specifically. */
  reason?: "expired";
}

export const removeEntry = async (
  formData: FormData,
): Promise<ModerationResult> => {
  // Re-check on every call: the session cookie is the only thing standing
  // between a stranger and the delete button. Report the lapse back rather than
  // returning silently, or the button just dies with no explanation.
  if (!(await isSignedIn())) return { ok: false, reason: "expired" };

  const id = String(formData.get("id") ?? "");
  if (!/^\d+$/.test(id)) return { ok: false };

  await deleteEntry(id);
  revalidatePath("/guestbook/admin");
  revalidatePath("/guestbook");
  return { ok: true };
};

export const approveSignature = async (
  formData: FormData,
): Promise<ModerationResult> => {
  // Same re-check as removeEntry; the session cookie is the only gate.
  if (!(await isSignedIn())) return { ok: false, reason: "expired" };

  const id = String(formData.get("id") ?? "");
  if (!/^\d+$/.test(id)) return { ok: false };

  await approveEntry(id);
  revalidatePath("/guestbook/admin");
  // A newly-approved signature should appear on the public wall immediately.
  revalidatePath("/guestbook");
  return { ok: true };
};

export interface UpdateAutoApproveResult {
  ok: boolean;
  autoApprove?: boolean;
}

/**
 * Called directly from the toggle component (not via a <form>), since a
 * switch fires on click rather than on submit. It re-checks the session itself,
 * the page having rendered the control once is never proof the click came
 * from a live, still-authenticated admin.
 */
export const updateAutoApprove = async (
  autoApprove: boolean,
): Promise<UpdateAutoApproveResult> => {
  if (!(await isSignedIn())) return { ok: false };

  try {
    const persisted = await setAutoApprove(autoApprove);
    revalidatePath("/guestbook/admin");
    revalidatePath("/guestbook");
    return { ok: true, autoApprove: persisted };
  } catch (error) {
    console.error("[guestbook-admin] settings update failed:", error);
    return { ok: false };
  }
};
