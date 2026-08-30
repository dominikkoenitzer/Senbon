import { cn } from "@/lib/cn";
import { generateHeadingId, getTextContent } from "./utils";
import type { MarkdownComponentProps } from "./types";

/**
 * A markdown `#` renders as an `<h2>`, not an `<h1>`: the page already has one
 * `<h1>` (the entry title), and a second one is a heading-order violation. It
 * keeps the largest heading styling so an author who reaches for `#` still gets
 * a top-level look. The id comes from the renderer's per-document slugger.
 */
export const H1 = ({ id, className, children }: MarkdownComponentProps) => (
  <h2
    id={id ?? generateHeadingId(getTextContent(children))}
    className={cn(
      "mt-16 mb-6 scroll-m-20 font-display text-3xl font-medium leading-tight tracking-tight text-foreground first:mt-0 md:text-4xl",
      className
    )}
  >
    {children}
  </h2>
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
export const H2 = ({ id, className, children }: MarkdownComponentProps) => {
  const text = getTextContent(children);
  const headingId = id ?? generateHeadingId(text);
  const textId = `${headingId}-text`;
  return (
    <h2
      id={headingId}
      aria-labelledby={textId}
      className={cn(
        "group relative mt-14 mb-5 scroll-m-20 font-display text-2xl font-medium leading-tight tracking-tight text-foreground md:text-[1.75rem]",
        className
      )}
    >
      <a
        href={`#${headingId}`}
        aria-label={`Link to ${text}`}
        className="absolute -left-6 top-1/2 -translate-y-1/2 no-underline text-primary/0 transition-colors group-hover:text-primary/70 focus-visible:text-primary/70"
      >
        #
      </a>
      <span id={textId}>{children}</span>
    </h2>
  );
};

export const H3 = ({ id, className, children }: MarkdownComponentProps) => (
  <h3
    id={id ?? generateHeadingId(getTextContent(children))}
    className={cn(
      "mt-10 mb-3 scroll-m-20 font-display text-xl font-medium leading-snug text-foreground md:text-[1.35rem]",
      className
    )}
  >
    {children}
  </h3>
);

export const H4 = ({ id, className, children }: MarkdownComponentProps) => (
  <h4
    id={id ?? generateHeadingId(getTextContent(children))}
    className={cn(
      "mt-8 mb-2 scroll-m-20 font-display text-lg font-medium leading-snug text-foreground/95",
      className
    )}
  >
    {children}
  </h4>
);
