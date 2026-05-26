import { useCallback } from "react";

interface UseSmoothScrollOptions {
  /** Pixels of breathing room above the target (for sticky headers). */
  offset?: number;
}

/**
 * Smooth-scroll to a DOM element by id, with an optional offset.
 * Respects `prefers-reduced-motion`. Updates the URL hash without re-jumping.
 */
export function useSmoothScroll(options: UseSmoothScrollOptions = {}) {
  const { offset = 120 } = options;

  return useCallback(
    (elementId: string) => {
      const element = document.getElementById(elementId);
      if (!element) return;

      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      const reduce =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: reduce ? "auto" : "smooth",
      });

      // Update the URL without triggering another scroll.
      if (window.location.hash !== `#${elementId}`) {
        history.replaceState(null, "", `#${elementId}`);
      }
    },
    [offset]
  );
}
