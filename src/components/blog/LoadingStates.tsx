/**
 * Loading state components for blog
 */

export const BlogCardSkeleton = () => (
  <div
    className="zen-card h-80 animate-pulse rounded-xl bg-black/20"
    aria-label="Loading post…"
  >
    <div className="flex flex-col gap-4 p-5 md:gap-6 md:p-8">
      <div className="h-4 w-1/3 rounded bg-white/5" />
      <div className="h-8 w-3/4 rounded bg-white/10" />
      <div className="flex flex-col gap-2">
        <div className="h-3 rounded bg-white/5" />
        <div className="h-3 w-5/6 rounded bg-white/5" />
      </div>
      <div className="mt-auto flex items-center justify-between pt-6">
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-white/5" />
          <div className="h-6 w-16 rounded-full bg-white/5" />
        </div>
        <div className="h-4 w-12 rounded bg-white/5" />
      </div>
    </div>
  </div>
);

export const PostContentSkeleton = () => {
  const widths = [75, 90, 65, 85, 70, 80, 95, 60];
  return (
    <div
      className="zen-card px-5 py-6 sm:px-6 sm:py-8 md:px-10 md:py-12 lg:px-16 lg:py-16"
      aria-label="Loading content…"
    >
      <div className="flex animate-pulse flex-col gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded bg-white/5"
            style={{ width: `${widths[i % widths.length]}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export const PostGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 md:gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <BlogCardSkeleton key={i} />
    ))}
  </div>
);
