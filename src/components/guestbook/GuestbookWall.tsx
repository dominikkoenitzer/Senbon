import type { GuestbookWallProps } from "@/types/guestbook";
import { formatJournalDate, formatRelativeDate } from "@/lib/utils";

const GuestbookWall = ({ entries }: GuestbookWallProps) => {
  if (entries.length === 0) {
    return (
      <div className="zen-card flex flex-col items-center gap-4 p-10 text-center md:p-14">
        <p className="kicker">still nobody</p>
        <p className="max-w-md text-base leading-relaxed text-foreground/85 read-prose">
          sign it. i refresh this page like the number is going to change on its
          own and it never does and you are the only person standing here. four
          words. that&apos;s all i want. i&apos;m not going to beg for it.
          <span className="text-primary"> ...please.</span>
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-8" aria-label="Guestbook signatures">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <p className="kicker">look who finally bothered</p>
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.25em] text-foreground/80">
            {entries.length}
          </span>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-foreground/80 read-prose">
          the people who did the bare minimum. i think about them constantly.
          put your name down there with them.
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="zen-card flex flex-col gap-4 p-6 md:p-7"
          >
            <p className="overflow-wrap-anywhere text-base leading-relaxed text-foreground/80 read-prose">
              {entry.message}
            </p>
            <div className="flex items-center justify-between gap-4 border-t border-foreground/5 pt-4">
              <span className="overflow-wrap-anywhere min-w-0 font-display text-lg tracking-tight text-foreground/90">
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
