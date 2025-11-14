"use client";

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
    <article className="prose prose-invert prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ ...props }) => (
            <h1
              {...props}
              className={cn(
                "mb-8 mt-16 scroll-m-20 font-display text-4xl font-bold leading-tight text-zen-mist first:mt-0",
                props.className,
              )}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              {...props}
              className={cn(
                "mb-6 mt-12 scroll-m-20 font-display text-3xl font-semibold leading-tight text-zen-mist border-b border-white/10 pb-3",
                props.className,
              )}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              {...props}
              className={cn(
                "mb-4 mt-10 scroll-m-20 font-display text-2xl font-semibold leading-tight text-zen-mist",
                props.className,
              )}
            />
          ),
          h4: ({ ...props }) => (
            <h4
              {...props}
              className={cn(
                "mb-3 mt-8 scroll-m-20 font-display text-xl font-semibold leading-tight text-zen-mist/90",
                props.className,
              )}
            />
          ),
          p: ({ ...props }) => (
            <p
              {...props}
              className={cn(
                "mb-6 leading-[1.8] text-zen-mist/90 text-base md:text-lg",
                props.className,
              )}
            />
          ),
          a: ({ ...props }) => (
            <a
              {...props}
              className={cn(
                "text-zen-gold underline decoration-zen-gold/40 underline-offset-4 transition-colors hover:text-zen-gold/80 hover:decoration-zen-gold/60",
                props.className,
              )}
            />
          ),
          strong: ({ ...props }) => (
            <strong
              {...props}
              className={cn("font-semibold text-zen-gold/90", props.className)}
            />
          ),
          em: ({ ...props }) => (
            <em
              {...props}
              className={cn("italic text-zen-mist/80", props.className)}
            />
          ),
          code: ({ className, children, ...props }: any) => {
            const isInline = !className || !className.includes("language-");
            return (
              <code
                {...props}
                className={cn(
                  isInline
                    ? "rounded-md bg-white/10 px-2 py-1 text-sm font-mono text-zen-gold before:content-none after:content-none"
                    : "block rounded-xl bg-black/60 border border-white/10 p-6 text-sm font-mono overflow-x-auto my-6",
                  className,
                )}
              >
                {children}
              </code>
            );
          },
          pre: ({ ...props }) => (
            <pre
              {...props}
              className={cn(
                "mb-6 rounded-xl bg-black/60 border border-white/10 p-0 overflow-hidden",
                props.className,
              )}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              {...props}
              className={cn(
                "my-8 border-l-4 border-zen-gold/50 bg-zen-gold/5 pl-6 py-4 italic text-zen-gold/90 text-lg leading-relaxed",
                props.className,
              )}
            />
          ),
          ul: ({ ...props }) => (
            <ul
              {...props}
              className={cn(
                "my-6 ml-6 space-y-3 list-disc text-zen-mist/90 marker:text-zen-gold/60",
                props.className,
              )}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              {...props}
              className={cn(
                "my-6 ml-6 space-y-3 list-decimal text-zen-mist/90 marker:text-zen-gold/60",
                props.className,
              )}
            />
          ),
          li: ({ ...props }) => (
            <li
              {...props}
              className={cn("leading-relaxed pl-2", props.className)}
            />
          ),
          hr: ({ ...props }) => (
            <hr
              {...props}
              className={cn(
                "my-12 border-0 border-t border-white/10",
                props.className,
              )}
            />
          ),
          img: ({ ...props }) => (
            <img
              {...props}
              className={cn(
                "my-8 rounded-lg border border-white/10 w-full",
                props.className,
              )}
            />
          ),
          table: ({ ...props }) => (
            <div className="my-8 overflow-x-auto">
              <table
                {...props}
                className={cn(
                  "w-full border-collapse border border-white/10 rounded-lg overflow-hidden",
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
                "border border-white/10 px-4 py-3 text-left font-semibold text-zen-gold",
                props.className,
              )}
            />
          ),
          td: ({ ...props }) => (
            <td
              {...props}
              className={cn(
                "border border-white/10 px-4 py-3 text-zen-mist/80",
                props.className,
              )}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

export default MarkdownRenderer;
