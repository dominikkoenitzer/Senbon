"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MarkdownComponentProps, MarkdownLinkProps } from "./types";

/**
 * Paragraph component
 */
export const Paragraph = ({ className, children }: MarkdownComponentProps) => (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
    className={cn(
      "mb-4 md:mb-6 lg:mb-8 leading-[1.7] md:leading-[1.8] lg:leading-[1.9] text-zen-mist/95 text-sm md:text-base lg:text-lg font-light tracking-normal md:tracking-wide",
      className
    )}
  >
    {children}
  </motion.p>
);

/**
 * Link component
 */
export const Link = ({ className, children, href }: MarkdownLinkProps) => (
  <motion.a
    href={href}
    whileHover={{ scale: 1.02 }}
    className={cn(
      "text-zen-gold underline decoration-zen-gold/40 underline-offset-4 transition-all hover:text-zen-gold hover:decoration-zen-gold/60",
      className
    )}
  >
    {children}
  </motion.a>
);

/**
 * Strong/bold component
 */
export const Strong = ({ className, children }: MarkdownComponentProps) => (
  <strong className={cn("font-semibold text-zen-gold", className)}>
    {children}
  </strong>
);

/**
 * Emphasis/italic component
 */
export const Em = ({ className, children }: MarkdownComponentProps) => (
  <em className={cn("italic text-zen-mist/90 not-italic font-light", className)}>
    {children}
  </em>
);

/**
 * Blockquote component
 */
export const Blockquote = ({ className, children }: MarkdownComponentProps) => (
  <motion.blockquote
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
    className={cn(
      "my-4 md:my-6 lg:my-8 border-l-2 md:border-l-4 border-zen-gold/40 bg-gradient-to-r from-zen-gold/5 to-transparent pl-3 md:pl-4 lg:pl-6 py-3 md:py-4 lg:py-5 italic text-zen-gold text-sm md:text-base lg:text-lg leading-relaxed font-light relative overflow-hidden",
      className
    )}
  >
    {children}
    <div className="absolute left-0 top-0 bottom-0 w-0.5 md:w-1 bg-gradient-to-b from-zen-gold/60 via-zen-gold/40 to-transparent" />
  </motion.blockquote>
);

/**
 * Horizontal rule
 */
export const Hr = ({ className }: MarkdownComponentProps) => (
  <motion.hr
    initial={{ scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ duration: 0.8 }}
    className={cn(
      "my-8 md:my-12 lg:my-16 border-0 h-px bg-gradient-to-r from-transparent via-zen-gold/20 to-transparent",
      className
    )}
  />
);

