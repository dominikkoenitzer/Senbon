import { PostContentSkeleton } from "@/components/blog/LoadingStates";

export default function Loading() {
  return (
    <article className="mx-auto flex max-w-7xl flex-col gap-8 md:gap-12 lg:gap-16 px-4 md:px-6 py-8 md:py-16 lg:py-24 relative z-10">
      <div className="space-y-6 pb-8 border-b border-white/5">
        <div className="h-3 w-40 rounded bg-white/5 animate-pulse" />
        <div className="space-y-3">
          <div className="h-10 md:h-14 w-3/4 rounded bg-white/10 animate-pulse" />
          <div className="h-5 w-2/3 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-6 w-20 rounded-full bg-white/5 animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-white/5 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 md:gap-8 lg:gap-12">
        <PostContentSkeleton />
        <div className="hidden lg:block">
          <div className="space-y-3 border-l border-white/5 pl-6">
            <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-40 rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-36 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    </article>
  );
}
