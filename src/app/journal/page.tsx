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
    <div className="mx-auto flex max-w-6xl flex-col gap-20 px-6 py-24">
      {/* Hero Section */}
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/60">
          Journal
        </p>
        <h1 className="font-display text-5xl leading-tight md:text-6xl lg:text-7xl">
          Thousand-fold garden notes
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zen-mist/75">
          A collection of thoughts, experiments, and notes. Every post is a git commit.
        </p>
      </section>

      {/* Featured Post */}
      {featured && (
        <section className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/50">
            Featured
          </p>
          <Link
            href={`/journal/${featured.slug}`}
            className="group block"
          >
            <div className="zen-card overflow-hidden transition-all hover:border-zen-gold/30">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:h-auto">
                  <div
                    className="absolute inset-0 bg-[length:200%_200%] opacity-50 blur-3xl transition duration-1000 group-hover:scale-110 group-hover:opacity-70"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, rgba(247,216,160,0.4), rgba(142,185,214,0.3), rgba(226,179,192,0.4))",
                    }}
                  />
                  <div className="relative z-10 flex h-full items-end bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/70">
                        {formatJournalDate(featured.publishedAt)}
                      </p>
                      <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl text-zen-mist">
                        {featured.title}
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between p-8 md:p-10">
                  <div className="space-y-6">
                    <p className="text-base leading-relaxed text-zen-mist/80">
                      {featured.excerpt}
                    </p>
                    {featured.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {featured.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-zen-gold/25 bg-zen-gold/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zen-gold/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-sm text-zen-gold/70">
                    <span>{Math.ceil(featured.readingTime.minutes)} min read</span>
                    <span className="opacity-40">·</span>
                    <span className="opacity-60 group-hover:opacity-100 transition">Read more →</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* All Posts Grid */}
      {otherPosts.length > 0 && (
        <section className="space-y-10">
          <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/50">
                Archive
              </p>
              <h2 className="mt-2 font-display text-3xl">All entries</h2>
            </div>
            <p className="text-sm text-zen-mist/50">
              {posts.length} {posts.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherPosts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="zen-card px-10 py-20 text-center">
          <p className="text-lg text-zen-mist/60">
            No journal entries yet.
          </p>
          <p className="mt-2 text-sm text-zen-mist/50">
            Add markdown files to <code className="rounded bg-white/5 px-2 py-1 text-zen-gold/70">content/journal/</code>
          </p>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
