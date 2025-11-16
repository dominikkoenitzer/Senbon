import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const contentDir = path.join(process.cwd(), "content", "journal");

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
  hero?: string;
  featured?: boolean;
  readingTime: ReturnType<typeof readingTime>;
  content: string;
};

const sortByDateDesc = (a: JournalPost, b: JournalPost) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

const ensureDirectory = async () => {
  try {
    await fs.access(contentDir);
  } catch {
    await fs.mkdir(contentDir, { recursive: true });
  }
};

export const getAllPosts = async (): Promise<JournalPost[]> => {
  await ensureDirectory();
  const files = await fs.readdir(contentDir);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
      .map(async (file) => {
        const slug = file.replace(/\.mdx?$/, "");
        const filePath = path.join(contentDir, file);
        const source = await fs.readFile(filePath, "utf8");
        const { data, content } = matter(source);

        return {
          slug,
          title: data.title ?? slug,
          excerpt: data.excerpt ?? "",
          publishedAt: data.publishedAt ?? new Date().toISOString(),
          tags: data.tags ?? [],
          hero: data.hero,
          featured: data.featured ?? false,
          readingTime: readingTime(content),
          content,
        } satisfies JournalPost;
      }),
  );

  return posts.sort(sortByDateDesc);
};

export const getPostBySlug = async (slug: string) => {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug) ?? null;
};

export const getAllPostSlugs = async () => {
  const posts = await getAllPosts();
  return posts.map((post) => post.slug);
};

