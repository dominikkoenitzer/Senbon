import GuestbookWall from "@/components/guestbook/GuestbookWall";
import TimeOfDaySecret from "@/components/easter-eggs/TimeOfDaySecret";
import { fetchGuestbookEntries } from "@/lib/db";

export const metadata = {
  title: "Guestbook",
  description: "Leave a message in the Senbon guestbook.",
};

const GuestbookPage = async () => {
  const entries = await fetchGuestbookEntries({
    includePending: false,
    limit: 16,
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
      <section className="zen-card relative overflow-hidden px-8 py-12">
        <div className="absolute inset-0 bg-gradient-to-r from-zen-moss/15 to-transparent" />
        <div className="relative z-10 grid gap-10 md:grid-cols-[2fr,1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/70">
              Guestbook
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Leave a message
            </h1>
            <p className="mt-4 text-lg text-zen-mist/80">
              Messages are stored in Neon PostgreSQL until an admin approves them.
              All entries are gently moderated before appearing publicly.
            </p>
            <p className="mt-4 text-sm text-zen-mist/70">
              Minimal data is collected (IP + user agent) only for spam control.
            </p>
          </div>
          <TimeOfDaySecret />
        </div>
      </section>
      <GuestbookWall initialEntries={entries} />
    </div>
  );
};

export default GuestbookPage;

