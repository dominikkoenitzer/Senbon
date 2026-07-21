"use client";

import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarkdownComponentProps, MarkdownLinkProps } from "./types";

/**
 * `.overflow-wrap-anywhere` for the same reason the guestbook card needs it: a
 * single unbroken string — a long URL pasted into an entry, a stack trace, a
 * hash — otherwise escapes the column and stretches the page sideways.
 */
export const Paragraph = ({ className, children }: MarkdownComponentProps) => (
  <p
    className={cn(
      "overflow-wrap-anywhere mb-6 text-[1.0625rem] leading-[1.8] text-foreground/85",
      className
    )}
  >
    {children}
  </p>
);

export const Link = ({ className, children, href }: MarkdownLinkProps) => {
  const isExternal = Boolean(href && /^https?:\/\//i.test(href));
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "overflow-wrap-anywhere inline-flex min-w-0 items-baseline gap-0.5 text-primary underline decoration-primary/40 decoration-1 underline-offset-4 transition-colors hover:decoration-primary",
        className
      )}
    >
      {children}
      {isExternal && (
        <ArrowUpRight
          className="ml-0.5 inline h-[0.85em] w-[0.85em] translate-y-[0.1em] text-primary/60"
          aria-hidden="true"
        />
      )}
    </a>
  );
};

export const Strong = ({ className, children }: MarkdownComponentProps) => (
  <strong className={cn("font-semibold text-foreground", className)}>
    {children}
  </strong>
);

export const Em = ({ className, children }: MarkdownComponentProps) => (
  <em className={cn("italic text-foreground/90", className)}>{children}</em>
);

export const Blockquote = ({ className, children }: MarkdownComponentProps) => (
  <blockquote
    className={cn(
      "my-8 border-l-2 border-primary/50 pl-5 text-[1.0625rem] leading-[1.75] text-foreground/80",
      className
    )}
  >
    {children}
  </blockquote>
);

export const Hr = ({ className }: MarkdownComponentProps) => (
  <hr
    className={cn(
      "my-12 h-px border-0 bg-gradient-to-r from-transparent via-foreground/15 to-transparent",
      className
    )}
  />
);
