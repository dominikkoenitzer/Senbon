"use client";

import { useState } from "react";
import GuestbookEntryCard from "@/components/guestbook/GuestbookEntry";
import GuestbookForm from "@/components/guestbook/GuestbookForm";
import type { GuestbookEntry } from "@/lib/db";
import { RefreshCw } from "lucide-react";

type Props = {
  initialEntries: GuestbookEntry[];
};

const GuestbookWall = ({ initialEntries }: Props) => {
  const [entries, setEntries] = useState(initialEntries);
  const [refreshing, setRefreshing] = useState(false);

  const refreshEntries = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/guestbook");
      const data = await res.json();
      const items = (data.items || []).map((item: any) => ({
        id: item.id,
        name: item.name || "Anonymous",
        message: item.message,
        status: item.approved === false ? "pending" : item.rejected === true ? "rejected" : "approved",
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      }));
      setEntries(items);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="grid gap-16 lg:grid-cols-[1.3fr,1fr]">
      <div className="space-y-12">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/50">
              Messages
            </p>
            <p className="mt-2 text-sm text-zen-mist/50">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <button
            onClick={refreshEntries}
            disabled={refreshing}
            className="text-xs text-zen-mist/40 hover:text-zen-gold/70 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        
        <div className="space-y-0">
          {entries.map((entry) => (
            <GuestbookEntryCard key={entry.id} entry={entry} />
          ))}
          {entries.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-zen-mist/50">
                No messages yet. Be the first to leave one.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="lg:sticky lg:top-24 lg:h-fit">
        <GuestbookForm
          onSubmitted={(entry) =>
            setEntries((prev) => [
              { ...entry, status: entry.status ?? "pending" },
              ...prev,
            ])
          }
        />
      </div>
    </div>
  );
};

export default GuestbookWall;
