"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Save scroll position continuously
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`scroll-${pathname}`, window.scrollY.toString());
      }
    };

    // Throttle scroll events
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Save on page visibility change and before unload
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleScroll();
      }
    };

    const handleBeforeUnload = () => {
      handleScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, [pathname]);

  useEffect(() => {
    // Restore scroll position after content loads
    const restoreScroll = () => {
      if (typeof window !== "undefined") {
        const savedPosition = sessionStorage.getItem(`scroll-${pathname}`);
        if (savedPosition) {
          const position = parseInt(savedPosition, 10);
          if (position > 0) {
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
              window.scrollTo({
                top: position,
                behavior: "auto" as ScrollBehavior,
              });
            });
          }
        }
      }
    };

    // Restore immediately
    restoreScroll();
    
    // Also restore after a short delay and when page fully loads
    const timeout1 = setTimeout(restoreScroll, 0);
    const timeout2 = setTimeout(restoreScroll, 100);
    const timeout3 = setTimeout(restoreScroll, 300);
    
    if (document.readyState === "complete") {
      restoreScroll();
    } else {
      window.addEventListener("load", restoreScroll, { once: true });
    }

    // Also restore when DOM content is loaded
    if (document.readyState === "interactive" || document.readyState === "complete") {
      restoreScroll();
    } else {
      document.addEventListener("DOMContentLoaded", restoreScroll, { once: true });
    }

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      window.removeEventListener("load", restoreScroll);
      document.removeEventListener("DOMContentLoaded", restoreScroll);
    };
  }, [pathname]);

  return null;
}

