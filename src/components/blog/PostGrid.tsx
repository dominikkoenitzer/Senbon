import { Suspense } from "react";
import BlogCard from "./BlogCard";
import type { JournalPost } from "@/lib/blog";

type Props = {
  posts: JournalPost[];
};

const PostGridSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="zen-card h-64 animate-pulse bg-black/20"
      />
    ))}
  </div>
);

const PostGrid = ({ posts }: Props) => {
  if (posts.length === 0) {
    return (
      <div className="zen-card px-10 py-20 text-center">
        <p className="text-lg text-zen-mist/60">No entries found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <BlogCard key={post.slug} post={post} index={index} />
      ))}
    </div>
  );
};

export const PostGridWithSuspense = ({ posts }: Props) => (
  <Suspense fallback={<PostGridSkeleton />}>
    <PostGrid posts={posts} />
  </Suspense>
);

export default PostGrid;

