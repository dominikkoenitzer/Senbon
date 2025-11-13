import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const JournalHero = () => {
  return (
    <section className="border-b border-white/10 pb-16">
      <div className="space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zen-mist/60 transition-colors hover:text-zen-gold mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to garden</span>
        </Link>
        <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/50">
          Journal
        </p>
        <h1 className="font-display text-5xl leading-[1.1] md:text-6xl lg:text-7xl">
          Thousand-fold garden notes
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zen-mist/70">
          A collection of thoughts, experiments, and notes. Every post is a git commit.
        </p>
      </div>
    </section>
  );
};

export default JournalHero;

