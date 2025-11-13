import type { GuestbookEntry } from "@/lib/db";
import { formatJournalDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  entry: GuestbookEntry;
  highlight?: boolean;
};

const GuestbookEntryCard = ({ entry, highlight = false }: Props) => {
  return (
    <article
      className={cn(
        "rounded-3xl border border-white/5 bg-black/30 p-5 shadow-card backdrop-blur-xl transition",
        highlight
          ? "border-zen-gold/20 shadow-glow"
          : "hover:border-zen-gold/20 hover:shadow-glow/70",
      )}
    >
      <header className="flex items-center justify-between gap-4">
        <p className="font-semibold text-zen-gold">{entry.name}</p>
        <p className="text-xs uppercase tracking-[0.35em] text-zen-mist/60">
          {formatJournalDate(entry.createdAt)}
        </p>
      </header>
      <p className="mt-3 text-sm leading-relaxed text-zen-mist/85">
        {entry.message}
      </p>
      {entry.status !== "approved" ? (
        <p className="mt-3 text-xs uppercase tracking-[0.35em] text-amber-200/70">
          pending polishing
        </p>
      ) : null}
    </article>
  );
};

export default GuestbookEntryCard;

