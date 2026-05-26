"use client";

import { cn } from "@/lib/utils";
import type { MarkdownComponentProps, MarkdownLinkProps } from "./types";

export const Paragraph = ({ className, children }: MarkdownComponentProps) => (
  <p
    className={cn(
      "mb-6 text-[1.0625rem] leading-[1.8] text-foreground/85",
      className
    )}
  >
    {children}
  </p>
);

export const Link = ({ className, children, href }: MarkdownLinkProps) => (
  <a
    href={href}
    target={href?.startsWith("http") ? "_blank" : undefined}
    rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    className={cn(
      "text-primary underline decoration-primary/40 decoration-1 underline-offset-4 transition-colors hover:decoration-primary",
      className
    )}
  >
    {children}
  </a>
);

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
