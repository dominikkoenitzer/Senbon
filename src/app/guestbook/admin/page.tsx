import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";
import AdminLogin from "@/components/guestbook/AdminLogin";
import AutoApproveToggle from "@/components/guestbook/AutoApproveToggle";
import EntryRow from "@/components/guestbook/EntryRow";
import { signOut } from "@/app/guestbook/admin/actions";
import {
  fetchAllEntries,
  fetchAutoApprove,
  isSignedIn,
} from "@/lib/guestbook-admin";
import { cn } from "@/lib/utils";
import type { AdminGuestbookEntry } from "@/types/guestbook";

export const metadata = {
  title: "Guestbook moderation",
};

export const dynamic = "force-dynamic";

/** Newest first, so a signature left five minutes ago is never buried. */
const byNewest = (a: AdminGuestbookEntry, b: AdminGuestbookEntry): number =>
  new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime();

interface StatProps {
  value: number;
  label: string;
  emphasis?: boolean;
}

/*
 * `.zen-card` is unlayered CSS and Tailwind's utilities live in a cascade
 * layer, so a `bg-*`/`border-*` utility cannot override the card's own
 * background or border. The emphasised tile therefore builds its surface from
 * utilities instead of stacking them on top of `.zen-card` and losing.
 */
const Stat = ({ value, label, emphasis = false }: StatProps) => (
  <div
    style={emphasis ? { boxShadow: "var(--shadow-soft)" } : undefined}
    className={cn(
      "flex flex-col gap-2 p-4 md:p-5",
      emphasis
        ? "rounded-[var(--radius)] border border-primary/50 bg-primary/10"
        : "zen-card",
    )}
  >
    <span
      className={cn(
        "font-display text-3xl leading-none tracking-tight md:text-4xl",
        emphasis ? "text-primary" : "text-foreground",
      )}
    >
      {value}
    </span>
    <span className="kicker">{label}</span>
  </div>
);

const AdminPage = async () => {
  // Deliberately the only gate. There is no separate "not configured" screen:
  // an unconfigured deploy shows the same login form as a wrong password, and
  // the sign-in action is the single thing allowed to say which it was.
  const signedIn = await isSignedIn();

  let entries: AdminGuestbookEntry[] = [];
  let loadError = false;
  let autoApprove: boolean | null = null;

  if (signedIn) {
    // Independent failures: the wall can still be moderated if settings are
    // briefly unreachable, and the toggle can still render if the list isn't.
    const [entriesResult, settingsResult] = await Promise.allSettled([
      fetchAllEntries(),
      fetchAutoApprove(),
    ]);

    if (entriesResult.status === "fulfilled") {
      entries = entriesResult.value;
    } else {
      console.error("[guestbook-admin] list failed:", entriesResult.reason);
      loadError = true;
    }

    if (settingsResult.status === "fulfilled") {
      autoApprove = settingsResult.value;
    } else {
      console.error(
        "[guestbook-admin] settings failed:",
        settingsResult.reason,
      );
    }
  }

  // Pending first, always — a stranger's unreviewed text is the whole reason
  // this page exists. Published history can wait below the fold.
  const pending = entries
    .filter((entry) => entry.status === "pending")
    .sort(byNewest);
  const published = entries
    .filter((entry) => entry.status !== "pending")
    .sort(byNewest);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-10 sm:px-6 md:gap-12 md:px-10 md:py-20">
      <header className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/guestbook"
            className="group inline-flex min-h-11 w-fit items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:text-primary"
          >
            <ArrowLeft
              className="size-3.5 transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            <span>back to the wall</span>
          </Link>

          {signedIn && (
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sign out of guestbook moderation"
                className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-xs uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
              >
                sign out
              </button>
            </form>
          )}
        </div>

        {signedIn && (
          <div className="flex flex-col gap-4">
            <p className="kicker">moderation</p>
            <h1 className="font-display text-4xl tracking-tight text-foreground display-balance md:text-5xl">
              the back room
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-foreground/85 read-prose">
              everything anyone has ever left here, plus whatever is still
              waiting on a yes from you. take your time. (do not take your
              time.)
            </p>
          </div>
        )}

        {signedIn && !loadError && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Stat value={entries.length} label="signed" />
              <Stat
                value={pending.length}
                label={pending.length > 0 ? "waiting" : "all clear"}
                emphasis={pending.length > 0}
              />
            </div>

            {pending.length > 0 && (
              <p className="flex items-start gap-3 rounded-[var(--radius)] border border-primary/50 bg-primary/10 px-4 py-4 text-sm leading-relaxed text-foreground/85 read-prose md:text-base">
                <Inbox
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>
                  {pending.length === 1
                    ? "one signature is waiting on you. one. it's right there."
                    : `${pending.length} signatures are waiting on you. they are not going to approve themselves.`}
                </span>
              </p>
            )}
          </div>
        )}
      </header>

      {!signedIn ? (
        <AdminLogin />
      ) : (
        <div className="flex flex-col gap-10">
          {autoApprove === null ? (
            <div className="zen-card flex flex-col gap-2 p-6">
              <p className="kicker">auto-publish</p>
              <p className="text-sm leading-relaxed text-foreground/85 read-prose">
                couldn&apos;t read the setting, so you don&apos;t get a switch
                you can&apos;t trust. refresh in a moment.
              </p>
            </div>
          ) : (
            <AutoApproveToggle initialAutoApprove={autoApprove} />
          )}

          {loadError ? (
            <div className="zen-card flex flex-col items-center gap-4 p-8 text-center md:p-12">
              <p className="kicker">can&apos;t reach it</p>
              <p className="max-w-md text-base leading-relaxed text-foreground/85 read-prose">
                the api isn&apos;t answering. it does this sometimes, usually
                while restarting. give it a second and refresh.
              </p>
            </div>
          ) : entries.length === 0 ? (
            <div className="zen-card flex flex-col items-center gap-4 p-8 text-center md:p-12">
              <p className="kicker">nothing. not one</p>
              <p className="max-w-md text-base leading-relaxed text-foreground/85 read-prose">
                nobody has signed anything, so there is nothing here to moderate.
                a beautifully clean queue. thrilling. :c
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {pending.length > 0 && (
                <section
                  aria-labelledby="pending-heading"
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 id="pending-heading" className="kicker">
                      waiting on you
                    </h2>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                      {pending.length}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-4">
                    {pending.map((entry) => (
                      <EntryRow key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </section>
              )}

              <section
                aria-labelledby="published-heading"
                className="flex flex-col gap-4"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 id="published-heading" className="kicker">
                    already up
                  </h2>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/80">
                    {published.length}
                  </span>
                </div>
                {published.length === 0 ? (
                  <p className="text-sm leading-relaxed text-foreground/85 read-prose">
                    nothing is public yet. the wall is blank. i&apos;m aware.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {published.map((entry) => (
                      <EntryRow key={entry.id} entry={entry} />
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
