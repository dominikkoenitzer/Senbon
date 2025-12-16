"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MarkdownImageProps } from "./types";

/**
 * Image component with animation
 */
export const Image = ({ className, src, alt }: MarkdownImageProps) => (
  <motion.img
    src={src}
    alt={alt}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
    className={cn(
      "my-6 md:my-8 lg:my-10 rounded-lg border border-white/10 w-full backdrop-blur-sm",
      className
    )}
  />
);

