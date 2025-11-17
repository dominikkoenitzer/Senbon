"use client";

import { useState } from "react";
import type { GuestbookEntry, GuestbookStatus } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { formatJournalDate } from "@/lib/utils";

type Props = {
  entry: GuestbookEntry;
  onAction: (id: string, action: GuestbookStatus | "delete") => Promise<void>;
};

const AdminEntryCard = ({ entry, onAction }: Props) => {
  const [busy, setBusy] = useState<GuestbookStatus | "delete" | null>(null);

  const handleAction = async (action: GuestbookStatus | "delete") => {
    setBusy(action);
    try {
      await onAction(entry.id, action);
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="border-b border-white/5 pb-10 last:border-0 last:pb-0">
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-6">
          <div>
            <p className="font-display text-lg text-zen-mist/90">
              {entry.name}
            </p>
            <p className="text-xs text-zen-mist/35 mt-1">
              {formatJournalDate(entry.createdAt)}
            </p>
          </div>
          <span className="text-xs uppercase tracking-[0.35em] text-zen-mist/50 whitespace-nowrap">
            {entry.status}
          </span>
        </div>
        
        <p className="text-sm leading-relaxed text-zen-mist/65">
          {entry.message}
        </p>
        
        <footer className="flex flex-wrap gap-3 pt-2">
          {entry.status === "pending" ? (
            <>
              <Button
                size="sm"
                className="rounded-none border border-zen-gold/15 bg-transparent text-zen-gold/80 hover:bg-zen-gold/5 hover:border-zen-gold/25 transition-all"
                disabled={busy !== null}
                onClick={() => handleAction("approved")}
              >
                {busy === "approved" ? "Approving..." : "Approve"}
              </Button>
              <Button
                size="sm"
                className="rounded-none border border-white/10 bg-transparent text-zen-mist/60 hover:bg-white/5 hover:border-white/20 transition-all"
                disabled={busy !== null}
                onClick={() => handleAction("rejected")}
              >
                {busy === "rejected" ? "Rejecting..." : "Reject"}
              </Button>
            </>
          ) : entry.status === "rejected" ? (
            <Button
              size="sm"
              className="rounded-none border border-zen-gold/15 bg-transparent text-zen-gold/80 hover:bg-zen-gold/5 hover:border-zen-gold/25 transition-all"
              disabled={busy !== null}
              onClick={() => handleAction("approved")}
            >
              {busy === "approved" ? "Approving..." : "Approve"}
            </Button>
          ) : null}
          <Button
            size="sm"
            className="rounded-none border border-white/10 bg-transparent text-zen-mist/50 hover:bg-white/5 hover:border-white/20 transition-all"
            disabled={busy !== null}
            onClick={() => handleAction("delete")}
          >
            {busy === "delete" ? "Deleting..." : "Delete"}
          </Button>
        </footer>
      </div>
    </article>
  );
};

export default AdminEntryCard;

