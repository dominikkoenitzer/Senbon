"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const KonamiPortal = ({ children }: { children: ReactNode }) => {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    let buffer: string[] = [];
    const handleKey = (event: KeyboardEvent) => {
      const normalizedKey =
        event.key.length === 1 ? event.key.toLowerCase() : event.key;
      buffer = [...buffer, normalizedKey].slice(-KONAMI_SEQUENCE.length);

      if (buffer.length === KONAMI_SEQUENCE.length) {
        const matched = buffer.every(
          (key, index) => key === KONAMI_SEQUENCE[index],
        );

        if (matched) {
          setUnlocked(true);
          buffer = [];
        }
      }

      if (event.key === "Escape") {
        setUnlocked(false);
        buffer = [];
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {children}
      <AnimatePresence>
        {unlocked ? (
          <motion.div
            key="konami-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-zen-dusk/95 to-black/95 text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="zen-card relative flex max-w-2xl flex-col items-center gap-6 px-10 py-12 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-zen-moss/10 to-transparent blur-3xl" />
              <p className="text-sm uppercase tracking-[0.3em] text-zen-gold">
                Konami Drift Unlocked
              </p>
              <h2 className="font-display text-4xl leading-tight">
                Celestial Conservatory
              </h2>
              <p className="text-base text-zen-mist/80">
                A hidden path unlocked. Follow it to explore constellation notes
                and experimental features for Senbon.
              </p>
              <div className="zen-divider" />
              <Link
                href="/constellation/senbon-grove"
                className="inline-flex items-center gap-2 rounded-full border border-zen-gold/40 px-6 py-3 font-medium text-zen-gold transition hover:bg-zen-gold/10"
                onClick={() => setUnlocked(false)}
              >
                Enter the Conservatory
                <span aria-hidden="true">↗</span>
              </Link>
              <button
                type="button"
                className="text-sm text-zen-mist/60 underline-offset-4 hover:text-zen-mist/90"
                onClick={() => setUnlocked(false)}
              >
                maybe later
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default KonamiPortal;

