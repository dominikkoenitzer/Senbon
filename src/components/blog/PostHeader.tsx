"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { JournalPost } from "@/lib/blog";
import { formatJournalDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type Props = {
  post: JournalPost;
};

const PostHeader = ({ post }: Props) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="space-y-6 md:space-y-10 pb-8 md:pb-12 border-b border-white/5 relative"
    >
      {/* Mystical glow behind header */}
      <div className="absolute -inset-8 bg-gradient-to-br from-zen-gold/10 via-transparent to-zen-gold/5 blur-3xl opacity-40 -z-10" />

      <div className="flex items-center gap-4 relative z-10">
        <motion.div
          whileHover={{ x: -4 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zen-mist/60 transition-colors hover:text-zen-gold/80"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to garden</span>
          </Link>
        </motion.div>
        <span className="text-zen-mist/20">·</span>
        <Link
          href="/journal"
          className="text-sm text-zen-mist/60 transition-colors hover:text-zen-gold/80"
        >
          Journal
        </Link>
      </div>

      <div className="space-y-6 md:space-y-8 relative z-10">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-[0.5em] text-zen-gold/50 mb-4 md:mb-6 font-light"
          >
            {formatJournalDate(post.publishedAt)}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-display text-3xl leading-[1.1] md:text-5xl lg:text-6xl xl:text-7xl text-zen-mist mb-6 md:mb-8"
          >
            {post.title}
          </motion.h1>
        </div>

        {post.excerpt && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-3xl text-base md:text-lg lg:text-xl leading-relaxed text-zen-mist/70 font-light tracking-wide"
          >
            {post.excerpt}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap items-center gap-4 md:gap-6 pt-2 md:pt-4"
        >
          <div className="flex items-center gap-2 text-sm text-zen-mist/50 font-light">
            <span>{Math.ceil(post.readingTime.minutes)} min read</span>
          </div>
          {post.tags.length > 0 && (
            <>
              <span className="text-zen-mist/20">·</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, idx) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-full border border-zen-gold/15 bg-zen-gold/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-zen-gold/60 font-light backdrop-blur-sm"
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
};

export default PostHeader;
