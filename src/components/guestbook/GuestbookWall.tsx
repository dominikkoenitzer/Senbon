"use client";

import { useState } from "react";
import GuestbookEntryCard from "@/components/guestbook/GuestbookEntry";
import GuestbookForm from "@/components/guestbook/GuestbookForm";
import type { GuestbookEntry } from "@/lib/db";
import { Button } from "@/components/ui/button";
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
    <div className="grid gap-12 lg:grid-cols-[1.5fr,1fr]">
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/50">
              Messages
            </p>
            <h2 className="mt-2 font-display text-2xl">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshEntries}
            disabled={refreshing}
            className="text-zen-mist/60 hover:text-zen-gold"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        
        <div className="space-y-6">
          {entries.map((entry) => (
            <GuestbookEntryCard key={entry.id} entry={entry} />
          ))}
          {entries.length === 0 && (
            <div className="zen-card px-8 py-12 text-center">
              <p className="text-zen-mist/60">
                No messages yet. Be the first to leave one!
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
