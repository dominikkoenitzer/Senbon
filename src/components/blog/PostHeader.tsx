"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { PostHeaderProps } from "@/types/blog";
import { formatJournalDate } from "@/lib/utils";

/**
 * Post header component with breadcrumbs, title, and metadata
 */
const PostHeader = memo<PostHeaderProps>(({ post }) => {
  const formattedDate = useMemo(
    () => formatJournalDate(post.publishedAt),
    [post.publishedAt]
  );

  const readingMinutes = useMemo(
    () => Math.ceil(post.readingTime.minutes),
    [post.readingTime.minutes]
  );
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="space-y-4 md:space-y-6 lg:space-y-8 pb-6 md:pb-8 lg:pb-10 border-b border-white/5 relative"
    >
      {/* Mystical glow behind header */}
      <div className="absolute -inset-8 bg-gradient-to-br from-zen-gold/10 via-transparent to-zen-gold/5 blur-3xl opacity-40 -z-10" />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 md:gap-4 relative z-10">
        <motion.div
          whileHover={{ x: -4 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-zen-mist/60 transition-colors hover:text-zen-gold/80"
          >
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
            <span>Back to garden</span>
          </Link>
        </motion.div>
        <span className="text-zen-mist/20" aria-hidden="true">·</span>
        <Link
          href="/journal"
          className="text-xs md:text-sm text-zen-mist/60 transition-colors hover:text-zen-gold/80"
        >
          Journal
        </Link>
      </nav>

      <div className="space-y-4 md:space-y-6 lg:space-y-8 relative z-10">
        <div>
          <motion.time
            dateTime={post.publishedAt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[0.65rem] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.5em] text-zen-gold/50 mb-3 md:mb-4 lg:mb-6 font-light block"
          >
            {formattedDate}
          </motion.time>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display text-2xl leading-[1.15] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-zen-mist mb-4 md:mb-6 lg:mb-8"
          >
            {post.title}
          </motion.h1>
        </div>

        {post.excerpt && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-3xl text-sm md:text-base lg:text-lg leading-relaxed text-zen-mist/70 font-light tracking-wide"
          >
            {post.excerpt}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap items-center gap-2 md:gap-4 lg:gap-6 pt-1 md:pt-2 lg:pt-4"
        >
          <div className="flex items-center gap-2 text-xs md:text-sm text-zen-mist/50 font-light">
            <span aria-label={`${readingMinutes} minute read`}>{readingMinutes} min read</span>
          </div>
          {post.tags.length > 0 && (
            <>
              <span className="text-zen-mist/20" aria-hidden="true">·</span>
              <div className="flex flex-wrap gap-1.5 md:gap-2" role="list" aria-label="Tags">
                {post.tags.map((tag, idx) => (
                  <motion.span
                    key={tag}
                    role="listitem"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-full border border-zen-gold/15 bg-zen-gold/5 px-2.5 md:px-3.5 lg:px-4 py-1 md:py-1.5 text-[0.65rem] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] text-zen-gold/60 font-light backdrop-blur-sm"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
});

PostHeader.displayName = "PostHeader";

export default PostHeader;
