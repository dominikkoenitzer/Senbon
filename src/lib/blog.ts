import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
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
const publicDir = path.join(process.cwd(), "public");

/**
 * Resolve a hero path declared in frontmatter. Only returns the path if the
 * file actually exists under /public — prevents broken-image renders for
 * posts that have `hero:` set but no asset uploaded yet.
 */
const resolveHero = async (
  hero: string | undefined
): Promise<string | undefined> => {
  if (!hero) return undefined;
  // Only check site-relative paths (`/images/...`). External URLs pass through.
  if (!hero.startsWith("/")) return hero;
  try {
    await fs.access(path.join(publicDir, hero));
    return hero;
  } catch {
    return undefined;
  }
};

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
    hero: await resolveHero(frontmatter.hero),
    featured: frontmatter.featured ?? false,
    readingTime: readingTime(content),
    content,
  };
};

/**
 * Get all blog posts sorted by date.
 * Wrapped in React.cache so repeated calls per request are deduped (see
 * vercel-react-best-practices: server-cache-react).
 */
export const getAllPosts = cache(async (): Promise<JournalPost[]> => {
  await ensureDirectory();
  const files = await fs.readdir(contentDir);

  const posts = await Promise.all(
    files.filter(isMarkdownFile).map(parsePostFile)
  );

  return posts.sort(sortByDateDesc);
});

export const getPostBySlug = cache(
  async (slug: string): Promise<JournalPost | null> => {
    const posts = await getAllPosts();
    return posts.find((post) => post.slug === slug) ?? null;
  }
);

export const getAllPostSlugs = cache(async (): Promise<string[]> => {
  const posts = await getAllPosts();
  return posts.map((post) => post.slug);
});

/**
 * Return the entries immediately newer and older than `slug` in publication
 * order, for prev/next navigation at the bottom of a post.
 */
export type AdjacentSummary = {
  slug: string;
  title: string;
};

export const getAdjacentPosts = cache(
  async (
    slug: string
  ): Promise<{
    newer: AdjacentSummary | null;
    older: AdjacentSummary | null;
  }> => {
    const posts = await getAllPosts();
    const idx = posts.findIndex((p) => p.slug === slug);
    if (idx === -1) return { newer: null, older: null };
    // getAllPosts is sorted newest-first.
    const newerPost = idx > 0 ? posts[idx - 1] : null;
    const olderPost = idx < posts.length - 1 ? posts[idx + 1] : null;
    return {
      newer: newerPost ? { slug: newerPost.slug, title: newerPost.title } : null,
      older: olderPost ? { slug: olderPost.slug, title: olderPost.title } : null,
    };
  }
);

