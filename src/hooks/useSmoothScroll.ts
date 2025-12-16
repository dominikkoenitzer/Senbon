import { useCallback } from "react";

interface UseSmoothScrollOptions {
  offset?: number;
  delay?: number;
  retryDelay?: number;
}

/**
 * Hook to handle smooth scrolling to elements
 * Includes retry logic and offset support
 */
export function useSmoothScroll(options: UseSmoothScrollOptions = {}) {
  const { offset = 120, delay = 50, retryDelay = 100 } = options;

  const scrollToElement = useCallback(
    (elementId: string) => {
      const performScroll = (element: HTMLElement) => {
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });

        // Update URL hash without triggering scroll
        window.history.pushState(null, "", `#${elementId}`);
      };

      // Initial attempt after delay
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          performScroll(element);
        } else {
          // Retry after additional delay in case element isn't ready
          setTimeout(() => {
            const retryElement = document.getElementById(elementId);
            if (retryElement) {
              performScroll(retryElement);
            }
          }, retryDelay);
        }
      }, delay);
    },
    [offset, delay, retryDelay]
  );

  return scrollToElement;
}

