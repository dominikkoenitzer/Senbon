import { PostGridSkeleton } from "@/components/blog/LoadingStates";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-16 md:gap-24 lg:gap-32 px-4 md:px-6 py-16 md:py-24 lg:py-32">
      <div className="space-y-6">
        <div className="h-4 w-32 rounded-full bg-white/5 animate-pulse" />
        <div className="h-12 md:h-16 w-2/3 rounded-md bg-white/10 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="space-y-8 md:space-y-12">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-white/10 animate-pulse" />
          <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
        </div>
        <PostGridSkeleton />
      </div>
    </div>
  );
}
