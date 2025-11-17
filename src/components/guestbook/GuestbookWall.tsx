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
      const res = await fetch("/api/guestbook", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      
      if (!res.ok) {
        throw new Error("Failed to refresh entries");
      }
      
      const data = await res.json();
      const items = (data.items || []).map((item: {
        id: string;
        name?: string | null;
        message: string;
        approved?: boolean;
        rejected?: boolean;
        created_at?: string;
        createdAt?: string;
      }) => ({
        id: item.id,
        name: item.name || "Anonymous",
        message: item.message,
        status: item.approved === false ? "pending" : item.rejected === true ? "rejected" : "approved",
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      }));
      setEntries(items);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to refresh guestbook entries:", error);
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-20">
      <div className="max-w-2xl min-w-0 overflow-hidden">
        <GuestbookForm
          onSubmitted={(entry) =>
            setEntries((prev) => [
              { ...entry, status: entry.status ?? "approved" },
              ...prev,
            ])
          }
        />
      </div>
      
      <div className="space-y-12">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/40">
            Messages
          </p>
          <button
            onClick={refreshEntries}
            disabled={refreshing}
            className="text-xs text-zen-mist/30 hover:text-zen-gold/60 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
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
