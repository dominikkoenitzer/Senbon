"use client";

import { useState } from "react";
import type { GuestbookEntry, GuestbookStatus } from "@/lib/db";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

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
    <article className="border-b border-white/5 pb-10 last:border-0 last:pb-0 overflow-hidden">
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-6">
          <div>
            <p className="font-display text-lg text-zen-mist/90">
              {entry.name}
            </p>
            <p className="text-xs text-zen-mist/35 mt-1">
              {dayjs(entry.createdAt).format("MM/DD/YYYY HH:mm")}
            </p>
          </div>
        </div>
        
        <p className="text-sm leading-relaxed text-zen-mist/65 break-words">
          {entry.message}
        </p>
        
        <footer className="flex flex-wrap gap-3 pt-2">
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

