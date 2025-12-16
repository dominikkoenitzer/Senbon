"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MarkdownComponentProps } from "./types";

/**
 * Unordered list component
 */
export const Ul = ({ className, children }: MarkdownComponentProps) => (
  <ul
    className={cn(
      "my-4 md:my-6 ml-4 md:ml-6 space-y-2 md:space-y-3 lg:space-y-4 list-disc text-zen-mist/95 marker:text-zen-gold/60 text-sm md:text-base lg:text-lg",
      className
    )}
  >
    {children}
  </ul>
);

/**
 * Ordered list component
 */
export const Ol = ({ className, children }: MarkdownComponentProps) => (
  <ol
    className={cn(
      "my-4 md:my-6 ml-4 md:ml-6 space-y-2 md:space-y-3 lg:space-y-4 list-decimal text-zen-mist/95 marker:text-zen-gold/60 text-sm md:text-base lg:text-lg",
      className
    )}
  >
    {children}
  </ol>
);

/**
 * List item component
 */
export const Li = ({ className, children }: MarkdownComponentProps) => (
  <motion.li
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4 }}
    className={cn("leading-relaxed pl-1 md:pl-2 font-light text-zen-mist/95", className)}
  >
    {children}
  </motion.li>
);

