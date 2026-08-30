const GuestbookLoading = () => (
  <div className="mx-auto flex max-w-2xl flex-col gap-12 px-6 py-12 md:px-8 md:py-20">
    <div className="flex flex-col gap-7">
      <div className="h-3 w-16 animate-pulse rounded-full bg-muted" />
      <div className="h-16 w-56 animate-pulse rounded-2xl bg-muted md:h-24" />
    </div>
    <div className="card h-64 animate-pulse" />
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card h-24 animate-pulse" />
      ))}
    </div>
  </div>
);

export default GuestbookLoading;
