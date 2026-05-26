import { PostGridSkeleton } from "@/components/blog/LoadingStates";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-16 md:gap-24 md:px-6 md:py-24 lg:gap-32 lg:py-32">
      <div className="flex flex-col gap-6">
        <div className="h-4 w-32 animate-pulse rounded-full bg-white/5" />
        <div className="h-12 w-2/3 animate-pulse rounded-md bg-white/10 md:h-16" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
      </div>
      <div className="flex flex-col gap-8 md:gap-12">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-32 animate-pulse rounded bg-white/5" />
        </div>
        <PostGridSkeleton />
      </div>
    </div>
  );
}
