"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BlogCardProps } from "@/types/blog";
import { formatJournalDate } from "@/lib/utils";
import { ANIMATION_CONFIG } from "@/constants/blog";

/**
 * Blog card component with animation
 * Displays post preview with title, excerpt, tags, and metadata
 */
const BlogCard = memo<BlogCardProps>(({ post, index = 0 }) => {
  const formattedDate = useMemo(
    () => formatJournalDate(post.publishedAt),
    [post.publishedAt]
  );

  const displayTags = useMemo(
    () => post.tags.slice(0, 2),
    [post.tags]
  );

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * ANIMATION_CONFIG.CARD_DELAY_INCREMENT,
        duration: ANIMATION_CONFIG.DEFAULT_DURATION,
        ease: ANIMATION_CONFIG.EASE_OUT,
      }}
    >
      <Link
        href={`/journal/${post.slug}`}
        className="zen-card block h-full transition-all duration-300 hover:border-zen-gold/30 hover:scale-[1.01]"
      >
        <div className="flex flex-col gap-4 md:gap-6 p-5 md:p-8">
          {/* Date */}
          <div className="flex items-center gap-2 md:gap-3">
            <time
              dateTime={post.publishedAt}
              className="text-[0.65rem] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] text-zen-gold/60 font-light"
            >
              {formattedDate}
            </time>
            <span className="h-px w-8 md:w-12 bg-gradient-to-r from-zen-gold/30 to-transparent" />
          </div>

          {/* Title */}
          <h3 className="font-display text-lg md:text-xl lg:text-2xl leading-tight text-zen-mist transition-colors group-hover:text-zen-gold">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs md:text-sm leading-relaxed text-zen-mist/75 line-clamp-3 font-light flex-grow">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between gap-3 md:gap-4 pt-4 md:pt-6 border-t border-white/5">
            <div className="flex flex-wrap gap-1.5 md:gap-2" role="list" aria-label="Tags">
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  role="listitem"
                  className="rounded-full border border-zen-gold/20 bg-zen-gold/5 px-2 md:px-3 py-0.5 md:py-1 text-[0.65rem] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.15em] text-zen-gold/70 font-light"
                >
                  {tag}
                </span>
              ))}
              {remainingTagsCount > 0 && (
                <span
                  className="text-[0.65rem] md:text-xs text-zen-mist/40 font-light self-center"
                  aria-label={`${remainingTagsCount} more tags`}
                >
                  +{remainingTagsCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[0.65rem] md:text-xs text-zen-mist/50 whitespace-nowrap">
              <span aria-label={`${readingMinutes} minute read`}>{readingMinutes}m</span>
              <motion.span
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ x: -5 }}
                whileHover={{ x: 0 }}
              >
                →
              </motion.span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
});

BlogCard.displayName = "BlogCard";

export default BlogCard;
