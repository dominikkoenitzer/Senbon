import { notFound } from "next/navigation";
import Link from "next/link";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import {
  getAllPostSlugs,
  getPostBySlug,
  getAllPosts,
  type JournalPost,
} from "@/lib/blog";
import { formatJournalDate } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
  <header className="space-y-6">
    <Link
      href="/journal"
      className="inline-flex items-center gap-2 text-sm text-zen-mist/70 transition hover:text-zen-gold"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back to journal</span>
    </Link>
    <div className="zen-card relative overflow-hidden px-10 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-zen-tide/40 via-transparent to-zen-moss/20 opacity-50" />
      <div className="relative z-10 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/70">
            {formatJournalDate(post.publishedAt)}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
            {post.title}
          </h1>
        </div>
        <p className="max-w-3xl text-lg leading-relaxed text-zen-mist/85">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-zen-mist/70">
            <span>{Math.ceil(post.readingTime.minutes)} min read</span>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zen-gold/30 bg-zen-gold/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zen-gold/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
);

const PostNavigation = async ({ currentSlug }: { currentSlug: string }) => {
  const posts = await getAllPosts();
  const currentIndex = posts.findIndex((p) => p.slug === currentSlug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  if (!prevPost && !nextPost) return null;

  return (
    <nav className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div className="relative flex gap-6 pt-12">
        {prevPost ? (
          <Link
            href={`/journal/${prevPost.slug}`}
            className="group flex flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-6 transition-all hover:border-zen-gold/40 hover:bg-zen-gold/5 hover:shadow-glow"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zen-gold/30 bg-gradient-to-br from-zen-gold/20 to-zen-gold/5 text-zen-gold transition-all group-hover:border-zen-gold/60 group-hover:from-zen-gold/30 group-hover:to-zen-gold/10 group-hover:scale-110">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/60 mb-1.5">
                Previous Entry
              </p>
              <p className="font-display text-lg leading-tight text-zen-mist transition-colors group-hover:text-zen-gold line-clamp-2">
                {prevPost.title}
              </p>
              <p className="mt-1.5 text-xs text-zen-mist/60">
                {formatJournalDate(prevPost.publishedAt)}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        
        {nextPost ? (
          <Link
            href={`/journal/${nextPost.slug}`}
            className="group flex flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-6 transition-all hover:border-zen-gold/40 hover:bg-zen-gold/5 hover:shadow-glow"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zen-gold/30 bg-gradient-to-br from-zen-gold/20 to-zen-gold/5 text-zen-gold transition-all group-hover:border-zen-gold/60 group-hover:from-zen-gold/30 group-hover:to-zen-gold/10 group-hover:scale-110">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/60 mb-1.5">
                Next Entry
              </p>
              <p className="font-display text-lg leading-tight text-zen-mist transition-colors group-hover:text-zen-gold line-clamp-2">
                {nextPost.title}
              </p>
              <p className="mt-1.5 text-xs text-zen-mist/60">
                {formatJournalDate(nextPost.publishedAt)}
              </p>
            </div>
          </Link>
        ) : null}
      </div>
    </nav>
  );
};

const JournalPostPage = async ({ params }: { params: Promise<Params> }) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-16">
      <PostHeader post={post} />
      
      <div className="zen-card px-8 py-12 md:px-12">
        <MarkdownRenderer content={post.content} />
      </div>

      <PostNavigation currentSlug={slug} />
    </article>
  );
};

export default JournalPostPage;
