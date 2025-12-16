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
    <div className="mx-auto flex max-w-7xl flex-col gap-16 md:gap-24 lg:gap-32 px-4 md:px-6 py-16 md:py-24 lg:py-32">
      <JournalHero />

      {posts.length > 0 && (
        <section className="space-y-8 md:space-y-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-zen-mist mb-2">
                All entries
              </h2>
              <p className="text-xs md:text-sm text-zen-mist/50 font-light">
                {posts.length} {posts.length === 1 ? "entry" : "entries"} in the garden
              </p>
            </div>
          </div>
          <PostGrid posts={posts} />
        </section>
      )}

      {posts.length === 0 && (
        <div className="zen-card px-6 md:px-10 py-12 md:py-20 text-center">
          <p className="text-base md:text-lg text-zen-mist/60">No journal entries yet.</p>
          <p className="mt-2 text-xs md:text-sm text-zen-mist/50">
            Add markdown files to{" "}
            <code className="rounded bg-white/5 px-2 py-1 text-zen-gold/70 text-xs">
              content/journal/
            </code>
          </p>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
