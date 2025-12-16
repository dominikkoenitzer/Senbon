import type { TocItem } from "@/types/blog";
import { HEADING_LEVELS } from "@/constants/blog";

/**
 * Generate a URL-safe ID from heading text
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Extract headings from markdown content for table of contents
 * Only extracts h1-h4 by default
 */
export function extractHeadings(
  content: string,
  minLevel: number = HEADING_LEVELS.MIN,
  maxLevel: number = HEADING_LEVELS.MAX
): TocItem[] {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    
    // Skip if outside desired level range
    if (level < minLevel || level > maxLevel) {
      continue;
    }

    const text = match[2].trim();
    const id = generateHeadingId(text);

    headings.push({ id, text, level });
  }

  return headings;
}

