import type { TocItem } from "@/types/blog";
import { HEADING_LEVELS } from "@/constants/blog";

/** URL-safe slug from heading text. */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extract headings for the table of contents.
 * - Skips fenced code blocks (``` or ~~~) so heading-shaped lines inside
 *   markdown samples don't pollute the TOC.
 * - Deduplicates IDs by appending `-2`, `-3`, etc. when text collides.
 */
export function extractHeadings(
  content: string,
  minLevel: number = HEADING_LEVELS.MIN,
  maxLevel: number = HEADING_LEVELS.MAX
): TocItem[] {
  const headings: TocItem[] = [];
  const used = new Map<string, number>();
  let inFence = false;
  let fenceMarker: string | null = null;

  for (const line of content.split("\n")) {
    const fenceMatch = line.match(/^(\s*)(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[2];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker[0];
      } else if (fenceMarker && marker.startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = null;
      }
      continue;
    }
    if (inFence) continue;

    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!headingMatch) continue;
    const level = headingMatch[1].length;
    if (level < minLevel || level > maxLevel) continue;

    const text = headingMatch[2].trim();
    const baseId = generateHeadingId(text);
    if (!baseId) continue;
    const seen = used.get(baseId) ?? 0;
    const id = seen === 0 ? baseId : `${baseId}-${seen + 1}`;
    used.set(baseId, seen + 1);

    headings.push({ id, text, level });
  }

  return headings;
}
