"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const KEY_PREFIX = "scroll:";

/**
 * Restore scroll position per pathname using sessionStorage.
 *
 * Browsers already restore scroll on a real back/forward navigation. This is
 * for Next.js client-side route changes where the framework defaults to
 * scroll-to-top. We save on scroll/unload, restore on mount, once. No
 * setTimeout chain — if the page is still measuring (long article), the
 * browser's own restoration will take over via popstate.
 */
export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `${KEY_PREFIX}${pathname}`;

    // Restore once after the layout has had a frame to settle.
    const restore = () => {
      const stored = sessionStorage.getItem(key);
      if (!stored) return;
      const position = Number.parseInt(stored, 10);
      if (Number.isFinite(position) && position > 0) {
        window.scrollTo({ top: position, behavior: "auto" });
      }
    };
    requestAnimationFrame(restore);

    let rafId = 0;
    const save = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        sessionStorage.setItem(key, String(window.scrollY));
        rafId = 0;
      });
    };

    const onHide = () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };

    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", save);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [pathname]);

  return null;
}
