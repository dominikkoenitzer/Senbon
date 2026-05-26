import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  count: number;
};

const JournalHero = ({ count }: Props) => {
  return (
    <section className="flex flex-col gap-10 md:gap-14">
      <Link
        href="/"
        className="group inline-flex w-fit items-center gap-2 text-xs uppercase tracking-[0.3em] text-foreground/45 transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Back</span>
      </Link>

      <div className="grid gap-10 md:grid-cols-[1.5fr_1fr] md:items-end md:gap-16">
        <div className="flex flex-col gap-6">
          <p className="kicker">The Journal · 日記</p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[5.5rem] display-balance">
            Notes from a
            <span className="italic text-foreground/80"> thousand-fold</span>{" "}
            garden.
          </h1>
        </div>

        <div className="flex flex-col gap-4 text-sm leading-relaxed text-foreground/70 md:text-right">
          <p className="read-prose md:max-w-sm md:ml-auto">
            Field notes on building, breaking, and reassembling. Each entry is
            a git commit — a single, small thing kept on purpose.
          </p>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-foreground/45 md:justify-end">
            <span>{count} {count === 1 ? "entry" : "entries"}</span>
            <span className="h-3 w-px bg-foreground/15" aria-hidden="true" />
            <span>updated · {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>

      <div className="zen-rule" />
    </section>
  );
};

export default JournalHero;
