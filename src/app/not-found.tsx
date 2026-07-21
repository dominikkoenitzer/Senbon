import Link from "next/link";

export const metadata = {
  title: "Lost in the garden",
};

export default function NotFound() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-6">
      <div className="zen-card max-w-xl w-full px-8 py-12 md:px-12 md:py-16 text-center bg-muted">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-primary/40 mb-6">
          404 — 迷子
        </p>
        <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">
          A path that doesn&apos;t lead anywhere.
        </h1>
        <p className="text-sm md:text-base text-foreground/70 leading-relaxed max-w-md mx-auto">
          The page you were looking for has drifted out of the garden. Take a
          breath and return to a known stone.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-xs uppercase tracking-[0.25em] text-primary/80 transition-colors hover:text-primary hover:border-primary/60"
          >
            Home
          </Link>
          <Link
            href="/journal"
            className="rounded-full border border-border px-5 py-2 text-xs uppercase tracking-[0.25em] text-foreground/70 transition-colors hover:text-primary/80 hover:border-primary/30"
          >
            Journal
          </Link>
          <Link
            href="/guestbook"
            className="rounded-full border border-border px-5 py-2 text-xs uppercase tracking-[0.25em] text-foreground/70 transition-colors hover:text-primary/80 hover:border-primary/30"
          >
            Guestbook
          </Link>
        </div>
      </div>
    </div>
  );
}
