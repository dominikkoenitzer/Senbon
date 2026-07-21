const PostLoading = () => (
  <div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 py-12 md:px-8 md:py-20">
    <div className="flex flex-col gap-6">
      <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
      <div className="h-16 w-full animate-pulse rounded-2xl bg-muted md:h-24" />
      <div className="h-3 w-28 animate-pulse rounded-full bg-muted" />
    </div>
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-4 w-full animate-pulse rounded-full bg-muted" />
      ))}
    </div>
  </div>
);

export default PostLoading;
