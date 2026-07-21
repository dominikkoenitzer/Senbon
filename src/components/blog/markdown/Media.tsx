import { cn } from "@/lib/utils";
import type { MarkdownImageProps } from "./types";

/**
 * Image in markdown.
 *
 * The fade-in used to come from framer-motion, which meant this had to be a
 * client component and pulled an animation library in to change opacity. The
 * `fade-up` class in globals.css does the same thing for free.
 */
export const Image = ({ className, src, alt }: MarkdownImageProps) => (
  // Markdown images can point anywhere, so next/image would need per-host
  // remotePatterns config for sources we do not control.
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={src}
    alt={alt}
    loading="lazy"
    className={cn(
      "fade-up my-6 w-full rounded-2xl border border-border md:my-8 lg:my-10",
      className,
    )}
  />
);
