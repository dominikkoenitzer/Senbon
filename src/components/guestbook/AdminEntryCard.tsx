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
    <article className="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-innerGlow">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-zen-gold">{entry.name}</p>
          <p className="text-xs text-zen-mist/70">
            {formatJournalDate(entry.createdAt)}
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-zen-mist/70">
          {entry.status}
        </span>
      </header>
      <p className="mt-4 text-sm leading-relaxed text-zen-mist/85">
        {entry.message}
      </p>
      <footer className="mt-4 flex flex-wrap gap-3">
        {entry.status === "pending" ? (
          <>
            <Button
              size="sm"
              className="rounded-full border border-zen-gold/40 bg-transparent text-zen-gold hover:bg-zen-gold/10"
              disabled={busy !== null}
              onClick={() => handleAction("approved")}
            >
              {busy === "approved" ? "Approving..." : "Approve"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border border-red-200/40 text-red-200 hover:bg-red-200/10"
              disabled={busy !== null}
              onClick={() => handleAction("rejected")}
            >
              {busy === "rejected" ? "Rejecting..." : "Reject"}
            </Button>
          </>
        ) : entry.status === "approved" ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border border-red-200/40 text-red-200 hover:bg-red-200/10"
            disabled={busy !== null}
            onClick={() => handleAction("rejected")}
          >
            {busy === "rejected" ? "Rejecting..." : "Reject"}
          </Button>
        ) : entry.status === "rejected" ? (
          <Button
            size="sm"
            className="rounded-full border border-zen-gold/40 bg-transparent text-zen-gold hover:bg-zen-gold/10"
            disabled={busy !== null}
            onClick={() => handleAction("approved")}
          >
            {busy === "approved" ? "Approving..." : "Approve"}
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full text-zen-mist/60 hover:bg-white/5"
          disabled={busy !== null}
          onClick={() => handleAction("delete")}
        >
          {busy === "delete" ? "Deleting..." : "Delete"}
        </Button>
      </footer>
    </article>
  );
};

export default AdminEntryCard;

