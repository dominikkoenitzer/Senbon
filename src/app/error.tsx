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
      <div className="zen-card max-w-lg w-full px-8 py-12 md:px-12 md:py-16 text-center backdrop-blur-sm bg-black/20">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-zen-gold/40 mb-6">
          静寂が乱れた
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-zen-mist mb-4">
          A ripple passed through the garden.
        </h1>
        <p className="text-sm md:text-base text-zen-mist/60 leading-relaxed max-w-md mx-auto">
          Something went wrong while loading this page. The stones can be set
          back in place.
        </p>
        {error.digest && (
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-zen-mist/30">
            ref · {error.digest}
          </p>
        )}
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full border border-zen-gold/30 bg-zen-gold/5 px-5 py-2 text-xs uppercase tracking-[0.25em] text-zen-gold/80 transition-colors hover:text-zen-gold hover:border-zen-gold/60"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-zen-mist/70 transition-colors hover:text-zen-gold/80 hover:border-zen-gold/30"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
