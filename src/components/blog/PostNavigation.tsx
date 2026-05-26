import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { AdjacentSummary } from "@/lib/blog";

type Props = {
  newer: AdjacentSummary | null;
  older: AdjacentSummary | null;
};

const PostNavigation = ({ newer, older }: Props) => {
  if (!newer && !older) return null;

  return (
    <nav
      aria-label="Adjacent entries"
      className="mt-16 grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-2 md:mt-24 md:gap-6 md:pt-14"
    >
      {newer ? (
        <Link
          href={`/journal/${newer.slug}`}
          className="zen-card group flex flex-col gap-2 p-6 transition-transform hover:-translate-y-0.5 md:p-7"
        >
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-foreground/45">
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
            Newer
          </span>
          <span className="font-display text-lg leading-snug text-foreground/90 transition-colors group-hover:text-primary md:text-xl">
            {newer.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}

      {older ? (
        <Link
          href={`/journal/${older.slug}`}
          className="zen-card group flex flex-col items-end gap-2 p-6 text-right transition-transform hover:-translate-y-0.5 md:p-7"
        >
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-foreground/45">
            Older
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="font-display text-lg leading-snug text-foreground/90 transition-colors group-hover:text-primary md:text-xl">
            {older.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}
    </nav>
  );
};

export default PostNavigation;
