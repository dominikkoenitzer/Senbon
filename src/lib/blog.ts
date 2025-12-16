import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { JournalPost, PostFrontmatter } from "@/types/blog";
import { BLOG_CONFIG } from "@/constants/blog";

const contentDir = path.join(process.cwd(), BLOG_CONFIG.CONTENT_DIR);

/**
 * Sort posts by publication date (newest first)
 */
const sortByDateDesc = (a: JournalPost, b: JournalPost): number =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

/**
 * Ensure content directory exists
 */
const ensureDirectory = async (): Promise<void> => {
  try {
    await fs.access(contentDir);
  } catch {
    await fs.mkdir(contentDir, { recursive: true });
  }
};

/**
 * Check if file is a markdown file
 */
const isMarkdownFile = (filename: string): boolean =>
  BLOG_CONFIG.FILE_EXTENSIONS.some((ext) => filename.endsWith(ext));

/**
 * Parse a single post file
 */
const parsePostFile = async (file: string): Promise<JournalPost> => {
  const slug = file.replace(/\.mdx?$/, "");
  const filePath = path.join(contentDir, file);
  const source = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = data as PostFrontmatter;

  return {
    slug,
    title: frontmatter.title ?? slug,
    excerpt: frontmatter.excerpt ?? "",
    publishedAt: frontmatter.publishedAt ?? new Date().toISOString(),
    tags: frontmatter.tags ?? [],
    hero: frontmatter.hero,
    featured: frontmatter.featured ?? false,
    readingTime: readingTime(content),
    content,
  };
};

/**
 * Get all blog posts sorted by date
 */
export const getAllPosts = async (): Promise<JournalPost[]> => {
  await ensureDirectory();
  const files = await fs.readdir(contentDir);
  
  const posts = await Promise.all(
    files.filter(isMarkdownFile).map(parsePostFile)
  );

  return posts.sort(sortByDateDesc);
};

/**
 * Get a single post by slug
 */
export const getPostBySlug = async (
  slug: string
): Promise<JournalPost | null> => {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
};

/**
 * Get all post slugs for static generation
 */
export const getAllPostSlugs = async (): Promise<string[]> => {
  const posts = await getAllPosts();
  return posts.map((post) => post.slug);
};

