import type { ReadTimeResults } from "reading-time";

/**
 * Core blog post type
 */
export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
  hero?: string;
  featured?: boolean;
  readingTime: ReadTimeResults;
  content: string;
}

/**
 * Post metadata from frontmatter
 */
export interface PostFrontmatter {
  title?: string;
  excerpt?: string;
  publishedAt?: string;
  tags?: string[];
  hero?: string;
  featured?: boolean;
}

/**
 * Table of contents item
 */
export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Component props
 */
export interface BlogCardProps {
  post: JournalPost;
  index?: number;
}

export interface PostGridProps {
  posts: JournalPost[];
}

export interface PostHeaderProps {
  post: JournalPost;
}

export interface MarkdownRendererProps {
  content: string;
}

export interface TableOfContentsProps {
  items: TocItem[];
  mobile?: boolean;
}

