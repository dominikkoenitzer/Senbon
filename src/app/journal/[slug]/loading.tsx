import { PostContentSkeleton } from "@/components/blog/LoadingStates";

export default function Loading() {
  return (
    <article className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:gap-12 md:px-6 md:py-16 lg:gap-16 lg:py-24">
      <div className="flex flex-col gap-6 border-b border-border pb-8">
        <div className="h-3 w-40 animate-pulse rounded bg-white/5" />
        <div className="flex flex-col gap-3">
          <div className="h-10 w-3/4 animate-pulse rounded bg-white/10 md:h-14" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-white/5" />
        </div>
        <div className="flex gap-3">
          <div className="h-6 w-20 animate-pulse rounded-full bg-white/5" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[1fr_280px] lg:gap-12">
        <PostContentSkeleton />
        <div className="hidden lg:block">
          <div className="flex flex-col gap-3 border-l border-border pl-6">
            <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-40 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-32 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-36 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </div>
    </article>
  );
}
