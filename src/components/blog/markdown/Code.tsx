"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
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
 * Pre/code block wrapper with one-click copy
 */
export const Pre = ({ children, className }: MarkdownPreProps) => {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const text = ref.current?.innerText ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <div className="code-block-wrap">
      <pre
        ref={ref}
        className={cn(
          "mb-4 md:mb-6 rounded-lg bg-black/30 border border-zen-gold/15 p-3 md:p-4 lg:p-6 overflow-x-auto relative text-xs md:text-sm",
          className
        )}
        style={{ boxShadow: "none" }}
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="copy-code-btn inline-flex items-center gap-1.5"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" aria-hidden="true" /> Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" aria-hidden="true" /> Copy
          </>
        )}
      </button>
    </div>
  );
};
