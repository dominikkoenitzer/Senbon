/**
 * Core blog post type
 */
export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
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
}

export interface MarkdownRendererProps {
  content: string;
}

