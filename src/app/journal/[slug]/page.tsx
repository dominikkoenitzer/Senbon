import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import { formatJournalDate, formatRelativeDate } from "@/lib/utils";

type Params = {
  slug: string;
};

export const dynamicParams = true;

export const generateStaticParams = async () => {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "not found" };

  // Deliberately no OpenGraph block. The site is deindexed on purpose, and the
  // old one here contradicted that (see the privacy posture in CLAUDE.md).
  return { title: post.title, description: post.excerpt };
};

/**
 * One column, one entry.
 *
 * This page used to wrap a short post in a table of contents rendered twice
 * (mobile and desktop), prev/next navigation, a reading-time estimate and a
 * hero image slot. Entries here are a few hundred words — none of that earned
 * its place.
 */
const JournalPostPage = async ({ params }: { params: Promise<Params> }) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <article className="relative z-10 mx-auto flex max-w-2xl flex-col gap-10 px-6 py-12 md:px-8 md:py-20">
      <header className="flex flex-col gap-6">
        <Link
          href="/journal"
          className="group inline-flex w-fit items-center gap-2 text-xs lowercase tracking-[0.15em] text-foreground/70 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          <span>journal</span>
        </Link>

        <h1 className="font-display text-4xl lowercase leading-[0.95] tracking-tight text-foreground md:text-6xl display-balance">
          {post.title}
        </h1>

        <time
          dateTime={post.publishedAt}
          title={formatJournalDate(post.publishedAt)}
          className="font-mono text-[11px] lowercase tracking-[0.15em] text-foreground/70"
        >
          {formatRelativeDate(post.publishedAt).toLowerCase()}
        </time>
      </header>

      <MarkdownRenderer content={post.content} />
    </article>
  );
};

export default JournalPostPage;
