"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Restore scroll position on page load
    if (typeof window !== "undefined") {
      const savedPosition = sessionStorage.getItem(`scroll-${pathname}`);
      if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition, 10));
      }
    }
  }, [pathname]);

  useEffect(() => {
    // Save scroll position before page unload
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

    window.addEventListener("scroll", onScroll, { passive: true });
    
    // Also save on beforeunload
    window.addEventListener("beforeunload", handleScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", handleScroll);
    };
  }, [pathname]);

  return null;
}

