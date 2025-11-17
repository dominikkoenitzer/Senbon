import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GuestbookWall from "@/components/guestbook/GuestbookWall";
import { fetchGuestbookEntries } from "@/lib/db";

export const metadata = {
  title: "Guestbook",
  description: "Leave a message in the Senbon guestbook.",
};

const GuestbookPage = async () => {
  const entries = await fetchGuestbookEntries({
    includePending: false,
    limit: 20,
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
      <header className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zen-mist/40 transition-colors hover:text-zen-gold/70 mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to garden</span>
        </Link>
        
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/40 mb-4">
            Guestbook
          </p>
          <h1 className="font-display text-4xl leading-[1.1] md:text-5xl">
            Leave a message
          </h1>
        </div>
      </header>

      <GuestbookWall initialEntries={entries} />
    </div>
  );
};

export default GuestbookPage;
