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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <Link href={`/journal/${post.slug}`} className="zen-card block h-full transition-all hover:border-zen-gold/30">
        <div className="flex flex-col gap-5 p-6">
          {/* Date */}
          <p className="text-xs uppercase tracking-[0.4em] text-zen-gold/60">
            {formatJournalDate(post.publishedAt)}
          </p>
          
          {/* Title */}
          <h3 className="font-display text-xl leading-tight text-zen-mist transition-colors group-hover:text-zen-gold">
            {post.title}
          </h3>
          
          {/* Excerpt */}
          <p className="text-sm leading-relaxed text-zen-mist/70 line-clamp-3">
            {post.excerpt}
          </p>
          
          {/* Footer */}
          <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zen-gold/20 bg-zen-gold/5 px-2.5 py-0.5 text-xs uppercase tracking-[0.15em] text-zen-gold/60"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="text-xs text-zen-mist/40">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
            <span className="text-xs text-zen-mist/50">
              {Math.ceil(post.readingTime.minutes)}m
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default BlogCard;
