export type GuestbookStatus = "pending" | "approved" | "rejected";

export type GuestbookEntry = {
  id: string;
  name: string | null;
  message: string;
  status: GuestbookStatus;
  createdAt: string;
  created_at?: string;
  updated_at?: string | null;
  edited?: boolean;
  approved?: boolean;
  rejected?: boolean;
};

const FALLBACK_ENTRIES: GuestbookEntry[] = [
  {
    id: "preview-1",
    name: "Alex",
    message:
      "Beautiful minimal design. The particle effects add a nice touch without being distracting.",
    createdAt: new Date().toISOString(),
    status: "approved",
  },
  {
    id: "preview-2",
    name: "Sam",
    message: "Clean and elegant. Really enjoying the zen garden aesthetic.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: "approved",
  },
];

// Convert API response to GuestbookEntry format
function normalizeEntry(item: any): GuestbookEntry {
  const createdAt = item.created_at || item.createdAt || new Date().toISOString();
  const approved = item.approved !== false;
  const rejected = item.rejected === true;
  
  let status: GuestbookStatus = "approved";
  if (rejected) status = "rejected";
  else if (!approved) status = "pending";

  return {
    id: item.id,
    name: item.name || "Anonymous",
    message: item.message,
    status,
    createdAt,
    created_at: item.created_at,
    updated_at: item.updated_at,
    edited: item.edited,
    approved: item.approved,
    rejected: item.rejected,
  };
}

export const isDatabaseConfigured = () =>
  Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);

export const fetchGuestbookEntries = async ({
  includePending = false,
  limit,
}: {
  includePending?: boolean;
  limit?: number;
} = {}): Promise<GuestbookEntry[]> => {
  // In server components, use direct database access
  // In client components, use API routes
  if (typeof window === "undefined") {
    // Server-side: import and use server function
    const { fetchGuestbookEntriesServer } = await import("./db-server");
    return fetchGuestbookEntriesServer({ includePending, limit });
  }

  // Client-side: use API route
  try {
    const baseUrl = window.location.origin;
    const url = new URL("/api/guestbook", baseUrl);
    if (limit) url.searchParams.set("limit", limit.toString());

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch entries");
    }

    const data = await response.json();
    const items = (data.items || []).map(normalizeEntry);

    if (includePending) {
      return items;
    }

    return items.filter((entry) => entry.status === "approved");
  } catch (error) {
    console.warn("Failed to fetch guestbook entries, using fallback:", error);
    return includePending
      ? FALLBACK_ENTRIES
      : FALLBACK_ENTRIES.slice(0, limit || 3);
  }
};

export const insertGuestbookEntry = async ({
  name,
  message,
}: {
  name: string;
  message: string;
}): Promise<GuestbookEntry> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");
  const url = new URL("/api/guestbook", baseUrl);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, message }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to submit entry");
  }

  const data = await response.json();
  return normalizeEntry(data.item);
};

export const updateGuestbookEntryStatus = async ({
  id,
  status,
}: {
  id: string;
  status: GuestbookStatus;
}): Promise<GuestbookEntry | undefined> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");
  const url = new URL("/api/guestbook/approve", baseUrl);

  const approved = status === "approved";
  const rejected = status === "rejected";

  const response = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token":
        process.env.GUESTBOOK_ADMIN_TOKEN || process.env.ADMIN_TOKEN || "",
    },
    body: JSON.stringify({ id, approved, rejected }),
  });

  if (!response.ok) {
    throw new Error("Failed to update entry");
  }

  // Fetch updated entry
  const entries = await fetchGuestbookEntries({ includePending: true });
  return entries.find((e) => e.id === id);
};

export const deleteGuestbookEntry = async (id: string): Promise<void> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");
  const url = new URL("/api/guestbook", baseUrl);
  url.searchParams.set("id", id);

  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      "x-admin-token":
        process.env.GUESTBOOK_ADMIN_TOKEN || process.env.ADMIN_TOKEN || "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete entry");
  }
};
