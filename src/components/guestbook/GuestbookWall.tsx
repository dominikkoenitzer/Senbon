"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      const items = (data.items || []).map((item: any) => ({
        id: item.id,
        name: item.name || "Anonymous",
        message: item.message,
        status: item.approved === false ? "pending" : item.rejected === true ? "rejected" : "approved",
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      }));
      setEntries(items);
    } catch (error) {
      console.error("Failed to refresh guestbook entries:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="grid gap-20 lg:grid-cols-[1.2fr,1fr]">
      <div className="space-y-12">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/40">
            Messages
          </p>
          <motion.button
            onClick={refreshEntries}
            disabled={refreshing}
            className="text-xs text-zen-mist/30 hover:text-zen-gold/60 transition-colors flex items-center gap-2 relative overflow-hidden"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              className="absolute inset-0 bg-zen-gold/10 rounded-full"
              initial={{ scale: 0, opacity: 0.5 }}
              animate={refreshing ? { scale: 2, opacity: 0 } : {}}
              transition={{ duration: 0.6 }}
            />
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw className="h-3 w-3" />
            </motion.div>
            <span>Refresh</span>
          </motion.button>
        </div>
        
        <div className="space-y-0">
          <AnimatePresence mode="popLayout">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GuestbookEntryCard entry={entry} />
              </motion.div>
            ))}
          </AnimatePresence>
          {entries.length === 0 && (
            <motion.div
              className="py-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-zen-mist/40">
                No messages yet. Be the first to leave one.
              </p>
            </motion.div>
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
