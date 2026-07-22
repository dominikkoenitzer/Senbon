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

/*
 * Set by the popstate listener and read by the scroll effect below. It has to
 * be module-level rather than a ref: popstate fires before React re-renders
 * for the new route, so the flag is written in one commit and read in the next.
 */
let cameFromHistory = false;

export const getLenis = () => instance;

const SmoothScroll = () => {
  const pathname = usePathname();

  /*
   * `popstate` covers the browser's back/forward buttons, the mouse's side
   * buttons, the trackpad swipe and Alt+Arrow — they all arrive here, which is
   * why this is the right signal rather than trying to intercept clicks.
   */
  useEffect(() => {
    const onPopState = () => {
      cameFromHistory = true;
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
   *
   * Back and forward are the exception. Those are the one case where the user
   * has a position they expect to return to, and Next restores it for us — so
   * forcing 0 here is what makes the mouse's back button feel like being thrown
   * to the top of a page you were already reading. On a history navigation we
   * follow the restored offset instead of overriding it.
   */
  useEffect(() => {
    const lenis = instance;
    if (!lenis) return;

    if (cameFromHistory) {
      cameFromHistory = false;

      /*
       * Next restores the offset after this effect runs, and not necessarily
       * in one go, so read it back over a few frames rather than once. Each
       * pass is `immediate` — this is Lenis catching up to a value that has
       * already been applied, not an animation of its own.
       */
      let id = 0;
      let frames = 0;
      const sync = () => {
        lenis.scrollTo(window.scrollY, { immediate: true, force: true });
        frames += 1;
        if (frames < 3) id = requestAnimationFrame(sync);
      };
      id = requestAnimationFrame(sync);
      return () => cancelAnimationFrame(id);
    }

    if (window.location.hash) return;
    lenis.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
};

export default SmoothScroll;
