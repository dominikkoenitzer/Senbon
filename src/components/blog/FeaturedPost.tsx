import Link from "next/link";
import type { JournalPost } from "@/lib/blog";
import { formatJournalDate } from "@/lib/utils";

type Props = {
  post: JournalPost;
};

const FeaturedPost = ({ post }: Props) => {
  return (
    <section className="space-y-6">
      <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/50">
        Featured
      </p>
      <Link href={`/journal/${post.slug}`} className="group block">
        <article className="zen-card overflow-hidden transition-all hover:border-zen-gold/30">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:h-auto">
              <div
                className="absolute inset-0 bg-[length:200%_200%] opacity-40 blur-3xl transition duration-1000 group-hover:scale-110 group-hover:opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(247,216,160,0.4), rgba(142,185,214,0.3), rgba(226,179,192,0.4))",
                }}
              />
              <div className="relative z-10 flex h-full items-end bg-gradient-to-t from-black/95 via-black/70 to-transparent p-8 md:p-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/60">
                    {formatJournalDate(post.publishedAt)}
                  </p>
                  <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl text-zen-mist">
                    {post.title}
                  </h2>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between p-8 md:p-10">
              <div className="space-y-6">
                <p className="text-base leading-relaxed text-zen-mist/75">
                  {post.excerpt}
                </p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-zen-gold/20 bg-zen-gold/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zen-gold/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm text-zen-gold/60">
                <span>{Math.ceil(post.readingTime.minutes)} min read</span>
                <span className="opacity-40">·</span>
                <span className="opacity-60 group-hover:opacity-100 transition">
                  Read more →
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </section>
  );
};

export default FeaturedPost;

