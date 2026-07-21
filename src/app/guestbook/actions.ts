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
import { fetchAutoApprove, isAdminConfigured } from "@/lib/guestbook-admin";

/**
 * Signing has two outcomes and they are not interchangeable. Either the
 * signature is on the wall, or it is holding for review and the public
 * `/entries` feed filters it out. Saying the first when the second happened
 * sends someone to look for a name that is not there and conclude the wall is
 * broken. `null` is a third case — we could not establish which mode is on, so
 * nothing is promised about timing.
 */
const SIGNED = {
  published:
    "there. you're on the wall. top of the list, your name on it. i checked twice already. i'm normal.",
  held:
    "saved. it isn't on the wall yet — i read every signature before it goes up. yours is next. i'm reading it now.",
  unknown:
    "saved. yours is in. when it turns up on the wall is between me and the wall, but it turns up.",
} as const;

const signedCopy = (published: boolean | null): string =>
  published === null
    ? SIGNED.unknown
    : published
      ? SIGNED.published
      : SIGNED.held;

/**
 * Every string here lands under the sign form, in a real person's face, right
 * after they were rejected. Each one has to say what to change — the tone is
 * free, the instruction is not.
 */
const COPY = {
  offline:
    "the guestbook is offline right now. my fault, not yours. :c come back later and sign it properly.",
  noName:
    "the name box is empty. i need something to put above the message. make one up, i won't check. (i will.)",
  noMessage:
    "you typed a name and then nothing. that's worse than not signing. put some words in the message box.",
  nameTooLong: `that name is over ${GUESTBOOK_CONFIG.NAME_MAX} characters. nobody is named that. cut it down and try again.`,
  messageTooLong: `that's over ${GUESTBOOK_CONFIG.MESSAGE_MAX} characters. love the enthusiasm, don't have the wall space. trim it and send it again.`,
  links:
    "no links. spam bots ruined that for everyone. take the url out and it goes straight through.",
  blockedWord:
    "one of those words is not going on my wall. you know which one. take it out and try again.",
  mashed:
    "that's a keyboard mash and we both know it. give me four real words. you have four words in you.",
  tooFast:
    "you just signed. seconds ago. i saw. wait a bit longer and you can go again.",
  rejected:
    "the wall didn't take that one. reword it in plain sentences and it'll go through.",
  broke:
    "that broke on my end, not yours. nothing was saved, so hit sign again in a moment.",
} as const;

/**
 * The API returns one flat `error` string, so the reason a signature bounced is
 * recovered by matching it. Ordered: the first pattern that matches wins, and
 * anything unrecognised (an older API build, a proxy error page) falls back to
 * COPY.rejected rather than guessing wrong — telling someone to remove a link
 * they never wrote is worse than saying nothing specific.
 */
const REJECTION_COPY: ReadonlyArray<readonly [RegExp, string]> = [
  [/keyboard mash/, COPY.mashed],
  [/link/, COPY.links],
  [/word/, COPY.blockedWord],
  [/^name has to be/, COPY.nameTooLong],
  [/^message has to be/, COPY.messageTooLong],
  [/name and a message/, COPY.noMessage],
];

/** The API's flat `error` string, or "" if the body was not readable. */
const errorField = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json();
    return typeof body === "object" && body !== null && "error" in body
      ? String((body as { error: unknown }).error)
      : "";
  } catch {
    return "";
  }
};

const rejectionCopy = async (response: Response): Promise<string> => {
  const reason = (await errorField(response)).toLowerCase();
  return (
    REJECTION_COPY.find(([pattern]) => pattern.test(reason))?.[1] ??
    COPY.rejected
  );
};

/**
 * The rate-limit window is RATE_LIMIT_SECONDS, an env var on the VPS, and it
 * has been changed since this copy was written — the old line promised "about
 * thirty seconds" against a 120 second window, wrong by 4x. A mirrored copy of
 * the number here would drift again the next time it is tuned, so the API's own
 * 429 body is passed through instead: it names the real figure, in the same
 * voice, and cannot go stale. The local fallback names no number at all.
 */
const PASSTHROUGH_MAX = 200;

const rateLimitCopy = async (response: Response): Promise<string> => {
  const reason = (await errorField(response)).trim();
  return reason && reason.length <= PASSTHROUGH_MAX ? reason : COPY.tooFast;
};

/**
 * A signature that was accepted answers 201 for both outcomes and separates
 * them in the body: `status: "approved"` went straight to the wall,
 * `status: "pending"` is holding for review. Anything else — an older API
 * build, a proxy rewriting the body — is unknown rather than assumed.
 */
const publishedFromBody = async (
  response: Response,
): Promise<boolean | null> => {
  try {
    const body: unknown = await response.json();
    const status =
      typeof body === "object" && body !== null && "status" in body
        ? String((body as { status: unknown }).status)
        : "";
    if (status === "approved") return true;
    if (status === "pending") return false;
    return null;
  } catch {
    return null;
  }
};

/**
 * Whether a signature sent right now lands on the wall immediately.
 *
 * The switch lives in Postgres and only the admin token can read it, so this
 * runs on the server and hands back a plain boolean — GUESTBOOK_ADMIN_TOKEN
 * never leaves it. `null` means unknown: no admin credentials (preview
 * deployments) or the settings call failed. Callers must then say nothing
 * about timing rather than guess, since guessing is the bug this fixes.
 *
 * Exported so the hero, the form and this action all state the same rule from
 * one read. The value is one the page already says out loud in prose, so
 * reaching it through a server action discloses nothing new.
 */
export const resolveAutoPublish = async (): Promise<boolean | null> => {
  if (!isAdminConfigured()) return null;

  try {
    return await fetchAutoApprove();
  } catch (error) {
    console.error("[guestbook] auto-publish lookup failed:", error);
    return null;
  }
};

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
    return fail(COPY.offline);
  }

  // Bots fill hidden fields; humans never see this one. Report success so the
  // bot has no signal to adapt to, but write nothing. The wording must stay
  // byte-identical to what a real signature would have produced *in the
  // current mode*, or the difference is the signal — hence the lookup rather
  // than a hardcoded one of the two. If the mode cannot be read, assume
  // publishing: it is the deployed default, and it is the only mode that makes
  // sense when the moderation queue is unreachable anyway.
  if (String(formData.get(GUESTBOOK_CONFIG.HONEYPOT_FIELD) ?? "").trim()) {
    return {
      status: "success",
      message: signedCopy((await resolveAutoPublish()) ?? true),
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) {
    return fail(COPY.noName);
  }
  if (!message) {
    return fail(COPY.noMessage);
  }
  if (name.length > GUESTBOOK_CONFIG.NAME_MAX) {
    return fail(COPY.nameTooLong);
  }
  if (message.length > GUESTBOOK_CONFIG.MESSAGE_MAX) {
    return fail(COPY.messageTooLong);
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
      return fail(await rateLimitCopy(response));
    }
    if (response.status === 422 || response.status === 400) {
      return fail(await rejectionCopy(response));
    }
    if (!response.ok) {
      console.error(
        `[guestbook] sign failed: ${response.status} ${response.statusText}`,
      );
      return fail(COPY.broke);
    }

    // 2xx only means the API took it, not that anyone can see it. The body says
    // which, and the visitor is told which.
    const published = await publishedFromBody(response);

    revalidatePath("/guestbook");

    return {
      status: "success",
      message: signedCopy(published),
    };
  } catch (error) {
    console.error("[guestbook] sign threw:", error);
    return fail(COPY.broke);
  }
};
