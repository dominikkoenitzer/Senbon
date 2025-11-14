"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    try {
      const response = await fetch("/api/guestbook/approve?status=pending", {
        headers: { "x-admin-token": currentToken },
      });
      if (!response.ok) {
        throw new Error("Unable to fetch entries");
      }
      const data = await response.json();
      const items = (data.items || []).map((item: {
        id: string;
        name?: string | null;
        message: string;
        approved?: boolean;
        rejected?: boolean;
        created_at?: string;
      }) => ({
        id: item.id,
        name: item.name || "Anonymous",
        message: item.message,
        status: item.approved === false ? "pending" : item.rejected === true ? "rejected" : "approved",
        createdAt: item.created_at || new Date().toISOString(),
      }));
      setEntries(items);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not fetch entries.",
      );
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
    const pending = entries.filter((entry) => entry.status === "pending");
    return {
      pending: pending.length,
      total: entries.length,
      approved: entries.filter((entry) => entry.status === "approved").length,
    };
  }, [entries]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="zen-card px-8 py-10">
        <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/60">
          Admin Gate
        </p>
        <h1 className="mt-4 font-display text-4xl">Guestbook Moderation</h1>
        <p className="mt-2 text-zen-mist/75">
          Use the token stored in `.env` as ADMIN_TOKEN. This panel only lives
          client-side; nothing routes through external services.
        </p>
        <div className="mt-6 flex flex-col gap-4 md:flex-row">
          <Input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Admin token..."
            type="password"
            className="bg-black/20"
          />
          <Button
            onClick={() => verifyToken()}
            disabled={loading || !token}
            className="rounded-full border border-zen-gold/40 bg-transparent text-zen-gold hover:bg-zen-gold/10"
          >
            {loading ? "Verifying..." : "Unlock"}
          </Button>
        </div>
        {message ? (
          <p className="mt-3 text-sm text-red-300">{message}</p>
        ) : null}
        {verified ? (
          <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-black/30 px-6 py-4 text-sm text-zen-mist/85 md:grid-cols-3">
            <p>
              Pending
              <span className="block text-2xl font-semibold text-zen-gold">
                {stats.pending}
              </span>
            </p>
            <p>
              Approved
              <span className="block text-2xl font-semibold text-zen-gold">
                {stats.approved}
              </span>
            </p>
            <p>
              Total
              <span className="block text-2xl font-semibold text-zen-gold">
                {stats.total}
              </span>
            </p>
          </div>
        ) : null}
      </header>

      {verified ? (
        <section className="space-y-4">
          {entries.map((entry) => (
            <AdminEntryCard
              key={entry.id}
              entry={entry}
              onAction={handleAction}
            />
          ))}
          {entries.length === 0 ? (
            <p className="text-center text-zen-mist/70">
              No entries yet. Refresh once someone writes in.
            </p>
          ) : null}
        </section>
      ) : (
        <p className="text-center text-zen-mist/70">
          Enter the admin token to see pending entries.
        </p>
      )}
    </div>
  );
};

export default AdminPage;

