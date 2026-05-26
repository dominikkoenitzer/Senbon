import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GuestbookWall from "@/components/guestbook/GuestbookWall";
import { fetchGuestbookEntries } from "@/lib/db";

export const metadata = {
  title: "Guestbook",
  description: "Leave a message in the Senbon guestbook.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GuestbookPage = async () => {
  let entries: Awaited<ReturnType<typeof fetchGuestbookEntries>> = [];

  try {
    entries = await fetchGuestbookEntries({
      includePending: false,
      limit: 50,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[GuestbookPage] fetch failed:", error);
    }
    entries = [];
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-6 py-12 md:gap-20 md:px-10 md:py-20 lg:py-24">
      <header className="flex flex-col gap-10">
        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-2 text-xs uppercase tracking-[0.3em] text-foreground/45 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back</span>
        </Link>

        <div className="flex flex-col gap-6">
          <p className="kicker">Guestbook · 芳名帳</p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl display-balance">
            Leave a mark on
            <span className="italic text-foreground/80"> the stone</span>.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-foreground/70 read-prose md:text-lg">
            A quiet wall. Sign your name, leave a sentence — anything kind, or
            anything true. New entries are held briefly, then bloom.
          </p>
        </div>

        <div className="zen-rule" />
      </header>

      <GuestbookWall initialEntries={entries} />
    </div>
  );
};

export default GuestbookPage;
