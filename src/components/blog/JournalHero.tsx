import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const JournalHero = () => {
  return (
    <section className="space-y-6 md:space-y-8 pb-4 md:pb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs md:text-sm text-zen-mist/60 transition-colors hover:text-zen-gold mb-4 md:mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span>Back to garden</span>
      </Link>
      
      <div className="space-y-4 md:space-y-6">
        <div>
          <p className="text-[0.65rem] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.5em] text-zen-gold/50 mb-3 md:mb-4 font-light">
            Journal
          </p>
          <h1 className="font-display text-3xl leading-[1.15] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-zen-mist mb-4 md:mb-6">
            Thousand-fold garden notes
          </h1>
        </div>
        
        <p className="max-w-2xl text-sm md:text-base lg:text-lg leading-relaxed text-zen-mist/75 font-light">
          A collection of thoughts, experiments, and notes. Every post is a git commit.
        </p>
      </div>
    </section>
  );
};

export default JournalHero;
