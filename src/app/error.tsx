"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-6">
      <div className="zen-card w-full max-w-lg bg-muted px-8 py-12 text-center md:px-12 md:py-16">
        <p className="kicker mb-6">error — my fault</p>
        <h1 className="font-display mb-5 text-3xl lowercase text-foreground display-balance md:text-4xl">
          okay, that was not supposed to happen.
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-foreground/85 read-prose md:text-base">
          this page fell over on its way to you. hit the button — it works far
          more often than something written by me deserves to. if it fails
          twice, go read the journal instead and let me sulk about it privately.
        </p>
        {error.digest && (
          <div className="mt-6 flex flex-col gap-1.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/75">
              ref · {error.digest}
            </p>
            <p className="text-xs leading-relaxed text-foreground/75 read-prose">
              screenshot that bit if you&apos;re feeling generous. it means
              nothing to you and everything to me.
            </p>
          </div>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-xs uppercase tracking-[0.25em] text-primary transition-colors hover:border-primary/60 hover:bg-primary/10"
          >
            try again
          </button>
          <Link
            href="/journal"
            className="rounded-full border border-border px-5 py-2 text-xs uppercase tracking-[0.25em] text-foreground/80 transition-colors hover:border-primary/30 hover:text-primary"
          >
            journal
          </Link>
          <Link
            href="/"
            className="rounded-full border border-border px-5 py-2 text-xs uppercase tracking-[0.25em] text-foreground/80 transition-colors hover:border-primary/30 hover:text-primary"
          >
            home
          </Link>
        </div>
      </div>
    </div>
  );
}
