import Link from "next/link";
import BlogCard from "@/components/blog/BlogCard";
import { getAllPosts } from "@/lib/blog";
import { formatJournalDate } from "@/lib/utils";

export const metadata = {
  title: "Journal",
  description: "Journal entries and notes from the Senbon garden.",
};

const JournalPage = async () => {
  const posts = await getAllPosts();
  const featured = posts.find((p) => p.featured) || posts[0];
  const otherPosts = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-20">
      {/* Hero Section */}
      <section className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/60">
            Senbon Journal
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
            Thousand-fold garden notes
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zen-mist/80">
            Every post is a git commit. A collection of thoughts, experiments,
            and notes built with Next.js, Tailwind, and Framer Motion.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featured && (
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/60">
            Featured
          </p>
          <Link
            href={`/journal/${featured.slug}`}
            className="zen-card group block overflow-hidden transition-all hover:border-zen-gold/40"
          >
            <div className="grid gap-0 md:grid-cols-[1.5fr,1fr]">
              <div className="relative h-64 overflow-hidden md:h-auto">
                <div
                  className="absolute inset-0 bg-[length:200%_200%] opacity-60 blur-2xl transition duration-1000 group-hover:scale-110 group-hover:opacity-80"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgba(247,216,160,0.3), rgba(142,185,214,0.25), rgba(226,179,192,0.3))",
                  }}
                />
                <div className="relative z-10 flex h-full items-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/80">
                      {formatJournalDate(featured.publishedAt)}
                    </p>
                    <h2 className="mt-2 font-display text-3xl leading-tight md:text-4xl text-zen-mist">
                      {featured.title}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between p-8">
                <div className="space-y-4">
                  <p className="text-base leading-relaxed text-zen-mist/85">
                    {featured.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {featured.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-zen-gold/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zen-gold/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-zen-gold/80">
                  <span>{Math.ceil(featured.readingTime.minutes)} min read</span>
                  <span className="opacity-50">→</span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* All Posts Grid */}
      {otherPosts.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/60">
                All Entries
              </p>
              <h2 className="mt-2 font-display text-3xl">Archive</h2>
            </div>
            <p className="text-sm text-zen-mist/60">
              {posts.length} {posts.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {otherPosts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="zen-card px-10 py-16 text-center">
          <p className="text-lg text-zen-mist/70">
            No journal entries yet. Start writing by adding markdown files to{" "}
            <code className="rounded bg-white/5 px-2 py-1 text-zen-gold/80">
              content/journal/
            </code>
          </p>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
