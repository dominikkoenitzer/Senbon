"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
// Ships with the package, so it cannot drift out of sync with the version in
// use the way a hand-copied block in globals.css would.
import "lenis/dist/lenis.css";

/*
 * Lenis runs the page scroll instead of the browser. It is deliberately gentle:
 * a long, heavy glide is the thing that makes smooth-scroll libraries feel like
 * a gimmick and makes people fight the page to read it.
 *
 * Held in a module-level ref rather than context — one instance exists for the
 * app's lifetime, and the only other consumer (the back-to-top button) wants to
 * ask for it imperatively inside an event handler, not subscribe to it.
 */
let instance: Lenis | null = null;

export const getLenis = () => instance;

const SmoothScroll = () => {
  const pathname = usePathname();

  useEffect(() => {
    /*
     * Reduced motion gets the native scroll, untouched. Smooth-scrolling is
     * precisely the animation these users switched off, and Lenis has no
     * "respect the OS" mode of its own.
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // ~1s to settle. Long enough to read as weight, short enough that a
      // deliberate scroll still lands where you meant it to.
      duration: 1.0,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      // Touch devices already have momentum scrolling in the OS. Doubling it up
      // feels laggy and breaks the platform's own overscroll behaviour.
      smoothWheel: true,
      syncTouch: false,
    });

    instance = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      instance = null;
    };
  }, []);

  /*
   * Next resets scroll on navigation by calling window.scrollTo. Lenis holds
   * its own idea of the current offset, so without this it animates back down
   * from the previous page's position after the new one has already rendered.
   * `immediate` makes the reset a jump, not a glide.
   */
  useEffect(() => {
    if (window.location.hash) return;
    instance?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
};

export default SmoothScroll;
