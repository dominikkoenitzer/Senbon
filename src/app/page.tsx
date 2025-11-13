"use client";

import { motion } from "framer-motion";
import LogoGlyph from "@/components/home/LogoGlyph";
import ConstellationBackground from "@/components/home/ConstellationBackground";
import ConstellationNode from "@/components/home/ConstellationNode";
import { BookOpen, MessageSquare } from "lucide-react";

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ConstellationBackground />
      
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-24">
        {/* Main Content */}
        <motion.div
          className="flex flex-col items-center gap-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Title Section */}
          <div className="space-y-8">
            <motion.p
              className="text-xs uppercase tracking-[0.6em] text-zen-gold/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
            >
              senbon (千本) — "a thousand"
            </motion.p>
            
            <motion.h1
              className="font-display text-6xl leading-[1.1] md:text-7xl lg:text-8xl xl:text-9xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              A zen garden journal
            </motion.h1>
            
            <motion.p
              className="max-w-2xl mx-auto text-lg leading-relaxed text-zen-mist/55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 1 }}
            >
              Built with Next.js 16, Tailwind, shadcn/ui, and Neon PostgreSQL.
              A clean, minimal space for thoughts, notes, and guest messages.
            </motion.p>
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 1.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <LogoGlyph />
          </motion.div>

          {/* Constellation Nodes */}
          <div className="relative w-full max-w-5xl h-[600px] mt-8">
            <ConstellationNode
              href="/journal"
              title="Journal"
              description="Thoughts, notes, and entries"
              position={{ x: "15%", y: "25%" }}
              delay={1.4}
              icon={<BookOpen className="w-7 h-7" />}
            />
            <ConstellationNode
              href="/guestbook"
              title="Guestbook"
              description="Leave a message"
              position={{ x: "75%", y: "65%" }}
              delay={1.6}
              icon={<MessageSquare className="w-7 h-7" />}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
