"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import AdminEntryCard from "@/components/guestbook/AdminEntryCard";
import type { GuestbookEntry, GuestbookStatus } from "@/lib/db";

const AdminPage = () => {
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("senbon-admin-token");
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (token.length === 0) return;
    const stored = window.localStorage.getItem("senbon-admin-token");
    if (stored && stored === token && !verified) {
      verifyToken(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verifyToken = async (override?: string) => {
    const candidate = override ?? token;
    if (!candidate) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: candidate }),
      });
      const data = await response.json();
      if (data.valid) {
        setVerified(true);
        window.localStorage.setItem("senbon-admin-token", candidate);
        setToken(candidate);
        await fetchEntries(candidate);
      } else {
        setVerified(false);
        setMessage("That token doesn't match the env value.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to verify token right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async (currentToken = token) => {
    if (!currentToken) return;
    setLoading(true);
    setMessage(null);
    try {
      // Fetch all approved entries
      const response = await fetch("/api/guestbook/approve?status=approved", {
        headers: { "x-admin-token": currentToken },
      });

      if (!response.ok) {
        throw new Error("Unable to fetch entries");
      }

      const data = await response.json();
      
      const allItems: GuestbookEntry[] = (data.items || []).map((item: {
        id: string;
        name?: string | null;
        message: string;
        approved?: boolean;
        rejected?: boolean;
        created_at?: string;
      }): GuestbookEntry => ({
        id: item.id,
        name: item.name || "Anonymous",
        message: item.message,
        status: "approved" as GuestbookStatus,
        createdAt: item.created_at || new Date().toISOString(),
      }));

      // Sort by created_at, newest first
      allItems.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setEntries(allItems);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not fetch entries.",
      );
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    id: string,
    action: GuestbookStatus | "delete",
  ) => {
    if (!token) return;
    setLoading(true);
    setMessage(null);
    try {
      if (action === "delete") {
        const response = await fetch(`/api/guestbook?id=${id}`, {
          method: "DELETE",
          headers: {
            "x-admin-token": token,
          },
        });
        if (!response.ok) throw new Error("Delete failed.");
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
      } else if (action === "pending") {
        // Can't set to pending, ignore
        return;
      } else {
        const response = await fetch("/api/guestbook/approve", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": token,
          },
          body: JSON.stringify({
            id,
            approved: action === "approved",
            rejected: action === "rejected",
          }),
        });
        if (!response.ok) throw new Error("Action failed.");
        // Refresh entries after update
        await fetchEntries(token);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update entry.",
      );
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: entries.length,
    };
  }, [entries]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-24 px-6 py-24">
      <header className="space-y-8">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/40">
            Admin Gate
          </p>
          <h1 className="font-display text-4xl leading-[1.1] md:text-5xl lg:text-6xl">
            Guestbook Moderation
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zen-mist/55">
            Secure moderation panel for managing guestbook entries. All actions require authentication.
          </p>
        </div>

        {!verified ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Enter admin token..."
                type="password"
                className="bg-transparent border-0 border-b border-white/10 focus:border-zen-gold/30 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && token) {
                    verifyToken();
                  }
                }}
              />
              <Button
                onClick={() => verifyToken()}
                disabled={loading || !token}
                className="rounded-none border border-zen-gold/15 bg-transparent text-zen-gold/80 hover:bg-zen-gold/5 hover:border-zen-gold/25 transition-all"
              >
                {loading ? "Verifying..." : "Unlock"}
              </Button>
            </div>
            {message ? (
              <p className="text-xs text-zen-mist/50">{message}</p>
            ) : null}
          </div>
        ) : (
          <div className="border-b border-white/5 pb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-zen-mist/40 mb-2">
                Total Entries
              </p>
              <p className="text-2xl font-display text-zen-gold">
                {stats.total}
              </p>
            </div>
          </div>
        )}
      </header>

      {verified ? (
        <section className="space-y-12">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/40">
              Entries
            </p>
            <button
              onClick={() => fetchEntries(token)}
              disabled={loading}
              className="text-xs text-zen-mist/30 hover:text-zen-gold/60 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {loading && entries.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-zen-mist/40">Loading entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-zen-mist/40">
                No entries yet. New entries will appear here once submitted.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {entries.map((entry) => (
                <AdminEntryCard
                  key={entry.id}
                  entry={entry}
                  onAction={handleAction}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="py-16 text-center">
          <p className="text-sm text-zen-mist/40">
            Enter the admin token above to access the moderation panel.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

