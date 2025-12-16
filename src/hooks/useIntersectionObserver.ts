import { useEffect, useState } from "react";

interface UseIntersectionObserverOptions {
  rootMargin?: string;
  threshold?: number | number[];
  enabled?: boolean;
}

/**
 * Hook to observe intersection of elements by ID
 * Useful for table of contents, scroll spy, etc.
 */
export function useIntersectionObserver(
  elementIds: string[],
  options: UseIntersectionObserverOptions = {}
) {
  const {
    rootMargin = "-20% 0% -35% 0%",
    threshold = 0,
    enabled = true,
  } = options;

  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!enabled || elementIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin, threshold }
    );

    const elements: Element[] = [];
    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        elements.push(element);
      }
    });

    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [elementIds, rootMargin, threshold, enabled]);

  return activeId;
}

