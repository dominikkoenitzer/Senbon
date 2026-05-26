export default function Loading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-4">
        <div className="h-3 w-32 animate-pulse rounded bg-white/5" />
        <div className="flex flex-col gap-3">
          <div className="h-3 w-40 animate-pulse rounded bg-white/5" />
          <div className="h-12 w-2/3 animate-pulse rounded bg-white/10 md:h-14" />
        </div>
      </header>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="zen-card flex animate-pulse flex-col gap-3 bg-black/20 px-6 py-5"
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
