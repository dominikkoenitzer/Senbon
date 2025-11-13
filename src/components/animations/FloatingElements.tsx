"use client";

import { motion } from "framer-motion";
import { useState, useEffect, type CSSProperties } from "react";

type Floater = {
  size: number;
  duration: number;
  delay: number;
  top: string;
  left: string;
  colors: [string, string];
  blur?: number;
};

const FLOATERS: Floater[] = [
  {
    size: 320,
    duration: 28,
    delay: 0,
    top: "5%",
    left: "10%",
    colors: ["rgba(247, 216, 160, 0.15)", "rgba(226, 179, 192, 0.08)"],
  },
  {
    size: 260,
    duration: 32,
    delay: 4,
    top: "60%",
    left: "65%",
    colors: ["rgba(142, 185, 214, 0.18)", "rgba(10, 27, 43, 0.01)"],
    blur: 12,
  },
  {
    size: 180,
    duration: 20,
    delay: 1,
    top: "35%",
    left: "78%",
    colors: ["rgba(226, 179, 192, 0.18)", "rgba(247, 216, 160, 0.05)"],
  },
];

const FloatingElements = () => {
  const [petals, setPetals] = useState<Array<{
    id: number;
    style: CSSProperties;
  }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPetals(
      Array.from({ length: 18 }, (_, idx) => ({
        id: idx,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
          "--float": `${Math.random() * 8}s`,
        } as CSSProperties,
      })),
    );
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[1]">
        {FLOATERS.map((floater, idx) => (
          <motion.div
            key={`floater-${idx}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: floater.size,
              height: floater.size,
              top: floater.top,
              left: floater.left,
              background: `radial-gradient(circle at 30% 30%, ${floater.colors[0]}, ${floater.colors[1]})`,
              filter: floater.blur ? `blur(${floater.blur}px)` : undefined,
            }}
            animate={{
              y: ["0%", "-8%", "0%"],
              x: ["0%", "4%", "0%"],
            }}
            transition={{
              duration: floater.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: floater.delay,
            }}
          />
        ))}
      </div>
      {mounted && (
        <div className="pointer-events-none fixed inset-0 z-[2]">
          {petals.map((petal) => (
            <span
              key={petal.id}
              className="petal"
              style={petal.style}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </>
  );
};

export default FloatingElements;

