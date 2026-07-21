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

/**
 * H2 carries a permalink anchor. The anchor deliberately wraps only the `#`
 * glyph, never `{children}`: an anchor spanning the whole heading makes accname
 * resolution recurse into it and hand its `aria-label` back as the heading's own
 * name, so every entry announced as "Link to Foo, heading level 2" and screen
 * reader heading navigation read out a list of "Link to ..." strings.
 *
 * `aria-labelledby` then pins the heading's name to the text span, so the
 * anchor's label cannot leak into it even as a suffix.
 */
export const H2 = ({ className, children }: MarkdownHeadingProps) => {
  const text = getTextContent(children);
  const id = generateHeadingId(text);
  const textId = `${id}-text`;
  return (
    <h2
      id={id}
      aria-labelledby={textId}
      className={cn(
        "group relative mt-14 mb-5 scroll-m-20 font-display text-2xl font-medium leading-tight tracking-tight text-foreground md:text-[1.75rem]",
        className
      )}
    >
      <a
        href={`#${id}`}
        aria-label={`Link to ${text}`}
        className="absolute -left-6 top-1/2 -translate-y-1/2 no-underline text-primary/0 transition-colors group-hover:text-primary/70 focus-visible:text-primary/70"
      >
        #
      </a>
      <span id={textId}>{children}</span>
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
