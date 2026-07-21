"use client";

import { useActionState, useId } from "react";
import { Loader2, Lock } from "lucide-react";
import { signIn, type AdminFormState } from "@/app/guestbook/admin/actions";

const INITIAL_STATE: AdminFormState = { status: "idle", message: "" };

const AdminLogin = () => {
  const [state, formAction, isPending] = useActionState(signIn, INITIAL_STATE);
  const passwordId = useId();

  return (
    <form
      action={formAction}
      className="zen-card mx-auto flex w-full max-w-md flex-col gap-6 p-8 md:p-10"
    >
      <div className="flex flex-col gap-2">
        <p className="kicker">moderation</p>
        <h2 className="font-display text-2xl tracking-tight text-foreground">
          sign in to tend the wall
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={passwordId}
          className="text-xs uppercase tracking-[0.2em] text-foreground/70"
        >
          Password
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
          className="w-full rounded-md border border-border bg-background/60 px-4 py-3 text-base text-foreground outline-none transition-colors focus-visible:border-primary/50"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-fit items-center gap-2.5 rounded-full border border-primary/30 px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:border-primary/60 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Lock className="size-3.5" aria-hidden="true" />
        )}
        <span>{isPending ? "Checking" : "Sign in"}</span>
      </button>

      <p
        role="status"
        aria-live="polite"
        className="min-h-5 text-sm text-primary/90"
      >
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
};

export default AdminLogin;
