"use client";

import { useState } from "react";
import GuestbookEntryCard from "@/components/guestbook/GuestbookEntry";
import GuestbookForm from "@/components/guestbook/GuestbookForm";
import type { GuestbookEntry } from "@/lib/db";
import { Button } from "@/components/ui/button";

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
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Messages</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshEntries}
            disabled={refreshing}
            className="text-zen-mist/70"
          >
            {refreshing ? "Loading..." : "Refresh"}
          </Button>
        </div>
        <div className="space-y-4">
          {entries.map((entry) => (
            <GuestbookEntryCard key={entry.id} entry={entry} />
          ))}
          {entries.length === 0 ? (
            <p className="text-sm text-zen-mist/70">
              No messages yet. Be the first to leave one!
            </p>
          ) : null}
        </div>
      </div>
      <GuestbookForm
        onSubmitted={(entry) =>
          setEntries((prev) => [
            { ...entry, status: entry.status ?? "pending" },
            ...prev,
          ])
        }
      />
    </div>
  );
};

export default GuestbookWall;

