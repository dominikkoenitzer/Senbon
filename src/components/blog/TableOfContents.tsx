"use client";

import { useMemo } from "react";
import type { TableOfContentsProps } from "@/types/blog";
import { useIntersectionObserver, useSmoothScroll } from "@/hooks";
import { TOC_CONFIG } from "@/constants/blog";
import { cn } from "@/lib/utils";

/**
 * Table of Contents component with auto-highlighting and smooth scroll
 * Supports both desktop (sticky) and mobile (inline) modes
 */
const TableOfContents = ({ items, mobile = false }: TableOfContentsProps) => {
  // Extract all IDs for intersection observer
  const elementIds = useMemo(() => items.map((item) => item.id), [items]);
  
  // Track active section
  const activeId = useIntersectionObserver(elementIds, {
    rootMargin: TOC_CONFIG.ROOT_MARGIN,
    threshold: TOC_CONFIG.THRESHOLD,
    enabled: items.length > 0,
  });

  // Smooth scroll handler
  const scrollToElement = useSmoothScroll({
    offset: TOC_CONFIG.SCROLL_OFFSET,
    delay: TOC_CONFIG.SCROLL_DELAY,
    retryDelay: TOC_CONFIG.RETRY_DELAY,
  });

  // Don't render if no items
  if (items.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    scrollToElement(id);
  };

  if (mobile) {
    return (
      <nav className="w-full">
        <div className="zen-card px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 backdrop-blur-sm bg-black/20 border-white/5 rounded-lg">
          <p className="text-[0.65rem] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.5em] text-zen-gold/40 mb-2.5 md:mb-3 font-light">
            Contents
          </p>
          <ul className="space-y-1 md:space-y-1.5">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={(e) => handleClick(e, item.id)}
                  className={cn(
                    "text-left text-xs md:text-sm transition-colors hover:text-zen-gold/80 w-full py-0.5 leading-relaxed",
                    item.level === 2 && "pl-0 text-zen-mist/70 font-medium",
                    item.level === 3 && "pl-2 md:pl-3 text-zen-mist/60 text-[0.7rem] md:text-xs",
                    item.level === 4 && "pl-4 md:pl-6 text-zen-mist/50 text-[0.65rem] md:text-xs",
                    activeId === item.id && "text-zen-gold"
                  )}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-24 self-start">
      <div className="border-l border-white/5 pl-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/40 mb-4">
          Contents
        </p>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={(e) => handleClick(e, item.id)}
                className={cn(
                  "text-left text-sm transition-colors hover:text-zen-gold/80 w-full",
                  item.level === 2 && "pl-0 text-zen-mist/70",
                  item.level === 3 && "pl-4 text-zen-mist/60 text-xs",
                  item.level === 4 && "pl-8 text-zen-mist/50 text-xs",
                  activeId === item.id && "text-zen-gold"
                )}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default TableOfContents;

