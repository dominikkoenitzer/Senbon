"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ArrowUp } from "lucide-react";
import { getLenis } from "./SmoothScroll";

/*
 * The control reads live browser state, so it is `useSyncExternalStore` rather
 * than `useEffect` + `setState`. React 19's set-state-in-effect rule rejects
 * the effect version, and the store form is SSR-safe by construction: the
 * server snapshot is what the markup renders, and the client corrects it
 * before paint without a hydration mismatch.
 */

const subscribeScroll = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange, { passive: true });
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
};

const getScrolledSnapshot = () => window.scrollY > 600;
const getScrolledServerSnapshot = () => false;

const ChromeControls = () => {
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    getScrolledSnapshot,
    getScrolledServerSnapshot,
  );

  const toTop = useCallback(() => {
    /*
     * Lenis owns the scroll position while it is running, so a native
     * `window.scrollTo` gets fought back down mid-flight. When it is absent —
     * reduced motion, or before it has initialised — native is correct.
     */
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, []);

  if (!scrolled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 print:hidden">
      <button
        type="button"
        onClick={toTop}
        aria-label="Back to top"
        className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground/80 shadow-[var(--shadow-soft)] transition-colors duration-200 hover:border-primary/40 hover:text-primary motion-reduce:transition-none"
      >
        <ArrowUp className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default ChromeControls;
