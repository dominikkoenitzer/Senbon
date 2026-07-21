"use client";

import { useId, useOptimistic, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateAutoApprove } from "@/app/guestbook/admin/actions";
import { cn } from "@/lib/utils";

interface AutoApproveToggleProps {
  initialAutoApprove: boolean;
}

/**
 * The one control that decides whether a stranger's text lands on a public
 * page unreviewed, so the state has to be readable at a glance and never
 * ambiguous: the switch position, the literal ON/OFF word, the colour, a
 * headline and a full sentence of consequence all move together.
 *
 * A silent failure here would be worse than no switch at all — the owner would
 * believe the wall was guarded when it wasn't — so the optimistic flip reverts
 * itself and says so out loud when the write doesn't land.
 */
const AutoApproveToggle = ({ initialAutoApprove }: AutoApproveToggleProps) => {
  // What we believe the server actually holds. Seeded from the prop, then
  // corrected by whatever the API reports it persisted.
  const [saved, setSaved] = useState(initialAutoApprove);
  const [lastProp, setLastProp] = useState(initialAutoApprove);
  const [failed, setFailed] = useState(false);
  const [autoApprove, setOptimistic] = useOptimistic(saved);
  const [isPending, startTransition] = useTransition();
  const statusId = useId();
  const descriptionId = useId();

  // Every successful write revalidates this route, and a second tab may have
  // flipped the switch meanwhile — a changed prop always beats our own memory.
  // Adjusting state during render is React's documented alternative here; an
  // effect would trip react-hooks/set-state-in-effect and cost a render pass.
  if (initialAutoApprove !== lastProp) {
    setLastProp(initialAutoApprove);
    setSaved(initialAutoApprove);
    setFailed(false);
  }

  const toggle = () => {
    const next = !autoApprove;

    startTransition(async () => {
      // Must be inside the transition: that is what lets React roll the value
      // back on its own if the write below never confirms.
      setOptimistic(next);
      setFailed(false);

      const result = await updateAutoApprove(next);

      if (!result.ok) {
        setFailed(true);
        return;
      }

      // Trust the API's own answer over our optimism.
      if (typeof result.autoApprove === "boolean") {
        setSaved(result.autoApprove);
      }
    });
  };

  return (
    <div className="zen-card flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:gap-8 md:p-7">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="kicker">auto-publish</p>

        <p className="font-display text-xl tracking-tight text-foreground md:text-2xl">
          {autoApprove ? "straight to the wall" : "held for you"}
        </p>

        <p
          id={descriptionId}
          className="max-w-md text-sm leading-relaxed text-foreground/85 read-prose md:text-base"
        >
          {autoApprove
            ? "new signatures go public the second someone hits sign. nobody reads them first. not even you. brave."
            : "new signatures wait right here until you approve them. nothing reaches the wall without you. good."}
        </p>

        <p
          id={statusId}
          role="status"
          aria-live="polite"
          className={cn(
            "flex min-h-5 items-center gap-2 text-sm leading-relaxed",
            failed ? "text-destructive" : "text-foreground/85",
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              <span>saving</span>
            </>
          ) : failed ? (
            <span>
              that didn&apos;t save. it&apos;s still {saved ? "on" : "off"}. try
              again in a second.
            </span>
          ) : null}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={autoApprove}
        aria-label="Publish new signatures immediately, without review"
        aria-describedby={`${descriptionId} ${statusId}`}
        data-state={autoApprove ? "on" : "off"}
        disabled={isPending}
        onClick={toggle}
        className="group inline-flex min-h-11 shrink-0 items-center gap-3 self-start rounded-full px-1 disabled:cursor-not-allowed disabled:opacity-60 md:self-center"
      >
        <span
          aria-hidden="true"
          className="w-7 text-xs lowercase text-foreground/80 transition-colors duration-300 group-data-[state=on]:text-destructive"
        >
          {autoApprove ? "on" : "off"}
        </span>

        {/*
          The knob has to be findable, not merely present. It was `bg-card` on
          a `bg-muted` track — 1.09:1 in light, 1.21:1 in dark, which is to say
          a white dot on a white groove. Someone with low vision could not tell
          which end it was sitting at, and the ON/OFF word beside it is
          `aria-hidden`: still painted, but it is a caption, not a fix.

          So the knob inverts with the state instead of holding one colour:
          ink on the pale OFF track (11.80:1 light / 10.61:1 dark), cream on
          the red ON track (5.67:1 / 5.28:1). Both clear 3:1 for non-text
          contrast with room to spare, and the colour flip is a second cue that
          works even if the travel of the knob is missed.
        */}
        <span className="relative inline-flex h-9 w-16 items-center rounded-full border border-foreground/25 bg-muted transition-colors duration-300 ease-out motion-reduce:transition-none group-data-[state=on]:border-destructive group-data-[state=on]:bg-destructive">
          <span
            aria-hidden="true"
            style={{ boxShadow: "var(--shadow-soft)" }}
            className="absolute left-1 size-7 rounded-full bg-foreground transition-[transform,background-color] duration-300 ease-out motion-reduce:transition-none group-data-[state=on]:translate-x-7 group-data-[state=on]:bg-destructive-foreground"
          />
        </span>
      </button>
    </div>
  );
};

export default AutoApproveToggle;
