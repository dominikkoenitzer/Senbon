"use client";

import { cn } from "@/lib/utils";
import { generateHeadingId } from "./utils";
import { getTextContent } from "./utils";
import type { MarkdownHeadingProps } from "./types";

export const H1 = ({ className, children }: MarkdownHeadingProps) => (
  <h1
    className={cn(
      "mt-16 mb-6 scroll-m-20 font-display text-3xl font-medium leading-tight tracking-tight text-foreground first:mt-0 md:text-4xl",
      className
    )}
  >
    {children}
  </h1>
);

export const H2 = ({ className, children }: MarkdownHeadingProps) => {
  const text = getTextContent(children);
  const id = generateHeadingId(text);
  return (
    <h2
      id={id}
      className={cn(
        "group mt-14 mb-5 scroll-m-20 font-display text-2xl font-medium leading-tight tracking-tight text-foreground md:text-[1.75rem]",
        className
      )}
    >
      <a
        href={`#${id}`}
        className="relative no-underline"
        aria-label={`Link to ${text}`}
      >
        <span
          aria-hidden="true"
          className="absolute -left-6 top-1/2 -translate-y-1/2 text-primary/0 transition-colors group-hover:text-primary/60"
        >
          #
        </span>
        {children}
      </a>
    </h2>
  );
};

export const H3 = ({ className, children }: MarkdownHeadingProps) => {
  const text = getTextContent(children);
  const id = generateHeadingId(text);
  return (
    <h3
      id={id}
      className={cn(
        "mt-10 mb-3 scroll-m-20 font-display text-xl font-medium leading-snug text-foreground md:text-[1.35rem]",
        className
      )}
    >
      {children}
    </h3>
  );
};

export const H4 = ({ className, children }: MarkdownHeadingProps) => {
  const text = getTextContent(children);
  const id = generateHeadingId(text);
  return (
    <h4
      id={id}
      className={cn(
        "mt-8 mb-2 scroll-m-20 font-display text-lg font-medium leading-snug text-foreground/95",
        className
      )}
    >
      {children}
    </h4>
  );
};
