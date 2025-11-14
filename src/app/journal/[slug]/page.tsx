import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import PostHeader from "@/components/blog/PostHeader";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";

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

const PostContent = async ({ slug }: { slug: string }) => {
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <div className="zen-card px-8 py-12 md:px-16 lg:px-20">
      <MarkdownRenderer content={post.content} />
    </div>
  );
};

const PostContentSkeleton = () => (
  <div className="zen-card px-8 py-12 md:px-16 lg:px-20">
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-white/5 rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  </div>
);

const JournalPostPage = async ({ params }: { params: Promise<Params> }) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-20 px-6 py-24 md:py-32">
      <PostHeader post={post} />

      <Suspense fallback={<PostContentSkeleton />}>
        <PostContent slug={slug} />
      </Suspense>
    </article>
  );
};

export default JournalPostPage;
