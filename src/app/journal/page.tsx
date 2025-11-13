import BlogCard from "@/components/blog/BlogCard";
import { getAllPosts } from "@/lib/blog";
import { formatJournalDate } from "@/lib/utils";

export const metadata = {
  title: "Journal",
  description:
    "Journal entries and notes from the Senbon garden.",
};

const JournalPage = async () => {
  const posts = await getAllPosts();
  const latest = posts[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
      <section className="zen-card relative overflow-hidden px-8 py-12">
        <div className="absolute inset-0 bg-zen-mist opacity-10" />
        <div className="relative z-10 grid gap-8 md:grid-cols-[2fr,1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/70">
              Senbon Journal
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Thousand-fold garden notes
            </h1>
            <p className="mt-4 text-lg text-zen-mist/80">
              Every post is a git commit. A collection of thoughts, experiments,
              and notes built with Next.js, Tailwind, and Framer Motion.
            </p>
            {latest ? (
              <p className="mt-6 text-sm uppercase tracking-[0.35em] text-zen-gold/60">
                Latest • {formatJournalDate(latest.publishedAt)}
              </p>
            ) : null}
          </div>
          <div className="rounded-3xl border border-zen-gold/20 bg-black/40 p-6 text-sm text-zen-mist/85">
            <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/70">
              Field reminders
            </p>
            <ul className="mt-4 space-y-3">
              <li>• Blog posts live under content/journal/*.md</li>
              <li>• Use frontmatter for title, excerpt, tags, hero, featured</li>
              <li>• Markdown supports GFM, code fences, and callouts</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="grid gap-8 md:grid-cols-2">
        {posts.map((post, index) => (
          <BlogCard key={post.slug} post={post} index={index} />
        ))}
      </section>
    </div>
  );
};

export default JournalPage;

