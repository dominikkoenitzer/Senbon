/**
 * Mirrors the real page's container and header geometry (max-w-4xl, the
 * kicker / headline / intro stack, the rule) so the swap to content does not
 * jump the column width or the vertical rhythm.
 */
const GuestbookLoading = () => (
  <div className="mx-auto flex max-w-4xl flex-col gap-16 px-6 py-12 md:gap-20 md:px-10 md:py-20 lg:py-24">
    <div className="flex flex-col gap-10">
      <div className="h-3 w-12 animate-pulse rounded-full bg-muted" />
      <div className="flex flex-col gap-6">
        <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-14 w-72 animate-pulse rounded-2xl bg-muted sm:h-16 md:h-20" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-muted" />
      </div>
      <div className="rule" />
    </div>
    <div className="card h-72 animate-pulse" />
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card h-28 animate-pulse" />
      ))}
    </div>
  </div>
);

export default GuestbookLoading;
