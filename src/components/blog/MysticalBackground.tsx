"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MysticalBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Deterministic positions based on index to avoid hydration mismatch
  const getParticlePosition = (index: number) => {
    const seed = index * 137.508; // Golden angle approximation
    return {
      left: ((seed * 100) % 100),
      top: ((seed * 200) % 100),
    };
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Flowing gradient orbs */}
      {Array.from({ length: 6 }).map((_, i) => {
        const positions = [
          [20, 30, 50],
          [60, 40, 80],
          [30, 70, 20],
          [80, 20, 60],
          [40, 60, 30],
          [70, 50, 90],
        ];
        return (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              background: `radial-gradient(circle, rgba(247, 216, 160, ${0.3 - i * 0.05}) 0%, transparent 70%)`,
            }}
            animate={{
              x: positions[i].map(p => `${p}%`),
              y: positions[(i + 3) % 6].map(p => `${p}%`),
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        );
      })}

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => {
        const pos = getParticlePosition(i);
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute h-1 w-1 rounded-full bg-zen-gold/30"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            }}
            animate={{
              y: [`${pos.top}%`, `${(pos.top + 30) % 100}%`],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 8 + (i % 4),
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Flowing mist effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zen-gold/5 to-transparent opacity-30" />
    </div>
  );
};

export default MysticalBackground;
