import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GuestbookForm from "@/components/guestbook/GuestbookForm";
import GuestbookWall from "@/components/guestbook/GuestbookWall";
import type { GuestbookEntry } from "@/types/guestbook";
import { resolveAutoPublish } from "@/app/guestbook/actions";
import { getGuestbookEntries, isGuestbookConfigured } from "@/lib/guestbook";

export const metadata = {
  title: "Guestbook",
  description: "The Senbon guestbook.",
};

// Signatures land either the moment they are sent or once they are approved,
// depending on the runtime auto-publish toggle, so the wall is never cached.
export const dynamic = "force-dynamic";

/**
 * The one sentence on this page that states when a signature becomes visible.
 * The form's idle line reads the same boolean, so the two cannot drift apart
 * the way they did when each carried its own hardcoded promise. `null` means
 * the mode could not be read, and then nothing is claimed at all.
 */
const PUBLISH_CLAIM = {
  published: "it is on the wall before you finish reading this sentence.",
  held: "then it comes to me, i read it, and up it goes.",
} as const;

const GuestbookPage = async () => {
  const configured = isGuestbookConfigured();

  // Only the boolean crosses into the markup — resolveAutoPublish runs on the
  // server and GUESTBOOK_ADMIN_TOKEN stays there.
  const [entries, autoPublish]: [GuestbookEntry[], boolean | null] = configured
    ? await Promise.all([getGuestbookEntries(), resolveAutoPublish()])
    : [[], null];

  const publishClaim =
    autoPublish === null
      ? null
      : autoPublish
        ? PUBLISH_CLAIM.published
        : PUBLISH_CLAIM.held;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-6 py-12 md:gap-20 md:px-10 md:py-20 lg:py-24">
      <header className="flex flex-col gap-10">
        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-2 text-xs lowercase text-foreground/70 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>back</span>
        </Link>

        <div className="flex flex-col gap-6">
          <p className="kicker">guestbook</p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl display-balance">
            sign it.
            <span className="italic text-primary"> i&apos;ll wait</span>.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-foreground/85 read-prose md:text-lg">
            no account, no email, no hoops. name, thing, sign — nine seconds.{" "}
            {publishClaim ? `${publishClaim} ` : ""}and people still scroll all
            the way down and leave. i can see that, you know.
          </p>
        </div>

        <div className="zen-rule" />
      </header>

      {configured ? (
        <>
          <GuestbookForm autoPublish={autoPublish} />
          <GuestbookWall entries={entries} />
        </>
      ) : (
        <div className="zen-card flex flex-col items-center gap-4 p-10 text-center md:p-14">
          <p className="kicker">briefly, humiliatingly, down</p>
          <p className="max-w-md text-base leading-relaxed text-foreground/85 read-prose">
            not &quot;paused&quot;, not &quot;resting&quot; — broken. on the one day you
            came, obviously. i&apos;m fixing it. stop looking at me.
          </p>
        </div>
      )}
    </div>
  );
};

export default GuestbookPage;
