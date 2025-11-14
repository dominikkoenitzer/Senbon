import { Suspense } from "react";
import { getAllPosts } from "@/lib/blog";
import JournalHero from "@/components/blog/JournalHero";
import PostGrid from "@/components/blog/PostGrid";

export const metadata = {
  title: "Journal",
  description: "Journal entries and notes from the Senbon garden.",
};

const JournalPage = async () => {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-6 py-24">
      <JournalHero />

      {posts.length > 0 && (
        <section className="space-y-10">
          <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="font-display text-3xl">All entries</h2>
            </div>
            <p className="text-sm text-zen-mist/50">
              {posts.length} {posts.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <PostGrid posts={posts} />
        </section>
      )}

      {posts.length === 0 && (
        <div className="zen-card px-10 py-20 text-center">
          <p className="text-lg text-zen-mist/60">No journal entries yet.</p>
          <p className="mt-2 text-sm text-zen-mist/50">
            Add markdown files to{" "}
            <code className="rounded bg-white/5 px-2 py-1 text-zen-gold/70">
              content/journal/
            </code>
          </p>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
