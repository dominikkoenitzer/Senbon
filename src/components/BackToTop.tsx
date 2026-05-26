"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setVisible(window.scrollY > 600);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onClick = () => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-5 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-zen-gold/25 bg-black/40 text-zen-gold/80 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:text-zen-gold hover:border-zen-gold/50 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-gold/60 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
