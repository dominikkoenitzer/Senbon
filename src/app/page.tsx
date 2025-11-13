import Link from "next/link";
import LogoGlyph from "@/components/home/LogoGlyph";
import { getAllPosts } from "@/lib/blog";
import BlogCard from "@/components/blog/BlogCard";
import { fetchGuestbookEntries } from "@/lib/db";
import GuestbookEntryCard from "@/components/guestbook/GuestbookEntry";

const Home = async () => {
  const allPosts = await getAllPosts();
  const guestbookPreview = await fetchGuestbookEntries({
    includePending: false,
    limit: 3,
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 py-16">
      <section className="grid gap-10 md:grid-cols-[3fr,2fr] md:items-center">
        <div className="space-y-8">
          <p className="text-xs uppercase tracking-[0.45em] text-zen-gold/70">
            senbon (千本) — “a thousand”
          </p>
          <h1 className="font-display text-5xl leading-tight text-zen-mist">
            A zen garden journal
          </h1>
          <p className="text-lg text-zen-mist/80">
            Built with Next.js 16, Tailwind, shadcn/ui, and Neon PostgreSQL.
            A clean, minimal space for thoughts, notes, and guest messages.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 rounded-full border border-zen-gold/40 px-6 py-3 text-zen-gold transition hover:bg-zen-gold/10"
            >
              Read the Journal ↗
            </Link>
            <Link
              href="/guestbook"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-zen-mist/80 hover:border-zen-gold/30"
            >
              Sign the Guestbook
            </Link>
          </div>
          <LogoGlyph />
        </div>
        <div className="zen-card relative overflow-hidden px-8 py-10">
          <div className="absolute inset-0 bg-gradient-to-br from-zen-moss/20 to-transparent" />
          <div className="relative z-10 space-y-4 text-sm text-zen-mist/80">
            <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/70">
              Blueprint
            </p>
            <p>
              • Journal entries live in <code>content/journal/*.md</code>. Commit
              to git → blog updates automatically.
            </p>
            <p>
              • Guestbook uses Neon serverless PostgreSQL via{" "}
              <code>lib/db.ts</code>, hitting <code>/api/guestbook</code>.
            </p>
            <p>
              • Admin panel uses a token stored in `.env` + Vercel project
              secrets. No OAuth required.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/60">
              Journal
            </p>
            <h2 className="font-display text-3xl">All entries</h2>
          </div>
          <Link
            href="/journal"
            className="text-sm uppercase tracking-[0.3em] text-zen-mist/70"
          >
            View journal
          </Link>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allPosts.map((post, index) => (
            <BlogCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/60">
                Guestbook
              </p>
              <h2 className="font-display text-3xl">Recent messages</h2>
            </div>
            <Link
              href="/guestbook"
              className="text-sm text-zen-mist/70 underline-offset-4 hover:text-zen-gold"
            >
              Leave a message
            </Link>
          </div>
          <div className="space-y-4">
            {guestbookPreview.map((entry, idx) => (
              <GuestbookEntryCard
                key={entry.id}
                entry={entry}
                highlight={idx === 0}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/70">
            Deploy notes
          </p>
          <ul className="space-y-4 text-sm text-zen-mist/85">
            <li>
              1. Duplicate `.env.example` → `.env.local` with `DATABASE_URL`,
              `ADMIN_TOKEN`, and `NEXT_PUBLIC_SITE_URL`.
            </li>
            <li>2. Create a Neon project + table (schema provided below).</li>
            <li>
              3. Add the same env vars inside Vercel project settings before
              deploying.
            </li>
            <li>
              4. Approve guestbook entries at `/admin`.
            </li>
          </ul>
        </div>
      </section>

    </div>
  );
};

export default Home;
