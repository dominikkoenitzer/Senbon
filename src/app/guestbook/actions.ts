"use server";

import { createHmac } from "node:crypto";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { GuestbookFormState } from "@/types/guestbook";
import { GUESTBOOK_CONFIG } from "@/constants/guestbook";
import {
  insertEntry,
  isGuestbookConfigured,
  readAutoApprove,
  signedRecently,
} from "@/lib/guestbook-db";
import {
  clean,
  hasBlockedWord,
  isMashed,
  looksLikeSpam,
  visitorBucket,
} from "@/lib/guestbook-moderation";
import { visitorHashKey } from "@/lib/guestbook-admin";

/**
 * Signing has two outcomes and they are not interchangeable. Either the
 * signature is on the wall, or it is holding for review and the public wall
 * filters it out. Saying the first when the second happened sends someone to
 * look for a name that is not there and conclude the wall is broken. `null` is
 * a third case: we could not establish which mode is on, so nothing is
 * promised about timing.
 */
const SIGNED = {
  published:
    "there. you're on the wall. top of the list, your name on it. i checked twice already. i'm normal.",
  held:
    "saved. it isn't on the wall yet. i read every signature before it goes up. yours is next. i'm reading it now.",
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
 * after they were rejected. Each one has to say what to change. The tone is
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
  tooFast: `you just signed. seconds ago. i saw. give it ${GUESTBOOK_CONFIG.RATE_LIMIT_SECONDS} seconds and go again.`,
  broke:
    "that broke on my end, not yours. nothing was saved, so hit sign again in a moment.",
} as const;

/**
 * Whether a signature sent right now lands on the wall immediately.
 *
 * The switch lives in the database. This runs on the server and hands back a
 * plain boolean. `null` means unknown: the guestbook is not configured
 * (preview deployments) or the read failed. Callers must then say nothing
 * about timing rather than guess, since guessing is the bug this fixes.
 *
 * Exported so the hero, the form and this action all state the same rule from
 * one read. Wrapped in React.cache so a single request that reads the mode
 * more than once (the page, then the honeypot branch of a submission) makes
 * one database call rather than several.
 */
const readAutoPublish = cache(async (): Promise<boolean | null> => {
  if (!isGuestbookConfigured()) return null;

  try {
    return await readAutoApprove();
  } catch (error) {
    console.error("[guestbook] auto-publish lookup failed:", error);
    return null;
  }
});

export const resolveAutoPublish = async (): Promise<boolean | null> =>
  readAutoPublish();

const fail = (message: string): GuestbookFormState => ({
  status: "error",
  message,
});

/**
 * Best-effort visitor address, used only as a rate-limit bucket and only
 * after hashing. Prefer the platform-set x-real-ip; fall back to the
 * right-most forwarded hop. The platform appends the real client address on
 * the right; the left-most entries are client-supplied, so keying the abuse
 * bucket off them lets a script send a fresh spoofed value per request and
 * slip the rate limit entirely.
 */
const visitorAddress = async (): Promise<string> => {
  const headerList = await headers();
  const realIp = headerList.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const hops =
    headerList
      .get("x-forwarded-for")
      ?.split(",")
      .map((hop) => hop.trim())
      .filter(Boolean) ?? [];
  return hops[hops.length - 1] ?? "";
};

/**
 * The stored bucket key. HMAC keyed by a server secret, so the table holds
 * nothing that resolves back to an address. Fails closed: a request with no
 * usable address hashes the shared bucket rather than skipping the limit.
 */
const visitorHash = async (): Promise<string> =>
  createHmac("sha256", visitorHashKey())
    .update(`visitor:${visitorBucket(await visitorAddress())}`)
    .digest("hex");

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
  // current mode*, or the difference is the signal, hence the lookup rather
  // than a hardcoded one of the two. If the mode cannot be read, assume
  // publishing: it is the seeded default, and it is the only mode that makes
  // sense when the moderation queue is unreachable anyway.
  if (String(formData.get(GUESTBOOK_CONFIG.HONEYPOT_FIELD) ?? "").trim()) {
    return {
      status: "success",
      message: signedCopy((await resolveAutoPublish()) ?? true),
    };
  }

  // clean() strips invisible characters, not just control characters.
  // Zero-width and bidi controls defeat the link filter and let a signature
  // visually reorder itself on the page.
  const name = clean(formData.get("name"));
  const message = clean(formData.get("message"));

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
  if (looksLikeSpam(message) || looksLikeSpam(name)) {
    return fail(COPY.links);
  }
  if (hasBlockedWord(message) || hasBlockedWord(name)) {
    return fail(COPY.blockedWord);
  }
  if (isMashed(message) || isMashed(name)) {
    return fail(COPY.mashed);
  }

  try {
    const ipHash = await visitorHash();

    if (
      GUESTBOOK_CONFIG.RATE_LIMIT_SECONDS > 0 &&
      (await signedRecently(ipHash, GUESTBOOK_CONFIG.RATE_LIMIT_SECONDS))
    ) {
      return fail(COPY.tooFast);
    }

    // Read the mode at the moment of writing, not at page render: the owner
    // may have flipped it between the two.
    const autoPublish = await resolveAutoPublish();
    const status = (autoPublish ?? true) ? "approved" : "pending";

    const saved = await insertEntry({ name, message, status, ipHash });

    revalidatePath("/guestbook");

    // Report what was actually stored, not what was intended.
    return {
      status: "success",
      message: signedCopy(
        autoPublish === null ? null : saved.status === "approved",
      ),
    };
  } catch (error) {
    console.error("[guestbook] sign threw:", error);
    return fail(COPY.broke);
  }
};
