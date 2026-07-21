import type { GuestbookWallProps } from "@/types/guestbook";
import { formatJournalDate, formatRelativeDate } from "@/lib/utils";

const GuestbookWall = ({ entries }: GuestbookWallProps) => {
  if (entries.length === 0) {
    return (
      <div className="zen-card flex flex-col items-center gap-4 p-10 text-center md:p-14">
        <p className="kicker">zero. none. zilch</p>
        <p className="max-w-md text-base leading-relaxed text-foreground/70 read-prose">
          not one person has signed this. not one. i&apos;m completely normal about
          it. you could be the first, if you felt like it. no pressure.
          (there is so much pressure.)
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-8" aria-label="Guestbook signatures">
      <div className="flex items-baseline justify-between gap-4">
        <p className="kicker">look who showed up</p>
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground/70">
          {entries.length}
        </span>
      </div>

      <ul className="flex flex-col gap-4">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="zen-card flex flex-col gap-4 p-6 md:p-7"
          >
            <p className="text-base leading-relaxed text-foreground/80 read-prose">
              {entry.message}
            </p>
            <div className="flex items-center justify-between gap-4 border-t border-foreground/5 pt-4">
              <span className="font-display text-lg tracking-tight text-foreground/90">
                {entry.name}
              </span>
              <time
                dateTime={entry.signedAt}
                title={formatJournalDate(entry.signedAt)}
                className="shrink-0 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/70"
              >
                {formatRelativeDate(entry.signedAt)}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default GuestbookWall;
