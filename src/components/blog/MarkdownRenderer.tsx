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
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:text-zen-mist prose-p:text-zen-mist/90 prose-strong:text-zen-gold prose-code:rounded-md prose-code:bg-white/5 prose-code:px-2 prose-code:py-1 prose-blockquote:border-zen-gold/50 prose-blockquote:text-zen-gold/80">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h2: ({ ...props }) => (
            <h2
              {...props}
              className={cn(
                "mt-12 scroll-m-20 text-3xl font-semibold tracking-tight",
                props.className,
              )}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              {...props}
              className={cn(
                "mt-10 scroll-m-20 text-2xl font-semibold tracking-tight",
                props.className,
              )}
            />
          ),
          p: ({ ...props }) => (
            <p
              {...props}
              className={cn("leading-relaxed text-zen-mist/85", props.className)}
            />
          ),
          code: ({ className, children, ...props }: any) => {
            const isInline = !className || !className.includes("language-");
            return (
              <code
                {...props}
                className={cn(
                  isInline
                    ? "rounded-md bg-white/10 px-2 py-0.5 text-sm text-zen-gold"
                    : "block rounded-xl bg-black/40 p-4 text-sm",
                  className,
                )}
              >
                {children}
              </code>
            );
          },
          blockquote: ({ ...props }) => (
            <blockquote
              {...props}
              className={cn(
                "border-l-4 border-zen-gold/40 bg-white/5 px-6 py-4 italic text-zen-gold/80",
                props.className,
              )}
            />
          ),
          ul: ({ ...props }) => (
            <ul
              {...props}
              className={cn(
                "my-6 ml-6 list-disc space-y-2 text-zen-mist/85",
                props.className,
              )}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              {...props}
              className={cn(
                "my-6 ml-6 list-decimal space-y-2 text-zen-mist/85",
                props.className,
              )}
            />
          ),
          hr: () => null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
