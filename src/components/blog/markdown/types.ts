import type { ReactNode } from "react";

/**
 * Common markdown component props
 */
export interface MarkdownComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface MarkdownHeadingProps extends MarkdownComponentProps {
  level?: number;
}

export interface MarkdownLinkProps extends MarkdownComponentProps {
  href?: string;
}

export interface MarkdownCodeProps extends MarkdownComponentProps {
  inline?: boolean;
  node?: unknown;
}

export interface MarkdownImageProps {
  className?: string;
  src?: string | Blob;
  alt?: string;
}

export interface MarkdownPreProps extends MarkdownComponentProps {
  node?: unknown;
}

