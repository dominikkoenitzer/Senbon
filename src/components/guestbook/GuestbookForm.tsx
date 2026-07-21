"use client";

import { useActionState, useId, useState } from "react";
import { Loader2, PenLine } from "lucide-react";
import { signGuestbook } from "@/app/guestbook/actions";
import type { GuestbookFormState } from "@/types/guestbook";
import { GUESTBOOK_CONFIG } from "@/constants/guestbook";
import { cn } from "@/lib/utils";

const INITIAL_STATE: GuestbookFormState = { status: "idle", message: "" };

const GuestbookForm = () => {
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

  return (
    <form action={formAction} className="zen-card flex flex-col gap-6 p-7 md:p-9">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={nameId}
          className="text-xs uppercase tracking-[0.25em] text-foreground/70"
        >
          your name (required, obviously)
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
          placeholder="what do i call you?"
          className="w-full rounded-md border border-foreground/10 bg-background/40 px-4 py-3 text-base text-foreground/90 outline-none transition-colors placeholder:text-foreground/70 focus-visible:border-primary/40"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={messageId}
          className="text-xs uppercase tracking-[0.25em] text-foreground/70"
        >
          your message
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
          placeholder="anything. literally anything. one letter. i'll take it."
          className="w-full resize-none rounded-md border border-foreground/10 bg-background/40 px-4 py-3 text-base leading-relaxed text-foreground/90 outline-none transition-colors placeholder:text-foreground/70 focus-visible:border-primary/40"
        />
        <span
          aria-hidden="true"
          className={cn(
            "self-end font-mono text-[11px] lowercase tracking-wider",
            remaining < 20 ? "text-primary" : "text-foreground/70",
          )}
        >
          {remaining < 20 ? `${remaining} left. wrap it up.` : remaining}
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
          <span>{isPending ? "okay okay wait" : "sign it"}</span>
        </button>

        <p
          id={statusId}
          role="status"
          aria-live="polite"
          className={cn(
            "text-sm leading-relaxed read-prose",
            state.status === "error" && "text-primary/90",
            state.status === "success" && "text-foreground/70",
            state.status === "idle" && "text-foreground/70",
          )}
        >
          {state.status === "idle"
            ? "goes up instantly. no approval, no vetting, no excuses left."
            : state.message}
        </p>
      </div>
    </form>
  );
};

export default GuestbookForm;
