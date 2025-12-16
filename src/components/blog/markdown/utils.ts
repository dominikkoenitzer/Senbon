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

