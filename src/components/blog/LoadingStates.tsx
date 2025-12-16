/**
 * Loading state components for blog
 */

/**
 * Skeleton loader for blog cards
 */
export const BlogCardSkeleton = () => (
  <div className="zen-card h-80 animate-pulse bg-black/20 rounded-xl" aria-label="Loading post...">
    <div className="flex flex-col gap-4 md:gap-6 p-5 md:p-8">
      <div className="h-4 bg-white/5 rounded w-1/3" />
      <div className="h-8 bg-white/10 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded" />
        <div className="h-3 bg-white/5 rounded w-5/6" />
      </div>
      <div className="mt-auto flex items-center justify-between pt-6">
        <div className="flex gap-2">
          <div className="h-6 bg-white/5 rounded-full w-16" />
          <div className="h-6 bg-white/5 rounded-full w-16" />
        </div>
        <div className="h-4 bg-white/5 rounded w-12" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton loader for post content
 */
export const PostContentSkeleton = () => {
  const widths = [75, 90, 65, 85, 70, 80, 95, 60];
  
  return (
    <div className="zen-card px-5 py-6 sm:px-6 sm:py-8 md:px-10 md:py-12 lg:px-16 lg:py-16" aria-label="Loading content...">
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-white/5 rounded"
            style={{ width: `${widths[i % widths.length]}%` }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Grid skeleton for multiple blog cards
 */
export const PostGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <BlogCardSkeleton key={i} />
    ))}
  </div>
);

