const JournalLoading = () => (
  <div className="mx-auto flex max-w-2xl flex-col gap-14 px-6 py-12 md:px-8 md:py-20">
    <div className="flex flex-col gap-7">
      <div className="h-3 w-16 animate-pulse rounded-full bg-muted" />
      <div className="h-20 w-64 animate-pulse rounded-2xl bg-muted md:h-28" />
    </div>
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="zen-card h-32 animate-pulse" />
      ))}
    </div>
  </div>
);

export default JournalLoading;
