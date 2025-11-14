import Link from "next/link";
import type { JournalPost } from "@/lib/blog";
import { formatJournalDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type Props = {
  post: JournalPost;
};

const PostHeader = ({ post }: Props) => {
  return (
    <header className="space-y-10 pb-8 border-b border-white/10">
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

      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/60 mb-4">
            {formatJournalDate(post.publishedAt)}
          </p>
          <h1 className="font-display text-5xl leading-[1.1] md:text-6xl lg:text-7xl text-zen-mist mb-6">
            {post.title}
          </h1>
        </div>

        {post.excerpt && (
          <p className="max-w-3xl text-xl leading-relaxed text-zen-mist/75 font-light">
            {post.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-6 pt-4">
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
                    className="rounded-full border border-zen-gold/20 bg-zen-gold/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-zen-gold/70 font-medium"
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
