"use client";

import { motion } from "framer-motion";
import "highlight.js/styles/atom-one-dark.css";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type Props = {
  content: string;
};

const MarkdownRenderer = ({ content }: Props) => {
  return (
    <article className="prose prose-invert prose-lg max-w-none relative">
      {/* Mystical glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-zen-gold/5 via-transparent to-zen-gold/5 blur-3xl opacity-50 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ ...props }) => (
              <motion.h1
                {...props}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={cn(
                  "mb-8 mt-16 scroll-m-20 font-display text-4xl font-bold leading-tight text-zen-mist first:mt-0",
                  props.className,
                )}
              />
            ),
            h2: ({ ...props }) => (
              <motion.h2
                {...props}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={cn(
                  "mb-6 mt-12 scroll-m-20 font-display text-3xl font-semibold leading-tight text-zen-mist border-b border-white/5 pb-3 relative",
                  props.className,
                )}
              >
                <span className="absolute left-0 bottom-0 h-px w-20 bg-gradient-to-r from-zen-gold/50 to-transparent" />
              </motion.h2>
            ),
            h3: ({ ...props }) => (
              <motion.h3
                {...props}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "mb-4 mt-10 scroll-m-20 font-display text-2xl font-semibold leading-tight text-zen-mist",
                  props.className,
                )}
              />
            ),
            h4: ({ ...props }) => (
              <motion.h4
                {...props}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "mb-3 mt-8 scroll-m-20 font-display text-xl font-semibold leading-tight text-zen-mist/95",
                  props.className,
                )}
              />
            ),
            p: ({ ...props }) => (
              <motion.p
                {...props}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={cn(
                  "mb-8 leading-[1.9] text-zen-mist/95 text-base md:text-lg font-light tracking-wide",
                  props.className,
                )}
              />
            ),
            a: ({ ...props }) => (
              <motion.a
                {...props}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "text-zen-gold underline decoration-zen-gold/40 underline-offset-4 transition-all hover:text-zen-gold hover:decoration-zen-gold/60",
                  props.className,
                )}
              />
            ),
            strong: ({ ...props }) => (
              <strong
                {...props}
                className={cn("font-semibold text-zen-gold", props.className)}
              />
            ),
            em: ({ ...props }) => (
              <em
                {...props}
                className={cn("italic text-zen-mist/90 not-italic font-light", props.className)}
              />
            ),
            code: ({ className, children, ...props }: any) => {
              const isInline = !className || !className.includes("language-");
              return (
                <code
                  {...props}
                  className={cn(
                    isInline
                      ? "rounded-md bg-white/10 px-2 py-1 text-sm font-mono text-zen-gold/90 before:content-none after:content-none backdrop-blur-sm border border-zen-gold/10"
                      : "block text-sm font-mono my-0",
                    className,
                  )}
                >
                  {!isInline && (
                    <>
                      {/* Decorative top border */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zen-gold/30 to-transparent" />
                      {/* Subtle inner glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-zen-gold/5 via-transparent to-transparent rounded-xl pointer-events-none" />
                    </>
                  )}
                  {children}
                </code>
              );
            },
            pre: ({ children, ...props }: any) => (
              <pre
                {...props}
                className={cn(
                  "mb-6 rounded-xl bg-gradient-to-br from-black/60 via-black/50 to-black/60 border border-zen-gold/20 p-6 overflow-x-auto backdrop-blur-md relative shadow-none",
                  props.className,
                )}
                style={{ boxShadow: 'none' }}
              >
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zen-gold/30 to-transparent z-10" />
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-zen-gold/5 via-transparent to-transparent rounded-xl pointer-events-none" />
                <div className="relative z-10">
                  {children}
                </div>
              </pre>
            ),
            blockquote: ({ ...props }) => (
              <motion.blockquote
                {...props}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={cn(
                  "my-8 border-l-4 border-zen-gold/40 bg-gradient-to-r from-zen-gold/5 to-transparent pl-6 py-5 italic text-zen-gold text-lg leading-relaxed font-light relative overflow-hidden",
                  props.className,
                )}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-zen-gold/60 via-zen-gold/40 to-transparent" />
              </motion.blockquote>
            ),
            ul: ({ ...props }) => (
              <ul
                {...props}
                className={cn(
                  "my-6 ml-6 space-y-4 list-disc text-zen-mist/95 marker:text-zen-gold/60",
                  props.className,
                )}
              />
            ),
            ol: ({ ...props }) => (
              <ol
                {...props}
                className={cn(
                  "my-6 ml-6 space-y-4 list-decimal text-zen-mist/95 marker:text-zen-gold/60",
                  props.className,
                )}
              />
            ),
            li: ({ ...props }) => (
              <motion.li
                {...props}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={cn("leading-relaxed pl-2 font-light text-zen-mist/95", props.className)}
              />
            ),
            hr: ({ ...props }) => (
              <motion.hr
                {...props}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={cn(
                  "my-16 border-0 h-px bg-gradient-to-r from-transparent via-zen-gold/20 to-transparent",
                  props.className,
                )}
              />
            ),
            img: ({ ...props }) => (
              <motion.img
                {...props}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={cn(
                  "my-10 rounded-lg border border-white/10 w-full backdrop-blur-sm",
                  props.className,
                )}
              />
            ),
            table: ({ ...props }) => (
              <div className="my-8 overflow-x-auto">
                <table
                  {...props}
                  className={cn(
                    "w-full border-collapse border border-white/5 rounded-lg overflow-hidden backdrop-blur-sm",
                    props.className,
                  )}
                />
              </div>
            ),
            thead: ({ ...props }) => (
              <thead
                {...props}
                className={cn("bg-white/5", props.className)}
              />
            ),
            th: ({ ...props }) => (
              <th
                {...props}
                className={cn(
                  "border border-white/5 px-4 py-3 text-left font-semibold text-zen-gold",
                  props.className,
                )}
              />
            ),
            td: ({ ...props }) => (
              <td
                {...props}
                className={cn(
                  "border border-white/5 px-4 py-3 text-zen-mist/95",
                  props.className,
                )}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </motion.div>
    </article>
  );
};

export default MarkdownRenderer;
