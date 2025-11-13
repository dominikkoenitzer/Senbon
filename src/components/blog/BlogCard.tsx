"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { JournalPost } from "@/lib/blog";
import { formatJournalDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  post: JournalPost;
  index?: number;
};

const BlogCard = ({ post, index = 0 }: Props) => {
  return (
    <motion.article
      className="zen-card group flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Link href={`/journal/${post.slug}`} className="flex flex-1 flex-col">
        <div className="relative h-56 overflow-hidden">
          <div
            className="absolute inset-0 bg-[length:200%_200%] opacity-70 blur-xl transition duration-700 group-hover:scale-105 group-hover:opacity-100"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(247,216,160,0.25), rgba(142,185,214,0.18), rgba(226,179,192,0.25))",
            }}
          />
          <div className="relative z-10 flex h-full w-full items-end bg-gradient-to-t from-black/70 to-transparent p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/80">
                {formatJournalDate(post.publishedAt)}
              </p>
              <h3 className="font-display text-2xl leading-tight text-zen-mist">
                {post.title}
              </h3>
              <p className="text-sm text-zen-mist/80">
                {Math.ceil(post.readingTime.minutes)} min read
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 px-6 py-6">
          <p className="text-sm text-zen-mist/80">{post.excerpt}</p>
          <div className="mt-auto flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={cn(
                  "border-zen-gold/30 text-xs uppercase tracking-[0.25em]",
                  "bg-transparent text-zen-gold/70",
                )}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default BlogCard;

