import { notFound } from "next/navigation";
import Link from "next/link";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import {
  getAllPostSlugs,
  getPostBySlug,
  type JournalPost,
} from "@/lib/blog";
import { formatJournalDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

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
  };
};

const PostHeader = ({ post }: { post: JournalPost }) => (
  <header className="space-y-8">
    <Link
      href="/journal"
      className="inline-flex items-center gap-2 text-sm text-zen-mist/60 transition-colors hover:text-zen-gold"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back to journal</span>
    </Link>
    
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/60">
          {formatJournalDate(post.publishedAt)}
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
          {post.title}
        </h1>
      </div>
      
      {post.excerpt && (
        <p className="max-w-3xl text-lg leading-relaxed text-zen-mist/80">
          {post.excerpt}
        </p>
      )}
      
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <div className="flex items-center gap-2 text-sm text-zen-mist/60">
          <span>{Math.ceil(post.readingTime.minutes)} min read</span>
        </div>
        {post.tags.length > 0 && (
          <>
            <span className="text-zen-mist/30">·</span>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zen-gold/25 bg-zen-gold/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zen-gold/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  </header>
);

const JournalPostPage = async ({ params }: { params: Promise<Params> }) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-16 px-6 py-20">
      <PostHeader post={post} />
      
      <div className="prose prose-invert prose-lg max-w-none">
        <div className="zen-card px-8 py-12 md:px-12">
          <MarkdownRenderer content={post.content} />
        </div>
      </div>
    </article>
  );
};

export default JournalPostPage;
