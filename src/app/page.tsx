import { ViewTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";

/**
 * Server component on purpose.
 *
 * This page used to be a client component pulling in framer-motion to fade two
 * cards in. CSS does that, and the page now ships no JavaScript of its own.
 */
const links = [
  {
    href: "/journal",
    title: "journal",
    blurb: "things i thought at 2am, in the order i thought them.",
  },
  {
    href: "/guestbook",
    title: "guestbook",
    blurb: "four words is plenty. i will notice if you don't.",
  },
];

const Home = () => (
  <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-14 px-6 py-20 md:px-8">
    <header className="flex flex-col gap-6 fade-up">
      <h1 className="font-display text-7xl lowercase leading-[0.82] tracking-tight text-foreground md:text-9xl display-balance">
        senbon
      </h1>
      <p className="max-w-md text-lg leading-relaxed text-foreground/85 read-prose md:text-xl">
        dominik. two rooms: a journal, and a guestbook i refresh more than
        i&apos;ll admit. take the second door.
      </p>
    </header>

    <nav className="flex flex-col gap-3" aria-label="Sections">
      {links.map((link, i) => (
        <Link
          key={link.href}
          href={link.href}
          className="zen-card group flex items-center justify-between gap-6 p-6 fade-up md:p-7"
          style={{ animationDelay: `${40 + i * 40}ms` }}
        >
          <span className="flex flex-col gap-1.5">
            {/*
              These read "journal" and "guestbook" — the exact words those two
              pages lead with. Naming them pairs each card label with the
              heading it becomes, so choosing a room lifts its name out of the
              list and grows it into the title rather than swapping documents.
            */}
            <ViewTransition name={`section-${link.title}`}>
              <span className="font-display text-2xl lowercase tracking-tight text-foreground transition-colors group-hover:text-primary md:text-3xl">
                {link.title}
              </span>
            </ViewTransition>
            <span className="text-base leading-relaxed text-foreground/75 read-prose">
              {link.blurb}
            </span>
          </span>
          <ArrowUpRight
            className="size-5 shrink-0 text-foreground/70 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
            aria-hidden="true"
          />
        </Link>
      ))}
    </nav>

    <footer
      className="flex flex-col gap-3 fade-up"
      style={{ animationDelay: "120ms" }}
    >
      <p className="max-w-md text-sm leading-relaxed text-foreground/75 read-prose">
        that&apos;s the whole site. no about page. you know enough.
      </p>
      <a
        href="https://github.com/dominikkoenitzer"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 text-sm lowercase text-foreground/70 transition-colors hover:text-primary"
      >
        <Github className="size-4" aria-hidden="true" />
        <span>github</span>
        <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </footer>
  </div>
);

export default Home;
