import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/atom-one-light.css";
import type { MarkdownRendererProps } from "@/types/blog";
import { generateHeadingId, getTextContent } from "./markdown/utils";
import {
  H1,
  H2,
  H3,
  H4,
  Code,
  Pre,
  Paragraph,
  Link,
  Strong,
  Em,
  Blockquote,
  Hr,
  Ul,
  Ol,
  Li,
  TableWrapper,
  Thead,
  Th,
  Td,
  Image,
} from "./markdown";

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  // Assign a unique id per heading within this one document, in render order,
  // so two headings with the same text get distinct anchors (`-2`, `-3`) rather
  // than colliding on one id. Scoped to this render, so concurrent requests
  // never share the counter.
  const seen = new Map<string, number>();
  const headingId = (children: ReactNode): string => {
    const base = generateHeadingId(getTextContent(children));
    if (!base) return base;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  return (
    <div className="fade-up read-prose max-w-[68ch] text-foreground/85">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <H1 id={headingId(children)}>{children}</H1>,
          h2: ({ children }) => <H2 id={headingId(children)}>{children}</H2>,
          h3: ({ children }) => <H3 id={headingId(children)}>{children}</H3>,
          h4: ({ children }) => <H4 id={headingId(children)}>{children}</H4>,
          p: Paragraph,
          a: Link,
          strong: Strong,
          em: Em,
          code: Code,
          pre: Pre,
          blockquote: Blockquote,
          ul: Ul,
          ol: Ol,
          li: Li,
          hr: Hr,
          img: Image,
          table: TableWrapper,
          thead: Thead,
          th: Th,
          td: Td,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
