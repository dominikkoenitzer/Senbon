const AdminLoading = () => (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-10 sm:px-6 md:gap-12 md:px-10 md:py-20">
    <div className="flex flex-col gap-8">
      <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
      <div className="h-12 w-64 animate-pulse rounded-2xl bg-muted md:h-16" />
      <div className="grid grid-cols-2 gap-3">
        <div className="card h-24 animate-pulse" />
        <div className="card h-24 animate-pulse" />
      </div>
    </div>
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card h-28 animate-pulse" />
      ))}
    </div>
  </div>
);

export default AdminLoading;
