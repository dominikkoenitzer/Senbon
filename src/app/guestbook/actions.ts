"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { GuestbookFormState } from "@/types/guestbook";
import { GUESTBOOK_CONFIG } from "@/constants/guestbook";
import {
  guestbookApi,
  guestbookAuthHeader,
  isGuestbookConfigured,
} from "@/lib/guestbook";

const fail = (message: string): GuestbookFormState => ({
  status: "error",
  message,
});

/**
 * Best-effort visitor IP. The request to the guestbook API originates from
 * Vercel's infrastructure, so the real client address has to be forwarded
 * explicitly — the API hashes it and never stores it raw.
 */
const visitorIp = async (): Promise<string> => {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "";
};

export const signGuestbook = async (
  _prevState: GuestbookFormState,
  formData: FormData,
): Promise<GuestbookFormState> => {
  if (!isGuestbookConfigured()) {
    return fail("The guestbook is not accepting signatures right now.");
  }

  // Bots fill hidden fields; humans never see this one. Report success so the
  // bot has no signal to adapt to, but write nothing.
  if (String(formData.get(GUESTBOOK_CONFIG.HONEYPOT_FIELD) ?? "").trim()) {
    return { status: "success", message: "Thank you for signing." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !message) {
    return fail("Please add both a name and a message.");
  }
  if (name.length > GUESTBOOK_CONFIG.NAME_MAX) {
    return fail(
      `Name must be ${GUESTBOOK_CONFIG.NAME_MAX} characters or fewer.`,
    );
  }
  if (message.length > GUESTBOOK_CONFIG.MESSAGE_MAX) {
    return fail(
      `Message must be ${GUESTBOOK_CONFIG.MESSAGE_MAX} characters or fewer.`,
    );
  }

  try {
    const response = await fetch(guestbookApi("/sign"), {
      method: "POST",
      headers: {
        ...guestbookAuthHeader(),
        "content-type": "application/json",
        "x-visitor-ip": await visitorIp(),
      },
      body: JSON.stringify({ name, message }),
      signal: AbortSignal.timeout(GUESTBOOK_CONFIG.REQUEST_TIMEOUT_MS),
    });

    if (response.status === 429) {
      return fail("You just signed — give it a moment before signing again.");
    }
    if (response.status === 422) {
      return fail("Links aren't allowed in the guestbook.");
    }
    if (!response.ok) {
      console.error(
        `[guestbook] sign failed: ${response.status} ${response.statusText}`,
      );
      return fail("Something went wrong. Please try again in a moment.");
    }

    revalidatePath("/guestbook");

    return {
      status: "success",
      message: "Signed. Your mark is on the wall.",
    };
  } catch (error) {
    console.error("[guestbook] sign threw:", error);
    return fail("Something went wrong. Please try again in a moment.");
  }
};
