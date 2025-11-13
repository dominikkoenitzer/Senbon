"use client";

import { motion } from "framer-motion";
import ConstellationBackground from "@/components/home/ConstellationBackground";
import ConstellationNode from "@/components/home/ConstellationNode";
import { BookOpen, MessageSquare } from "lucide-react";

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ConstellationBackground />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Section - Asymmetric Layout */}
        <div className="flex-1 flex items-start pt-16 md:pt-24 pb-8">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
            <motion.div
              className="space-y-6 max-w-4xl"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.p
                className="text-xs uppercase tracking-[0.6em] text-zen-gold/35"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                senbon (千本) — "a thousand"
              </motion.p>
              
              <motion.h1
                className="font-display text-5xl leading-[1.05] md:text-6xl lg:text-7xl xl:text-8xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                A zen garden journal
              </motion.h1>
              
              <motion.p
                className="text-base md:text-lg leading-relaxed text-zen-mist/45 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.9 }}
              >
                Built with Next.js 16, Tailwind, shadcn/ui, and Neon PostgreSQL.
                A clean, minimal space for thoughts, notes, and guest messages.
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* Center Section - Constellation Nodes with better positioning */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 max-w-7xl mx-auto px-6 md:px-12">
            <div className="relative w-full h-full">
              <ConstellationNode
                href="/journal"
                title="Journal"
                description="Thoughts, notes, and entries"
                position={{ x: "8%", y: "40%" }}
                delay={1.3}
                icon={<BookOpen className="w-7 h-7" />}
              />
              <ConstellationNode
                href="/guestbook"
                title="Guestbook"
                description="Leave a message"
                position={{ x: "82%", y: "5%" }}
                delay={1.5}
                icon={<MessageSquare className="w-7 h-7" />}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section - Minimal footer */}
        <div className="pb-8 md:pb-12">
          <motion.div
            className="max-w-7xl mx-auto px-6 md:px-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
          >
            <p className="text-xs text-zen-mist/15 uppercase tracking-[0.4em] text-center">
              Navigate the constellation
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
