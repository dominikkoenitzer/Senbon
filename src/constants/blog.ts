/**
 * Blog-related constants
 *
 * This file used to also carry ANIMATION_CONFIG, TOC_CONFIG, HEADING_LEVELS
 * and RESPONSIVE_BREAKPOINTS, plus POSTS_PER_PAGE and EXCERPT_LENGTH on the
 * config below. Every one of them was left behind by a feature that has since
 * been removed — the table of contents, the paginated journal index, the
 * Framer Motion card stagger. None was read anywhere.
 */

export const BLOG_CONFIG = {
  CONTENT_DIR: "content/journal",
  FILE_EXTENSIONS: [".md", ".mdx"],
} as const;
