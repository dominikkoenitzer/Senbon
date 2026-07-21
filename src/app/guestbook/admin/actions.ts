"use server";

import { revalidatePath } from "next/cache";
import {
  deleteEntry,
  endSession,
  isAdminConfigured,
  isSignedIn,
  passwordMatches,
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
 */
export const signIn = async (
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> => {
  if (!isAdminConfigured()) {
    return { status: "error", message: "Moderation is not configured." };
  }

  const password = String(formData.get("password") ?? "");

  if (!passwordMatches(password)) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { status: "error", message: "That password is not right." };
  }

  await startSession();
  revalidatePath("/guestbook/admin");
  return { status: "idle", message: "" };
};

export const signOut = async (): Promise<void> => {
  await endSession();
  revalidatePath("/guestbook/admin");
};

export const removeEntry = async (formData: FormData): Promise<void> => {
  // Re-check on every call: the session cookie is the only thing standing
  // between a stranger and the delete button.
  if (!(await isSignedIn())) return;

  const id = String(formData.get("id") ?? "");
  if (!/^\d+$/.test(id)) return;

  await deleteEntry(id);
  revalidatePath("/guestbook/admin");
  revalidatePath("/guestbook");
};
