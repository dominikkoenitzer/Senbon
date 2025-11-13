import type { GuestbookEntry } from "@/lib/db";
import { formatJournalDate } from "@/lib/utils";

type Props = {
  entry: GuestbookEntry;
  highlight?: boolean;
};

const GuestbookEntryCard = ({ entry }: Props) => {
  return (
    <article className="border-b border-white/5 pb-10 last:border-0 last:pb-0">
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-6">
          <p className="font-display text-lg text-zen-mist/90">
            {entry.name}
          </p>
          <p className="text-xs text-zen-mist/35 whitespace-nowrap">
            {formatJournalDate(entry.createdAt)}
          </p>
        </div>
        
        <p className="text-sm leading-relaxed text-zen-mist/65">
          {entry.message}
        </p>
      </div>
    </article>
  );
};

export default GuestbookEntryCard;
