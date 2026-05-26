import { notFound } from "next/navigation";
import {
  getAdjacentPosts,
  getAllPostSlugs,
  getPostBySlug,
} from "@/lib/blog";
import { extractHeadings } from "@/lib/toc";
import PostHeader from "@/components/blog/PostHeader";
import PostHero from "@/components/blog/PostHero";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import PostNavigation from "@/components/blog/PostNavigation";
import TableOfContents from "@/components/blog/TableOfContents";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
  if (!post) return { title: "Post not found" };

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

const JournalPostPage = async ({ params }: { params: Promise<Params> }) => {
  const { slug } = await params;
  const [post, adjacent] = await Promise.all([
    getPostBySlug(slug),
    getAdjacentPosts(slug),
  ]);
  if (!post) return notFound();

  const headings = extractHeadings(post.content);

  return (
    <ErrorBoundary>
      <article className="relative z-10 mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 md:px-10 md:py-20 lg:py-24">
        <PostHeader post={post} />

        {post.hero && (
          <PostHero src={post.hero} alt={post.title} priority />
        )}

        {headings.length > 0 && (
          <div className="lg:hidden">
            <TableOfContents items={headings} mobile />
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_220px] lg:gap-16">
          <div className="min-w-0">
            <MarkdownRenderer content={post.content} />
          </div>
          {headings.length > 0 && (
            <aside className="hidden lg:block">
              <TableOfContents items={headings} />
            </aside>
          )}
        </div>

        <PostNavigation newer={adjacent.newer} older={adjacent.older} />
      </article>
    </ErrorBoundary>
  );
};

export default JournalPostPage;
