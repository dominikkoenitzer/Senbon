import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const JournalHero = () => {
  return (
    <section className="space-y-8 pb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zen-mist/60 transition-colors hover:text-zen-gold mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to garden</span>
      </Link>
      
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/50 mb-4 font-light">
            Journal
          </p>
          <h1 className="font-display text-5xl leading-[1.1] md:text-6xl lg:text-7xl text-zen-mist mb-6">
            Thousand-fold garden notes
          </h1>
        </div>
        
        <p className="max-w-2xl text-lg leading-relaxed text-zen-mist/75 font-light">
          A collection of thoughts, experiments, and notes. Every post is a git commit.
        </p>
      </div>
    </section>
  );
};

export default JournalHero;
