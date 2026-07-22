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
      <div className="zen-card w-full max-w-lg px-8 py-12 text-center md:px-12 md:py-16">
        <p className="kicker mb-6">error — my fault</p>
        <h1 className="font-display mb-5 text-3xl lowercase text-foreground display-balance md:text-4xl">
          okay, that wasn&apos;t supposed to happen.
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-foreground/85 read-prose md:text-base">
          it fell over on the way to you. hit the button, it usually works.
        </p>
        {error.digest && (
          <p className="mt-6 text-xs lowercase text-foreground/75">
            ref · {error.digest} — screenshot it if you&apos;re feeling generous
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-xs lowercase text-primary transition-colors hover:border-primary/60 hover:bg-primary/10"
          >
            try again
          </button>
          <Link
            href="/journal"
            className="rounded-full border border-border px-5 py-2 text-xs lowercase text-foreground/80 transition-colors hover:border-primary/30 hover:text-primary"
          >
            journal
          </Link>
          <Link
            href="/"
            className="rounded-full border border-border px-5 py-2 text-xs lowercase text-foreground/80 transition-colors hover:border-primary/30 hover:text-primary"
          >
            home
          </Link>
        </div>
      </div>
    </div>
  );
}
