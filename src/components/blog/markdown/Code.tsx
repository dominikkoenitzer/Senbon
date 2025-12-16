import { cn } from "@/lib/utils";
import type { MarkdownCodeProps, MarkdownPreProps } from "./types";

/**
 * Inline and block code component
 */
export const Code = ({ className, children }: MarkdownCodeProps) => {
  const isInline = !className || !className.includes("language-");
  
  return (
    <code
      className={cn(
        isInline
          ? "rounded bg-white/10 px-1.5 md:px-2 py-0.5 text-xs md:text-sm font-mono text-zen-gold/90 before:content-none after:content-none"
          : "block text-xs md:text-sm font-mono my-0",
        className
      )}
    >
      {children}
    </code>
  );
};

/**
 * Pre/code block wrapper
 */
export const Pre = ({ children, className }: MarkdownPreProps) => (
  <pre
    className={cn(
      "mb-4 md:mb-6 rounded-lg bg-black/30 border border-zen-gold/15 p-3 md:p-4 lg:p-6 overflow-x-auto relative text-xs md:text-sm",
      className
    )}
    style={{ boxShadow: "none" }}
  >
    {children}
  </pre>
);

