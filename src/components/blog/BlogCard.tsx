"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { JournalPost } from "@/lib/blog";
import { formatJournalDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  post: JournalPost;
  index?: number;
};

const BlogCard = ({ post, index = 0 }: Props) => {
  return (
    <motion.article
      className="zen-card group flex flex-col overflow-hidden transition-all hover:border-zen-gold/40"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <Link href={`/journal/${post.slug}`} className="flex flex-1 flex-col">
        {/* Image/Header Area */}
        <div className="relative h-48 overflow-hidden">
          <div
            className="absolute inset-0 bg-[length:200%_200%] opacity-60 blur-xl transition duration-700 group-hover:scale-110 group-hover:opacity-80"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(247,216,160,0.3), rgba(142,185,214,0.25), rgba(226,179,192,0.3))",
            }}
          />
          <div className="relative z-10 flex h-full items-end bg-gradient-to-t from-black/80 via-black/50 to-transparent p-5">
            <div className="w-full">
              <p className="text-xs uppercase tracking-[0.3em] text-zen-gold/80">
                {formatJournalDate(post.publishedAt)}
              </p>
              <h3 className="mt-2 font-display text-xl leading-tight text-zen-mist line-clamp-2">
                {post.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col gap-4 p-6">
          <p className="text-sm leading-relaxed text-zen-mist/80 line-clamp-3">
            {post.excerpt}
          </p>
          
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "rounded-full border border-zen-gold/30 bg-zen-gold/5 px-2.5 py-0.5",
                    "text-xs uppercase tracking-[0.15em] text-zen-gold/70"
                  )}
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="text-xs text-zen-mist/50">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
            <span className="text-xs text-zen-mist/60">
              {Math.ceil(post.readingTime.minutes)}m
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default BlogCard;
