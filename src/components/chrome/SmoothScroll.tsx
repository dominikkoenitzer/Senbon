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
      /*
       * `lerp`, not `duration`. A duration restarts a fixed easing curve on
       * every wheel event, so a real scroll — which is a burst of events —
       * keeps interrupting and relaunching itself, and reads as steppy.
       * Interpolating a constant fraction of the remaining distance each frame
       * absorbs the burst into one continuous glide instead.
       */
      lerp: 0.1,
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
   * Next already owns scroll on navigation: top for a new route, the stored
   * offset for back/forward, the element for a hash. Lenis only has to agree
   * with it.
   *
   * This used to drive the scroll itself — forcing 0 on a push and following
   * the restored value on a pop, tracked through a popstate flag. That meant
   * two things moving the same scroll during the same frames as the view
   * transition, which is exactly what made navigation feel like it lurched.
   * Following one authority is both smoother and considerably less code.
   *
   * Read back over several frames because Next does not necessarily apply the
   * offset in a single pass. Every pass is `immediate` — this is Lenis
   * adopting a value that has already been applied, never an animation.
   */
  useEffect(() => {
    const lenis = instance;
    if (!lenis) return;

    let id = 0;
    let frames = 0;
    const sync = () => {
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      frames += 1;
      if (frames < 6) id = requestAnimationFrame(sync);
    };

    id = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
};

export default SmoothScroll;
