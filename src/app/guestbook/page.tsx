import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GuestbookForm from "@/components/guestbook/GuestbookForm";
import GuestbookWall from "@/components/guestbook/GuestbookWall";
import { getGuestbookEntries, isGuestbookConfigured } from "@/lib/guestbook";

export const metadata = {
  title: "Guestbook",
  description: "The Senbon guestbook.",
};

// Signatures appear as soon as they are approved, so the wall is never cached.
export const dynamic = "force-dynamic";

const GuestbookPage = async () => {
  const configured = isGuestbookConfigured();
  const entries = configured ? await getGuestbookEntries() : [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-6 py-12 md:gap-20 md:px-10 md:py-20 lg:py-24">
      <header className="flex flex-col gap-10">
        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-2 text-xs uppercase tracking-[0.3em] text-foreground/70 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back</span>
        </Link>

        <div className="flex flex-col gap-6">
          <p className="kicker">guestbook</p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl display-balance">
            sign it.
            <span className="italic text-foreground/80"> go on</span>.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-foreground/70 read-prose md:text-lg">
            no account, no email, no waiting around. type a name, say something,
            it&apos;s live. i read every single one, which should worry you slightly.
          </p>
        </div>

        <div className="zen-rule" />
      </header>

      {configured ? (
        <>
          <GuestbookForm />
          <GuestbookWall entries={entries} />
        </>
      ) : (
        <div className="zen-card flex flex-col items-center gap-4 p-10 text-center md:p-14">
          <p className="kicker">temporarily unavailable</p>
          <p className="max-w-md text-base leading-relaxed text-foreground/70 read-prose">
            the guestbook is down. not paused, not resting — down. i&apos;m on it.
          </p>
        </div>
      )}
    </div>
  );
};

export default GuestbookPage;
