import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import AdminLogin from "@/components/guestbook/AdminLogin";
import { removeEntry, signOut } from "@/app/guestbook/admin/actions";
import {
  fetchAllEntries,
  isAdminConfigured,
  isSignedIn,
} from "@/lib/guestbook-admin";
import { formatJournalDate, formatRelativeDate } from "@/lib/utils";
import type { GuestbookEntry } from "@/types/guestbook";

export const metadata = {
  title: "Guestbook moderation",
};

export const dynamic = "force-dynamic";

const AdminPage = async () => {
  const configured = isAdminConfigured();
  const signedIn = configured && (await isSignedIn());

  let entries: GuestbookEntry[] = [];
  let loadError = false;

  if (signedIn) {
    try {
      entries = await fetchAllEntries();
    } catch (error) {
      console.error("[guestbook-admin] list failed:", error);
      loadError = true;
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-12 md:px-10 md:py-20">
      <header className="flex flex-col gap-8">
        <Link
          href="/guestbook"
          className="group inline-flex w-fit items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to the guestbook</span>
        </Link>

        {signedIn && (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <p className="kicker">Moderation · 管理</p>
              <h1 className="font-display text-4xl tracking-tight text-foreground md:text-5xl display-balance">
                Tend the wall
              </h1>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:border-primary/40 hover:text-primary"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </header>

      {!configured ? (
        <div className="zen-card flex flex-col items-center gap-3 p-10 text-center">
          <p className="kicker">Unconfigured</p>
          <p className="max-w-md text-base leading-relaxed text-foreground/70 read-prose">
            Moderation needs `GUESTBOOK_ADMIN_PASSWORD` and
            `GUESTBOOK_ADMIN_TOKEN` set on the server.
          </p>
        </div>
      ) : !signedIn ? (
        <AdminLogin />
      ) : loadError ? (
        <div className="zen-card flex flex-col items-center gap-3 p-10 text-center">
          <p className="kicker">Unreachable</p>
          <p className="max-w-md text-base leading-relaxed text-foreground/70 read-prose">
            Could not reach the guestbook API. It may be restarting — try again
            in a moment.
          </p>
        </div>
      ) : entries.length === 0 ? (
        <div className="zen-card flex flex-col items-center gap-3 p-10 text-center">
          <p className="kicker">Empty</p>
          <p className="max-w-md text-base leading-relaxed text-foreground/70 read-prose">
            Nothing has been signed yet. Nothing to tend.
          </p>
        </div>
      ) : (
        <section className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between gap-4">
            <p className="kicker">Signatures</p>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/70">
              {entries.length}
            </span>
          </div>

          <ul className="flex flex-col gap-4">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="zen-card flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between md:gap-6"
              >
                <div className="flex min-w-0 flex-col gap-3">
                  <p className="text-base leading-relaxed text-foreground/85 read-prose">
                    {entry.message}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-lg tracking-tight text-foreground">
                      {entry.name}
                    </span>
                    <time
                      dateTime={entry.signedAt}
                      title={formatJournalDate(entry.signedAt)}
                      className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70"
                    >
                      {formatRelativeDate(entry.signedAt)}
                    </time>
                  </div>
                </div>

                <form action={removeEntry} className="shrink-0">
                  <input type="hidden" name="id" value={entry.id} />
                  <button
                    type="submit"
                    aria-label={`Delete the signature from ${entry.name}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default AdminPage;
