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
            h1: ({ className, children }) => (
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={cn(
                  "mb-8 mt-16 scroll-m-20 font-display text-4xl font-bold leading-tight text-zen-mist first:mt-0",
                  className,
                )}
              >
                {children}
              </motion.h1>
            ),
            h2: ({ className, children }) => (
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={cn(
                  "mb-6 mt-12 scroll-m-20 font-display text-3xl font-semibold leading-tight text-zen-mist border-b border-white/5 pb-3 relative",
                  className,
                )}
              >
                {children}
                <span className="absolute left-0 bottom-0 h-px w-20 bg-gradient-to-r from-zen-gold/50 to-transparent" />
              </motion.h2>
            ),
            h3: ({ className, children }) => (
              <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "mb-4 mt-10 scroll-m-20 font-display text-2xl font-semibold leading-tight text-zen-mist",
                  className,
                )}
              >
                {children}
              </motion.h3>
            ),
            h4: ({ className, children }) => (
              <motion.h4
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "mb-3 mt-8 scroll-m-20 font-display text-xl font-semibold leading-tight text-zen-mist/95",
                  className,
                )}
              >
                {children}
              </motion.h4>
            ),
            p: ({ className, children }) => (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={cn(
                  "mb-8 leading-[1.9] text-zen-mist/95 text-base md:text-lg font-light tracking-wide",
                  className,
                )}
              >
                {children}
              </motion.p>
            ),
            a: ({ className, children, href }) => (
              <motion.a
                href={href}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "text-zen-gold underline decoration-zen-gold/40 underline-offset-4 transition-all hover:text-zen-gold hover:decoration-zen-gold/60",
                  className,
                )}
              >
                {children}
              </motion.a>
            ),
            strong: ({ className, children }) => (
              <strong
                className={cn("font-semibold text-zen-gold", className)}
              >
                {children}
              </strong>
            ),
            em: ({ className, children }) => (
              <em
                className={cn("italic text-zen-mist/90 not-italic font-light", className)}
              >
                {children}
              </em>
            ),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            code: ({ className, children, ...props }: any) => {
              const isInline = !className || !className.includes("language-");
              return (
                <code
                  {...props}
                  className={cn(
                    isInline
                      ? "rounded bg-white/10 px-2 py-0.5 text-sm font-mono text-zen-gold/90 before:content-none after:content-none"
                      : "block text-sm font-mono my-0",
                    className,
                  )}
                >
                  {children}
                </code>
              );
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pre: ({ children, className, ...props }: any) => (
              <pre
                {...props}
                className={cn(
                  "mb-6 rounded-lg bg-black/30 border border-zen-gold/15 p-6 overflow-x-auto relative",
                  className,
                )}
                style={{ boxShadow: 'none' }}
              >
                {children}
              </pre>
            ),
            blockquote: ({ className, children }) => (
              <motion.blockquote
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={cn(
                  "my-8 border-l-4 border-zen-gold/40 bg-gradient-to-r from-zen-gold/5 to-transparent pl-6 py-5 italic text-zen-gold text-lg leading-relaxed font-light relative overflow-hidden",
                  className,
                )}
              >
                {children}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-zen-gold/60 via-zen-gold/40 to-transparent" />
              </motion.blockquote>
            ),
            ul: ({ className, children }) => (
              <ul
                className={cn(
                  "my-6 ml-6 space-y-4 list-disc text-zen-mist/95 marker:text-zen-gold/60",
                  className,
                )}
              >
                {children}
              </ul>
            ),
            ol: ({ className, children }) => (
              <ol
                className={cn(
                  "my-6 ml-6 space-y-4 list-decimal text-zen-mist/95 marker:text-zen-gold/60",
                  className,
                )}
              >
                {children}
              </ol>
            ),
            li: ({ className, children }) => (
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={cn("leading-relaxed pl-2 font-light text-zen-mist/95", className)}
              >
                {children}
              </motion.li>
            ),
            hr: ({ className }) => (
              <motion.hr
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={cn(
                  "my-16 border-0 h-px bg-gradient-to-r from-transparent via-zen-gold/20 to-transparent",
                  className,
                )}
              />
            ),
            img: ({ className, src, alt }) => (
              <motion.img
                src={src}
                alt={alt}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={cn(
                  "my-10 rounded-lg border border-white/10 w-full backdrop-blur-sm",
                  className,
                )}
              />
            ),
            table: ({ className, children }) => (
              <div className="my-8 overflow-x-auto">
                <table
                  className={cn(
                    "w-full border-collapse border border-white/5 rounded-lg overflow-hidden backdrop-blur-sm",
                    className,
                  )}
                >
                  {children}
                </table>
              </div>
            ),
            thead: ({ className, children }) => (
              <thead
                className={cn("bg-white/5", className)}
              >
                {children}
              </thead>
            ),
            th: ({ className, children }) => (
              <th
                className={cn(
                  "border border-white/5 px-4 py-3 text-left font-semibold text-zen-gold",
                  className,
                )}
              >
                {children}
              </th>
            ),
            td: ({ className, children }) => (
              <td
                className={cn(
                  "border border-white/5 px-4 py-3 text-zen-mist/95",
                  className,
                )}
              >
                {children}
              </td>
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
