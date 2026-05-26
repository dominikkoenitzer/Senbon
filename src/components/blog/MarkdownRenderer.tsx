"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/atom-one-dark.css";
import type { MarkdownRendererProps } from "@/types/blog";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="read-prose max-w-[68ch] text-foreground/85"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: H1,
          h2: H2,
          h3: H3,
          h4: H4,
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
    </motion.div>
  );
};

export default MarkdownRenderer;
