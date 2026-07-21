import Link from "next/link";

export const metadata = {
  title: "page not found",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-6">
      <div className="zen-card w-full max-w-xl bg-muted px-8 py-12 text-center md:px-12 md:py-16">
        <p className="kicker mb-6">404 — nothing here</p>
        <h1 className="font-display mb-5 text-3xl lowercase text-foreground display-balance md:text-5xl">
          this page does not exist. i checked.
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-foreground/85 read-prose md:text-base">
          either you typed it wrong or i deleted it and forgot, and i&apos;m not
          telling you which. nothing lives at this url. one of us is embarrassed
          and it isn&apos;t going to be me.
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground/75 read-prose">
          pick a door. all three of them work.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-xs lowercase text-primary transition-colors hover:border-primary/60 hover:bg-primary/10"
          >
            home
          </Link>
          <Link
            href="/journal"
            className="rounded-full border border-border px-5 py-2 text-xs lowercase text-foreground/80 transition-colors hover:border-primary/30 hover:text-primary"
          >
            journal
          </Link>
          <Link
            href="/guestbook"
            className="rounded-full border border-border px-5 py-2 text-xs lowercase text-foreground/80 transition-colors hover:border-primary/30 hover:text-primary"
          >
            guestbook (please)
          </Link>
        </div>
      </div>
    </div>
  );
}
