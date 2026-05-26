import Link from "next/link";

export const metadata = {
  title: "Lost in the garden",
};

export default function NotFound() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-6">
      <div className="zen-card max-w-xl w-full px-8 py-12 md:px-12 md:py-16 text-center backdrop-blur-sm bg-black/20">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-zen-gold/40 mb-6">
          404 — 迷子
        </p>
        <h1 className="font-display text-3xl md:text-5xl text-zen-mist mb-4">
          A path that doesn&apos;t lead anywhere.
        </h1>
        <p className="text-sm md:text-base text-zen-mist/60 leading-relaxed max-w-md mx-auto">
          The page you were looking for has drifted out of the garden. Take a
          breath and return to a known stone.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-zen-gold/30 bg-zen-gold/5 px-5 py-2 text-xs uppercase tracking-[0.25em] text-zen-gold/80 transition-colors hover:text-zen-gold hover:border-zen-gold/60"
          >
            Home
          </Link>
          <Link
            href="/journal"
            className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-zen-mist/70 transition-colors hover:text-zen-gold/80 hover:border-zen-gold/30"
          >
            Journal
          </Link>
          <Link
            href="/guestbook"
            className="rounded-full border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-zen-mist/70 transition-colors hover:text-zen-gold/80 hover:border-zen-gold/30"
          >
            Guestbook
          </Link>
        </div>
      </div>
    </div>
  );
}
