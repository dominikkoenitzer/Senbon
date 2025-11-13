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
    <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-20">
      <header className="space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zen-mist/60 transition-colors hover:text-zen-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to garden</span>
        </Link>
        
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/60">
            Guestbook
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
            Leave a message
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zen-mist/75">
            Messages are stored in Neon PostgreSQL and gently moderated before appearing publicly.
          </p>
        </div>
      </header>

      <GuestbookWall initialEntries={entries} />
    </div>
  );
};

export default GuestbookPage;
