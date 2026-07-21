import type { ReactNode } from "react";

/**
 * Extract plain text content from React children
 * Used for generating IDs from heading content
 */
export function getTextContent(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join("");
  
  if (node && typeof node === "object" && "props" in node) {
    const propsNode = node as { props: { children?: ReactNode } };
    return getTextContent(propsNode.props.children);
  }
  
  return "";
}


/**
 * Slugify a heading into an anchor id.
 *
 * Previously lived in `src/lib/toc.ts` alongside the table-of-contents
 * extractor. The TOC is gone, but headings still want stable anchors, so the
 * one function that survived moved here.
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
