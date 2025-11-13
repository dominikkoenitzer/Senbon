import { notFound } from "next/navigation";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import {
  getAllPostSlugs,
  getPostBySlug,
  type JournalPost,
} from "@/lib/blog";
import { formatJournalDate } from "@/lib/utils";

type Params = {
  slug: string;
};

export const dynamicParams = false;

export const generateStaticParams = async () => {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
};

export const generateMetadata = async ({ params }: { params: Params }) => {
  const post = await getPostBySlug(params.slug);
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
  <header className="zen-card relative overflow-hidden px-10 py-12">
    <div className="absolute inset-0 bg-gradient-to-r from-zen-tide/60 to-transparent opacity-60" />
    <div className="relative z-10">
      <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/60">
        {formatJournalDate(post.publishedAt)}
      </p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">{post.title}</h1>
      <p className="mt-4 max-w-3xl text-lg text-zen-mist/80">{post.excerpt}</p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm text-zen-mist/70">
        <span>{Math.ceil(post.readingTime.minutes)} min read</span>
        <span>•</span>
        <span>tags: {post.tags.join(", ")}</span>
      </div>
    </div>
  </header>
);

const JournalPostPage = async ({ params }: { params: Params }) => {
  const post = await getPostBySlug(params.slug);
  if (!post) return notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16">
      <PostHeader post={post} />
      <section className="zen-card px-10 py-10">
        <MarkdownRenderer content={post.content} />
      </section>
    </div>
  );
};

export default JournalPostPage;

