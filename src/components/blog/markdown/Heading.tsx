"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { generateHeadingId } from "@/lib/toc";
import { getTextContent } from "./utils";
import type { MarkdownHeadingProps } from "./types";

/**
 * Markdown H1 component
 */
export const H1 = ({ className, children }: MarkdownHeadingProps) => (
  <motion.h1
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className={cn(
      "mb-4 md:mb-6 lg:mb-8 mt-8 md:mt-12 lg:mt-16 scroll-m-20 font-display text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight text-zen-mist first:mt-0",
      className
    )}
  >
    {children}
  </motion.h1>
);

/**
 * Markdown H2 component with ID and gradient underline
 */
export const H2 = ({ className, children }: MarkdownHeadingProps) => {
  const text = getTextContent(children);
  const id = generateHeadingId(text);

  return (
    <motion.h2
      id={id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={cn(
        "mb-3 md:mb-4 lg:mb-6 mt-6 md:mt-8 lg:mt-12 scroll-m-20 font-display text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold leading-tight text-zen-mist border-b border-white/5 pb-2 md:pb-3 relative",
        className
      )}
    >
      {children}
      <span className="absolute left-0 bottom-0 h-px w-12 md:w-20 bg-gradient-to-r from-zen-gold/50 to-transparent" />
    </motion.h2>
  );
};

/**
 * Markdown H3 component with ID
 */
export const H3 = ({ className, children }: MarkdownHeadingProps) => {
  const text = getTextContent(children);
  const id = generateHeadingId(text);

  return (
    <motion.h3
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "mb-2 md:mb-3 lg:mb-4 mt-5 md:mt-6 lg:mt-10 scroll-m-20 font-display text-base md:text-lg lg:text-xl xl:text-2xl font-semibold leading-tight text-zen-mist",
        className
      )}
    >
      {children}
    </motion.h3>
  );
};

/**
 * Markdown H4 component with ID
 */
export const H4 = ({ className, children }: MarkdownHeadingProps) => {
  const text = getTextContent(children);
  const id = generateHeadingId(text);

  return (
    <motion.h4
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "mb-2 md:mb-3 mt-4 md:mt-6 lg:mt-8 scroll-m-20 font-display text-base md:text-lg lg:text-xl font-semibold leading-tight text-zen-mist/95",
        className
      )}
    >
      {children}
    </motion.h4>
  );
};

