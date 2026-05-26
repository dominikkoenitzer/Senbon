"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { BlogCardProps } from "@/types/blog";
import { formatJournalDate } from "@/lib/utils";
import { ANIMATION_CONFIG } from "@/constants/blog";

const BlogCard = memo<BlogCardProps>(({ post, index = 0 }) => {
  const formattedDate = useMemo(
    () => formatJournalDate(post.publishedAt),
    [post.publishedAt]
  );

  const displayTags = useMemo(() => post.tags.slice(0, 2), [post.tags]);
  const remainingTagsCount = useMemo(
    () => Math.max(0, post.tags.length - 2),
    [post.tags.length]
  );
  const readingMinutes = useMemo(
    () => Math.ceil(post.readingTime.minutes),
    [post.readingTime.minutes]
  );

  return (
    <motion.article
      className="group"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * ANIMATION_CONFIG.CARD_DELAY_INCREMENT,
        duration: ANIMATION_CONFIG.DEFAULT_DURATION,
        ease: ANIMATION_CONFIG.EASE_OUT,
      }}
    >
      <Link
        href={`/journal/${post.slug}`}
        className="zen-card relative flex h-full flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-0.5"
      >
        {/* Hover glow */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 30% 0%, rgba(230,194,129,0.10), transparent 60%)",
          }}
        />

        <div className="relative flex h-full flex-col gap-6 p-7 md:p-8">
          {/* Meta line */}
          <div className="flex items-center justify-between gap-3">
            <time
              dateTime={post.publishedAt}
              className="kicker"
            >
              {formattedDate}
            </time>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display text-2xl leading-[1.15] tracking-tight text-foreground transition-colors group-hover:text-primary md:text-[1.65rem] display-balance">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="line-clamp-3 text-sm leading-relaxed text-foreground/70 read-prose md:text-[0.95rem]">
              {post.excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between gap-3 pt-6">
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="list"
              aria-label="Tags"
            >
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  role="listitem"
                  className="rounded-full border border-foreground/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] text-foreground/55"
                >
                  {tag}
                </span>
              ))}
              {remainingTagsCount > 0 && (
                <span
                  className="text-[10px] uppercase tracking-[0.15em] text-foreground/35"
                  aria-label={`${remainingTagsCount} more tags`}
                >
                  +{remainingTagsCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-foreground/45">
              <span aria-label={`${readingMinutes} minute read`}>
                {readingMinutes} min
              </span>
              <ArrowUpRight
                className="h-3.5 w-3.5 text-primary/0 transition-all duration-300 group-hover:text-primary/80 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
});

BlogCard.displayName = "BlogCard";

export default BlogCard;
