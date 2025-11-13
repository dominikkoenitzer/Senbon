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
        "zen-card transition-all",
        highlight
          ? "border-zen-gold/30 bg-zen-gold/5"
          : "hover:border-zen-gold/20",
      )}
    >
      <div className="p-6 space-y-4">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-lg text-zen-gold">
              {entry.name}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-zen-mist/50">
              {formatJournalDate(entry.createdAt)}
            </p>
          </div>
        </header>
        
        <p className="text-sm leading-relaxed text-zen-mist/80">
          {entry.message}
        </p>
        
        {entry.status !== "approved" && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs uppercase tracking-[0.3em] text-zen-gold/60">
              Pending approval
            </p>
          </div>
        )}
      </div>
    </article>
  );
};

export default GuestbookEntryCard;
