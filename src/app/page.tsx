import Link from "next/link";
import LogoGlyph from "@/components/home/LogoGlyph";

const Home = () => {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl flex-col items-center justify-center gap-12 px-6 py-24">
      <div className="flex flex-col items-center gap-8 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/60">
          senbon (千本) — "a thousand"
        </p>
        
        <h1 className="font-display text-6xl leading-tight md:text-7xl lg:text-8xl">
          A zen garden journal
        </h1>
        
        <p className="max-w-2xl text-lg leading-relaxed text-zen-mist/75">
          Built with Next.js 16, Tailwind, shadcn/ui, and Neon PostgreSQL.
          A clean, minimal space for thoughts, notes, and guest messages.
        </p>

        <LogoGlyph />

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/journal"
            className="zen-card group inline-flex items-center gap-3 px-8 py-4 transition-all hover:border-zen-gold/40 hover:bg-zen-gold/5"
          >
            <span className="font-display text-xl text-zen-mist group-hover:text-zen-gold transition-colors">
              Journal
            </span>
            <span className="text-zen-gold/60 group-hover:text-zen-gold transition-colors">
              →
            </span>
          </Link>
          
          <Link
            href="/guestbook"
            className="zen-card group inline-flex items-center gap-3 px-8 py-4 transition-all hover:border-zen-gold/40 hover:bg-zen-gold/5"
          >
            <span className="font-display text-xl text-zen-mist group-hover:text-zen-gold transition-colors">
              Guestbook
            </span>
            <span className="text-zen-gold/60 group-hover:text-zen-gold transition-colors">
              →
            </span>
          </Link>
        </div>
      </div>

      <div className="zen-card mt-12 w-full max-w-2xl px-8 py-8">
        <div className="space-y-4 text-sm text-zen-mist/70">
          <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/60">
            Blueprint
          </p>
          <p>
            • Journal entries live in <code className="rounded bg-white/5 px-1.5 py-0.5 text-zen-gold/80">content/journal/*.md</code>. Commit
            to git → blog updates automatically.
          </p>
          <p>
            • Guestbook uses Neon serverless PostgreSQL via{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-zen-gold/80">lib/db.ts</code>, hitting <code className="rounded bg-white/5 px-1.5 py-0.5 text-zen-gold/80">/api/guestbook</code>.
          </p>
          <p>
            • Admin panel uses a token stored in <code className="rounded bg-white/5 px-1.5 py-0.5 text-zen-gold/80">.env</code> + Vercel project
            secrets. No OAuth required.
          </p>
          <div className="pt-4 border-t border-white/10 mt-4">
            <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/60 mb-3">
              Deploy notes
            </p>
            <ol className="space-y-2 list-decimal list-inside text-xs">
              <li>
                Duplicate <code className="rounded bg-white/5 px-1.5 py-0.5 text-zen-gold/80">.env.example</code> → <code className="rounded bg-white/5 px-1.5 py-0.5 text-zen-gold/80">.env.local</code> with{" "}
                <code className="rounded bg-white/5 px-1.5 py-0.5 text-zen-gold/80">DATABASE_URL</code>, <code className="rounded bg-white/5 px-1.5 py-0.5 text-zen-gold/80">ADMIN_TOKEN</code>, and{" "}
                <code className="rounded bg-white/5 px-1.5 py-0.5 text-zen-gold/80">NEXT_PUBLIC_SITE_URL</code>.
              </li>
              <li>Create a Neon project + table (schema provided below).</li>
              <li>
                Add the same env vars inside Vercel project settings before
                deploying.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
