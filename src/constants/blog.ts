/**
 * Blog-related constants
 */

export const BLOG_CONFIG = {
  CONTENT_DIR: "content/journal",
  FILE_EXTENSIONS: [".md", ".mdx"],
  POSTS_PER_PAGE: 12,
  EXCERPT_LENGTH: 160,
} as const;

export const ANIMATION_CONFIG = {
  CARD_DELAY_INCREMENT: 0.05,
  DEFAULT_DURATION: 0.5,
  HEADER_DURATION: 0.8,
  EASE_OUT: "easeOut",
} as const;

export const TOC_CONFIG = {
  ROOT_MARGIN: "-20% 0% -35% 0%",
  SCROLL_OFFSET: 120,
  SCROLL_DELAY: 50,
  RETRY_DELAY: 100,
  THRESHOLD: 0,
} as const;

export const HEADING_LEVELS = {
  MIN: 1,
  MAX: 4,
  DEFAULT_TOC_MIN: 2,
} as const;

export const RESPONSIVE_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

