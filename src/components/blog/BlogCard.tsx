"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { JournalPost } from "@/lib/blog";
import { formatJournalDate } from "@/lib/utils";

type Props = {
  post: JournalPost;
  index?: number;
};

const BlogCard = ({ post, index = 0 }: Props) => {
  return (
    <motion.article
      className="group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
    >
      <Link
        href={`/journal/${post.slug}`}
        className="zen-card block h-full transition-all duration-300 hover:border-zen-gold/30 hover:scale-[1.01]"
      >
        <div className="flex flex-col gap-6 p-8">
          {/* Date */}
          <div className="flex items-center gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/60 font-light">
              {formatJournalDate(post.publishedAt)}
            </p>
            <span className="h-px w-12 bg-gradient-to-r from-zen-gold/30 to-transparent" />
          </div>

          {/* Title */}
          <h3 className="font-display text-2xl leading-tight text-zen-mist transition-colors group-hover:text-zen-gold">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm leading-relaxed text-zen-mist/75 line-clamp-3 font-light flex-grow">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between gap-4 pt-6 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zen-gold/20 bg-zen-gold/5 px-3 py-1 text-xs uppercase tracking-[0.15em] text-zen-gold/70 font-light"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="text-xs text-zen-mist/40 font-light">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zen-mist/50">
              <span>{Math.ceil(post.readingTime.minutes)}m</span>
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
};

export default BlogCard;
