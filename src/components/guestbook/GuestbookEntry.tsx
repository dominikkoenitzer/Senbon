import type { GuestbookEntry } from "@/lib/db";
import dayjs from "dayjs";

type Props = {
  entry: GuestbookEntry;
  highlight?: boolean;
};

const GuestbookEntryCard = ({ entry }: Props) => {
  return (
    <article className="border-b border-white/5 pb-10 pt-8 first:pt-0 last:border-0 last:pb-0 overflow-hidden group">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <p className="font-display text-xl text-zen-mist/95 font-medium tracking-tight mb-2">
              {entry.name}
            </p>
            <p className="text-xs text-zen-mist/40 font-light tracking-wider">
              {dayjs(entry.createdAt).format("MM/DD/YYYY HH:mm")}
            </p>
          </div>
        </div>
        
        <div className="pl-0 border-l-2 border-white/5 group-hover:border-zen-gold/20 transition-colors">
          <p className="text-base leading-[1.9] text-zen-mist/80 font-light tracking-wide break-words pl-6">
            {entry.message}
          </p>
        </div>
      </div>
    </article>
  );
};

export default GuestbookEntryCard;
