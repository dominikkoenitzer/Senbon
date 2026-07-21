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
    <div className="relative min-h-[70vh] flex items-center justify-center px-6">
      <div className="zen-card max-w-lg w-full px-8 py-12 md:px-12 md:py-16 text-center bg-muted">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-primary/40 mb-6">
          静寂が乱れた
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
          A ripple passed through the garden.
        </h1>
        <p className="text-sm md:text-base text-foreground/70 leading-relaxed max-w-md mx-auto">
          Something went wrong while loading this page. The stones can be set
          back in place.
        </p>
        {error.digest && (
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-foreground/70">
            ref · {error.digest}
          </p>
        )}
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-xs uppercase tracking-[0.25em] text-primary/80 transition-colors hover:text-primary hover:border-primary/60"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-border px-5 py-2 text-xs uppercase tracking-[0.25em] text-foreground/70 transition-colors hover:text-primary/80 hover:border-primary/30"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
