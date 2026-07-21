"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { PostHeaderProps } from "@/types/blog";
import { formatJournalDate } from "@/lib/utils";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease }}
      className="flex flex-col gap-10 pb-10 md:gap-14 md:pb-14"
    >
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-foreground/70"
      >
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Garden
        </Link>
        <span aria-hidden="true" className="text-foreground/20">
          /
        </span>
        <Link
          href="/journal"
          className="transition-colors hover:text-primary"
        >
          Journal
        </Link>
      </nav>

      <div className="flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col gap-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.35em] text-foreground/70"
          >
            <time dateTime={post.publishedAt} className="text-primary/80">
              {formattedDate}
            </time>
            <span className="h-3 w-px bg-foreground/20" aria-hidden="true" />
            <span>{readingMinutes} min read</span>
            <span className="h-3 w-px bg-foreground/20" aria-hidden="true" />
            <span>An entry</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease }}
            className="font-display text-4xl leading-[1.02] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl display-balance"
          >
            {post.title}
          </motion.h1>
        </div>

        {post.excerpt && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-3xl border-l-2 border-primary/40 pl-5 text-base leading-relaxed text-foreground/80 read-prose md:pl-6 md:text-lg"
          >
            {post.excerpt}
          </motion.p>
        )}

        {post.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center gap-2"
            role="list"
            aria-label="Tags"
          >
            {post.tags.map((tag) => (
              <span
                key={tag}
                role="listitem"
                className="rounded-full border border-foreground/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground/70"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        )}
      </div>

      <div className="zen-rule" />
    </motion.header>
  );
});

PostHeader.displayName = "PostHeader";

export default PostHeader;
