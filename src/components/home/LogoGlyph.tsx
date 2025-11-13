"use client";

import { motion } from "framer-motion";

const LogoGlyph = () => {
  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-zen-gold/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Main container */}
      <div className="relative flex flex-col items-start rounded-2xl border-2 border-zen-gold/20 bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-sm px-8 py-6 shadow-[0_0_40px_rgba(247,216,160,0.1)]">
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-zen-gold/30 rounded-tl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-zen-gold/30 rounded-br-2xl" />
        
        {/* Domain */}
        <motion.div
          className="mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.7em] text-zen-gold/70 font-medium">
            senbon.ch
          </span>
        </motion.div>
        
        {/* Japanese characters */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-display text-5xl md:text-6xl leading-none text-zen-gold block relative">
            <span className="relative z-10">千本</span>
            {/* Subtle text shadow/glow */}
            <span className="absolute inset-0 text-zen-gold/20 blur-sm">千本</span>
          </span>
        </motion.div>
        
        {/* Decorative line */}
        <motion.div
          className="mt-4 h-px w-16 bg-gradient-to-r from-zen-gold/40 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

export default LogoGlyph;
