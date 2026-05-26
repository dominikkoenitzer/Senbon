export default function Loading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
      <header className="space-y-4">
        <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
        <div className="space-y-3">
          <div className="h-3 w-40 rounded bg-white/5 animate-pulse" />
          <div className="h-12 md:h-14 w-2/3 rounded bg-white/10 animate-pulse" />
        </div>
      </header>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="zen-card px-6 py-5 space-y-3 animate-pulse bg-black/20"
          >
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="h-3 w-full rounded bg-white/5" />
            <div className="h-3 w-3/4 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
