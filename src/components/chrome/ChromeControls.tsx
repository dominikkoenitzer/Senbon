"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ArrowUp, Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY, THEME_EVENT } from "@/constants/theme";

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
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Private mode or a blocked origin — the class still flipped, the
      // choice just will not survive a reload. Not worth failing over.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const toTop = useCallback(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 print:hidden">
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
