"use client";

import { useActionState, useId, useState } from "react";
import { Loader2, PenLine } from "lucide-react";
import { signGuestbook } from "@/app/guestbook/actions";
import type { GuestbookFormState } from "@/types/guestbook";
import { GUESTBOOK_CONFIG } from "@/constants/guestbook";
import { cn } from "@/lib/utils";

const INITIAL_STATE: GuestbookFormState = { status: "idle", message: "" };

/**
 * What the form promises before anything has been submitted. It has to match
 * the hero on the same screen, so both read the one boolean the page resolved
 * — and when that boolean is unknown, neither of them claims a timing.
 */
const IDLE_COPY = {
  published:
    "you hit sign, it's on the wall. that's the entire process. there is no step two.",
  held:
    "i read every signature before it goes up, so yours won't appear the second you send it. it isn't a filter. i'm nosy.",
  unknown:
    "your part is: type, sign. that's it. what happens after that is my problem, not yours.",
} as const;

const idleCopy = (autoPublish: boolean | null): string =>
  autoPublish === null
    ? IDLE_COPY.unknown
    : autoPublish
      ? IDLE_COPY.published
      : IDLE_COPY.held;

/**
 * The visible counter is decorative and aria-hidden, so its warning never
 * reaches assistive tech. This announces a literal count instead, and only at
 * these thresholds — a number read out on every keystroke is unusable.
 */
const COUNTDOWN_THRESHOLDS = [20, 10, 5];

const countdownAnnouncement = (remaining: number): string => {
  if (remaining <= 0) return "0 characters remaining. Message limit reached.";
  return COUNTDOWN_THRESHOLDS.includes(remaining)
    ? `${remaining} characters remaining.`
    : "";
};

interface GuestbookFormProps {
  /**
   * Whether a signature sent right now publishes immediately. `null` means the
   * site could not find out, in which case nothing is claimed about timing.
   * Resolved on the server in page.tsx — only the boolean crosses to the
   * client, never the admin token that read it.
   */
  autoPublish: boolean | null;
}

const GuestbookForm = ({ autoPublish }: GuestbookFormProps) => {
  const [state, formAction, isPending] = useActionState(
    signGuestbook,
    INITIAL_STATE,
  );
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [handledState, setHandledState] = useState(state);

  const nameId = useId();
  const messageId = useId();
  const statusId = useId();

  // Clear the fields once a signature lands, so the form is ready for the next
  // visitor rather than showing a stale draft. Adjusting state during render is
  // React's documented alternative to a reset effect — an effect here trips
  // react-hooks/set-state-in-effect and costs an extra render pass.
  if (state !== handledState) {
    setHandledState(state);
    if (state.status === "success") {
      setName("");
      setMessage("");
    }
  }

  const remaining = GUESTBOOK_CONFIG.MESSAGE_MAX - message.length;
  const hasError = state.status === "error";

  return (
    <form action={formAction} className="zen-card flex flex-col gap-6 p-7 md:p-9">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={nameId}
          className="text-xs uppercase tracking-[0.25em] text-foreground/80"
        >
          your name, obviously
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          // Kept read-only in flight: a success clears both fields, so edits
          // made while the previous submission was still pending would be
          // silently discarded.
          readOnly={isPending}
          maxLength={GUESTBOOK_CONFIG.NAME_MAX}
          autoComplete="name"
          // The rejection reason lives in the status line at the bottom of the
          // form. Without this pairing a screen reader user is told the field
          // is invalid and never told why.
          aria-invalid={hasError}
          aria-describedby={statusId}
          placeholder="a name. yours, ideally."
          className="w-full rounded-md border border-foreground/10 bg-background/40 px-4 py-3 text-base text-foreground/90 outline-none transition-colors placeholder:text-foreground/70 focus-visible:border-primary/40"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={messageId}
          className="text-xs uppercase tracking-[0.25em] text-foreground/80"
        >
          your message (the entire point)
        </label>
        <textarea
          id={messageId}
          name="message"
          required
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          readOnly={isPending}
          maxLength={GUESTBOOK_CONFIG.MESSAGE_MAX}
          aria-invalid={hasError}
          aria-describedby={statusId}
          placeholder="say something. anything. one word. one letter. i will take one letter."
          className="w-full resize-none rounded-md border border-foreground/10 bg-background/40 px-4 py-3 text-base leading-relaxed text-foreground/90 outline-none transition-colors placeholder:text-foreground/70 focus-visible:border-primary/40"
        />
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {countdownAnnouncement(remaining)}
        </p>
        <span
          aria-hidden="true"
          className={cn(
            "self-end font-mono text-[11px] lowercase tracking-wider",
            remaining < 20 ? "text-primary" : "text-foreground/70",
          )}
        >
          {remaining < 20 ? `${remaining} left. land it.` : remaining}
        </span>
      </div>

      {/* Honeypot — hidden from humans, irresistible to bots. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={GUESTBOOK_CONFIG.HONEYPOT_FIELD}>
          Leave this field empty
        </label>
        <input
          id={GUESTBOOK_CONFIG.HONEYPOT_FIELD}
          name={GUESTBOOK_CONFIG.HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isPending}
          aria-describedby={statusId}
          className="group inline-flex w-fit items-center gap-2.5 rounded-full border border-primary/30 px-6 py-3 text-xs uppercase tracking-[0.25em] text-primary transition-colors hover:border-primary/60 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <PenLine
              className="size-3.5 transition-transform group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          )}
          <span>{isPending ? "okay okay, wait" : "sign it, go on"}</span>
        </button>

        <p
          id={statusId}
          role="status"
          aria-live="polite"
          className={cn(
            "text-sm leading-relaxed read-prose",
            state.status === "error" && "text-primary",
            state.status === "success" && "text-foreground/80",
            state.status === "idle" && "text-foreground/80",
          )}
        >
          {state.status === "idle" ? idleCopy(autoPublish) : state.message}
        </p>
      </div>
    </form>
  );
};

export default GuestbookForm;
