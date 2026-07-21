"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { approveSignature, removeEntry } from "@/app/guestbook/admin/actions";
import { cn, formatJournalDate, formatRelativeDate } from "@/lib/utils";
import type { AdminGuestbookEntry } from "@/types/guestbook";

interface EntryRowProps {
  entry: AdminGuestbookEntry;
}

/** How long the delete button stays armed before it forgets it was asked. */
const DISARM_MS = 4000;

const idPayload = (id: string): FormData => {
  const data = new FormData();
  data.set("id", id);
  return data;
};

/**
 * One signature in the moderation list.
 *
 * Visitor-supplied name and message are hostile input by default — both get
 * `.overflow-wrap-anywhere` so a single unbroken 280-character string can't
 * push the card, and the page, sideways again.
 *
 * Deleting is irreversible and this page is used from a phone, so the delete
 * button arms on the first press and only commits on the second. It disarms
 * itself shortly after, because a button left permanently cocked is the same
 * hazard with extra steps.
 */
const EntryRow = ({ entry }: EntryRowProps) => {
  const awaitingReview = entry.status === "pending";

  const [armed, setArmed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [isApproving, startApprove] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const disarmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup only. This effect never writes state, which is the thing
  // react-hooks/set-state-in-effect actually forbids — the disarm timer is
  // started from a click handler, where a later setState is perfectly fine.
  useEffect(
    () => () => {
      if (disarmTimer.current) clearTimeout(disarmTimer.current);
    },
    [],
  );

  const busy = isApproving || isDeleting;

  const approve = () => {
    setFailed(false);
    startApprove(async () => {
      try {
        await approveSignature(idPayload(entry.id));
      } catch {
        setFailed(true);
      }
    });
  };

  const destroy = () => {
    if (disarmTimer.current) clearTimeout(disarmTimer.current);

    if (!armed) {
      setArmed(true);
      disarmTimer.current = setTimeout(() => setArmed(false), DISARM_MS);
      return;
    }

    setArmed(false);
    setFailed(false);
    startDelete(async () => {
      try {
        await removeEntry(idPayload(entry.id));
      } catch {
        setFailed(true);
      }
    });
  };

  return (
    <li
      style={awaitingReview ? { boxShadow: "var(--shadow-soft)" } : undefined}
      className={cn(
        "flex flex-col gap-4 p-5 md:p-6",
        // `.zen-card` is unlayered CSS, so a Tailwind `bg-*`/`border-*` utility
        // loses to it. A pending row builds its own surface instead of trying
        // to tint the card and silently failing.
        awaitingReview
          ? "rounded-[var(--radius)] border border-primary/50 bg-primary/10"
          : "zen-card",
        busy && "opacity-70",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {/*
          The pending badge is solid, not a tint. It used to be `bg-primary/15
          text-primary` sitting inside a row that is itself `bg-primary/10`, so
          the two clay washes stacked and the label landed at 3.78:1 — under
          AA for 10px text. Filling the badge takes it to 5.51:1 in light and
          7.35:1 in dark, and it no longer depends on what is underneath it.
        */}
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs lowercase",
            awaitingReview
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground/80",
          )}
        >
          {awaitingReview ? "waiting" : "published"}
        </span>

        <time
          dateTime={entry.signedAt}
          className="flex flex-wrap items-center gap-x-2 text-xs lowercase text-foreground/80"
        >
          <span>{formatRelativeDate(entry.signedAt)}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{formatJournalDate(entry.signedAt)}</span>
        </time>
      </div>

      <p className="overflow-wrap-anywhere text-base leading-relaxed text-foreground/85 read-prose">
        {entry.message}
      </p>

      <p className="overflow-wrap-anywhere min-w-0 font-display text-lg tracking-tight text-foreground">
        {entry.name}
      </p>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "min-h-5 text-sm leading-relaxed read-prose",
            failed || armed ? "text-destructive" : "text-foreground/85",
          )}
        >
          {failed
            ? "that didn't go through. the api may be restarting. try again."
            : armed
              ? "press it again and it's gone. permanently. there is no undo."
              : ""}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {awaitingReview && (
            <button
              type="button"
              onClick={approve}
              disabled={busy}
              aria-label={
                isApproving
                  ? `putting it up: approving the signature from ${entry.name}`
                  : `approve the signature from ${entry.name}`
              }
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-6 text-xs lowercase text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isApproving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="size-4" aria-hidden="true" />
              )}
              <span>{isApproving ? "putting it up" : "approve"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={destroy}
            disabled={busy}
            /*
              WCAG 2.5.3, Label in Name: every accessible name below starts
              with the exact words painted on the button, because a speech-input
              user says what they can see. "yes, delete" used to map to an
              accessible name beginning "Confirm:", so the spoken command
              matched nothing and the armed button could not be pressed by
              voice at all. Keep the visible string as the literal prefix — and
              keep the word "delete" in it, so nobody is ever unsure what the
              button does.
            */
            aria-label={
              isDeleting
                ? `deleting the signature from ${entry.name}`
                : armed
                  ? `yes, delete the signature from ${entry.name} permanently. this cannot be undone.`
                  : `delete the signature from ${entry.name}`
            }
            className={cn(
              "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border px-6 text-xs lowercase transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
              armed
                ? "border-destructive bg-destructive text-destructive-foreground"
                : "border-destructive/40 text-destructive hover:bg-destructive/10",
            )}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4" aria-hidden="true" />
            )}
            <span>
              {isDeleting ? "deleting" : armed ? "yes, delete" : "delete"}
            </span>
          </button>
        </div>
      </div>
    </li>
  );
};

export default EntryRow;
