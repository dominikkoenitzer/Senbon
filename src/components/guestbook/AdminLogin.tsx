"use client";

import { useActionState, useId } from "react";
import { Loader2, Lock } from "lucide-react";
import { signIn, type AdminFormState } from "@/app/guestbook/admin/actions";

const INITIAL_STATE: AdminFormState = { status: "idle", message: "" };

/**
 * The whole signed-out surface. It looks identical whether moderation is
 * configured or not, and says nothing of its own about why an attempt failed —
 * the action's message is rendered verbatim and is the only thing allowed to
 * distinguish "wrong password" from "not configured" from "slow down".
 */
const AdminLogin = () => {
  const [state, formAction, isPending] = useActionState(signIn, INITIAL_STATE);
  const passwordId = useId();
  const statusId = useId();

  return (
    <form
      action={formAction}
      className="zen-card mx-auto flex w-full max-w-md flex-col gap-6 p-6 sm:p-8 md:p-10"
    >
      <div className="flex flex-col gap-3">
        <p className="kicker">moderation</p>
        <h1 className="font-display text-3xl tracking-tight text-foreground display-balance">
          prove it&apos;s you
        </h1>
        <p className="text-sm leading-relaxed text-foreground/85 read-prose">
          one password. you chose it yourself. i&apos;m choosing to believe you
          still know it.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={passwordId}
          className="text-xs uppercase tracking-[0.2em] text-foreground/80"
        >
          password
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          required
          aria-describedby={statusId}
          autoComplete="current-password"
          autoFocus
          className="w-full rounded-md border border-border bg-background/60 px-4 py-3 text-base text-foreground outline-none transition-colors focus-visible:border-primary/50"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2.5 rounded-full border border-primary/40 px-6 text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:border-primary/60 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Lock className="size-3.5" aria-hidden="true" />
        )}
        <span>{isPending ? "checking" : "let me in"}</span>
      </button>

      {/*
        Rendered exactly as the action returned it. Do not decorate this with
        hints, retry counts, or a friendlier rewrite — every extra word here is
        another thing a stranger learns about the door.
      */}
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className="min-h-5 text-sm leading-relaxed text-destructive read-prose"
      >
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
};

export default AdminLogin;
