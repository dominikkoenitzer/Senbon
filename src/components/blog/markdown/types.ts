import type { ReactNode } from "react";

/**
 * Common markdown component props
 *
 * These describe what the overrides actually destructure, not everything
 * react-markdown happens to pass. `MarkdownHeadingProps.level`,
 * `MarkdownCodeProps.inline` and the `node` fields on the code and pre props
 * were all declared and never read — `Code` re-derives inline-ness from
 * `className.includes("language-")`, and the heading components are separate
 * H1-H4 functions rather than one level-switching component.
 */
export interface MarkdownComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface MarkdownLinkProps extends MarkdownComponentProps {
  href?: string;
}

export interface MarkdownImageProps {
  className?: string;
  src?: string | Blob;
  alt?: string;
}
