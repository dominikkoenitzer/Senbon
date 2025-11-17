import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { extractHeadings } from "@/lib/toc";
import PostHeader from "@/components/blog/PostHeader";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import TableOfContents from "@/components/blog/TableOfContents";
import MysticalBackground from "@/components/blog/MysticalBackground";

type Params = {
  slug: string;
};

export const dynamicParams = true;

export const generateStaticParams = async () => {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
};

export const generateMetadata = async ({ params }: { params: Promise<Params> }) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      tags: post.tags,
    },
  };
};

const PostContent = async ({ slug, headings }: { slug: string; headings: ReturnType<typeof extractHeadings> }) => {
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 md:gap-12 lg:gap-16">
      <div className="zen-card px-4 py-8 md:px-8 md:py-12 lg:px-16 lg:py-16 xl:px-20 relative backdrop-blur-sm bg-black/20 border-white/5 -mx-4 md:mx-0">
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-zen-gold/5 via-transparent to-transparent rounded-lg opacity-50 pointer-events-none" />
        <MarkdownRenderer content={post.content} />
      </div>
      {headings.length > 0 && (
        <div className="hidden lg:block">
          <TableOfContents items={headings} />
        </div>
      )}
    </div>
  );
};

const PostContentSkeleton = () => {
  const widths = [75, 90, 65, 85, 70, 80, 95, 60];
  return (
    <div className="zen-card px-8 py-12 md:px-16 lg:px-20">
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-white/5 rounded"
            style={{ width: `${widths[i % widths.length]}%` }}
          />
        ))}
      </div>
    </div>
  );
};

const JournalPostPage = async ({ params }: { params: Promise<Params> }) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  const headings = extractHeadings(post.content);

  return (
    <>
      <MysticalBackground />
      <article className="mx-auto flex max-w-7xl flex-col gap-12 md:gap-20 px-4 md:px-6 py-12 md:py-24 lg:py-32 relative z-10">
        <PostHeader post={post} />

        {/* Mobile Table of Contents */}
        {headings.length > 0 && (
          <div className="lg:hidden -mx-4 md:mx-0">
            <TableOfContents items={headings} mobile />
          </div>
        )}

        <Suspense fallback={<PostContentSkeleton />}>
          <PostContent slug={slug} headings={headings} />
        </Suspense>
      </article>
    </>
  );
};

export default JournalPostPage;
