"use client";

import { useState } from "react";
import GuestbookEntryCard from "@/components/guestbook/GuestbookEntry";
import GuestbookForm from "@/components/guestbook/GuestbookForm";
import type { GuestbookEntry } from "@/lib/db";

type Props = {
  initialEntries: GuestbookEntry[];
};

const GuestbookWall = ({ initialEntries }: Props) => {
  const [entries, setEntries] = useState(initialEntries);

  return (
    <div className="space-y-20">
      <div className="max-w-2xl min-w-0 overflow-hidden">
        <GuestbookForm
          onSubmitted={(entry) => {
            // Add the new entry to the list immediately
            setEntries((prev) => [
              { ...entry, status: entry.status ?? "approved" },
              ...prev,
            ]);
          }}
        />
      </div>
      
      <div className="space-y-12">
        <div className="border-b border-white/5 pb-3">
          <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/40">
            Messages
          </p>
        </div>
        
        <div className="space-y-0">
          {entries.map((entry) => (
            <GuestbookEntryCard key={entry.id} entry={entry} />
          ))}
          {entries.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-zen-mist/40">
                No messages yet. Be the first to leave one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestbookWall;
