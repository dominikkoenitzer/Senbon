import Link from "next/link";
import type { JournalPost } from "@/lib/blog";
import { formatJournalDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type Props = {
  post: JournalPost;
};

const PostHeader = ({ post }: Props) => {
  return (
    <header className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zen-mist/60 transition-colors hover:text-zen-gold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to garden</span>
        </Link>
        <span className="text-zen-mist/30">·</span>
        <Link
          href="/journal"
          className="text-sm text-zen-mist/60 transition-colors hover:text-zen-gold"
        >
          Journal
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/60">
            {formatJournalDate(post.publishedAt)}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.1] md:text-5xl lg:text-6xl">
            {post.title}
          </h1>
        </div>

        {post.excerpt && (
          <p className="max-w-3xl text-lg leading-relaxed text-zen-mist/75">
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
                    className="rounded-full border border-zen-gold/20 bg-zen-gold/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zen-gold/60"
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
};

export default PostHeader;

