"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { ArrowUp, Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY, THEME_EVENT } from "@/constants/theme";
import { getLenis } from "./SmoothScroll";

/*
 * Both controls read live browser state, so both are `useSyncExternalStore`
 * rather than `useEffect` + `setState`. React 19's set-state-in-effect rule
 * rejects the effect version, and the store form is SSR-safe by construction:
 * the server snapshot is what the markup renders, and the client corrects it
 * before paint without a hydration mismatch.
 */

const subscribeTheme = (onChange: () => void) => {
  window.addEventListener(THEME_EVENT, onChange);
  // `storage` fires in *other* tabs, which keeps two open tabs in agreement.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const getThemeSnapshot = () =>
  document.documentElement.classList.contains("dark");

/* The inline script in <head> has already set the class by the time this
 * mounts, so light is only ever the pre-hydration guess. */
const getThemeServerSnapshot = () => false;

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
  const isDark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    getScrolledSnapshot,
    getScrolledServerSnapshot,
  );

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;

    const apply = () => {
      const next = !root.classList.contains("dark");
      root.classList.toggle("dark", next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
      } catch {
        // Private mode or a blocked origin — the class still flipped, the
        // choice just will not survive a reload. Not worth failing over.
      }
      window.dispatchEvent(new Event(THEME_EVENT));
    };

    /*
     * Swapping every colour on the page in one frame is a flash. Running it
     * through a view transition dissolves between the two palettes instead —
     * the same machinery the routes use, pointed at a paint change.
     *
     * `theme-switching` swaps the route animation for a plain crossfade: no
     * upward drift, and the atmosphere fades rather than holding still, since
     * here it is the thing that changed.
     */
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !document.startViewTransition) {
      apply();
      return;
    }

    root.classList.add("theme-switching");
    const transition = document.startViewTransition(apply);
    transition.finished.finally(() => root.classList.remove("theme-switching"));
  }, []);

  /*
   * The OS preference is the default, and it stays the default: with no stored
   * choice, flipping the system theme flips the site live rather than only on
   * the next reload. An explicit choice from the toggle wins and is never
   * overridden here.
   */
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(THEME_STORAGE_KEY);
      } catch {
        // Unreadable storage means no explicit choice we can honour; following
        // the system is the right fallback.
      }
      if (stored !== null) return;
      document.documentElement.classList.toggle("dark", query.matches);
      window.dispatchEvent(new Event(THEME_EVENT));
    };

    query.addEventListener("change", onSystemChange);
    return () => query.removeEventListener("change", onSystemChange);
  }, []);

  /* `d` toggles the theme. Bare key, so it has to stay out of the way of
   * anyone actually typing — the guestbook form is a text field on a page that
   * this listener also covers. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "d" && event.key !== "D") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      // IME composition sends real keydowns mid-word.
      if (event.isComposing) return;

      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      event.preventDefault();
      toggleTheme();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleTheme]);

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

  return (
    <div className="chrome-controls fixed bottom-6 right-6 z-50 flex flex-col gap-3 print:hidden">
      {scrolled && (
        <button
          type="button"
          onClick={toTop}
          aria-label="Back to top"
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground/80 shadow-[var(--shadow-soft)] transition-colors duration-200 hover:border-primary/40 hover:text-primary motion-reduce:transition-none"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        aria-keyshortcuts="d"
        title={isDark ? "light mode (d)" : "dark mode (d)"}
        className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground/80 shadow-[var(--shadow-soft)] transition-colors duration-200 hover:border-primary/40 hover:text-primary motion-reduce:transition-none"
      >
        {isDark ? (
          <Sun className="size-4" aria-hidden="true" />
        ) : (
          <Moon className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

export default ChromeControls;
