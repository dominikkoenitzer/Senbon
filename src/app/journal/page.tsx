import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { formatJournalDate, formatRelativeDate } from "@/lib/utils";

export const metadata = {
  title: "journal",
};

/**
 * A plain list, on purpose.
 *
 * This page used to run search, tag filtering and load-more pagination over a
 * handful of short entries — blog-platform furniture that made a personal
 * journal read like a corporate content hub. If the list ever gets genuinely
 * long, add scrolling before you add search.
 */
const JournalPage = async () => {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-14 px-6 py-12 md:px-8 md:py-20">
      <header className="flex flex-col gap-7">
        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-2 text-xs lowercase tracking-[0.15em] text-foreground/70 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          <span>back</span>
        </Link>

        <h1 className="font-display text-6xl lowercase leading-[0.85] tracking-tight text-foreground md:text-8xl display-balance">
          journal
        </h1>
        <p className="max-w-md text-lg leading-relaxed text-foreground/80 read-prose">
          things i actually thought. no lore, no filler.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-lg text-foreground/70">
          nothing here yet. give me a minute.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/journal/${post.slug}`}
                className="zen-card group flex flex-col gap-2 p-6 md:p-7"
              >
                <time
                  dateTime={post.publishedAt}
                  title={formatJournalDate(post.publishedAt)}
                  className="font-mono text-[11px] lowercase tracking-[0.15em] text-foreground/70"
                >
                  {formatRelativeDate(post.publishedAt).toLowerCase()}
                </time>
                <h2 className="font-display text-2xl lowercase leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary md:text-3xl">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-base leading-relaxed text-foreground/75 read-prose">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JournalPage;
