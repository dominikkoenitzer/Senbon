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
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12 md:gap-24 md:px-10 md:py-20 lg:py-24">
      <JournalHero count={posts.length} />

      {posts.length > 0 ? (
        <section className="flex flex-col gap-8 md:gap-12">
          <PostGrid posts={posts} />
        </section>
      ) : (
        <div className="zen-card flex flex-col items-center gap-3 px-8 py-16 text-center md:px-12 md:py-24">
          <p className="kicker">Empty plot</p>
          <p className="text-lg text-foreground/70">No entries yet.</p>
          <p className="max-w-sm text-sm text-foreground/50">
            Add markdown files to{" "}
            <code className="rounded bg-foreground/5 px-2 py-1 font-mono text-xs text-primary/80">
              content/journal/
            </code>{" "}
            and the garden will fill itself.
          </p>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
