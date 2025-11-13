import type { GuestbookEntry } from "@/lib/db";
import { formatJournalDate } from "@/lib/utils";

type Props = {
  entry: GuestbookEntry;
  highlight?: boolean;
};

const GuestbookEntryCard = ({ entry }: Props) => {
  return (
    <article className="border-b border-white/5 pb-8 last:border-0 last:pb-0">
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-display text-base text-zen-mist">
            {entry.name}
          </p>
          <p className="text-xs text-zen-mist/40 whitespace-nowrap">
            {formatJournalDate(entry.createdAt)}
          </p>
        </div>
        
        <p className="text-sm leading-relaxed text-zen-mist/70">
          {entry.message}
        </p>
      </div>
    </article>
  );
};

export default GuestbookEntryCard;
