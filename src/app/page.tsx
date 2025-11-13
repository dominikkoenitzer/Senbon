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
        <div className="flex-1 flex items-start pt-12 pb-6 md:pt-24 md:pb-8">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-12">
            <motion.div
              className="space-y-4 md:space-y-6 max-w-4xl"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.p
                className="text-[10px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.6em] text-zen-gold/35"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                senbon (千本) — "a thousand"
              </motion.p>
              
              <motion.h1
                className="font-display text-4xl leading-[1.1] md:text-6xl lg:text-7xl xl:text-8xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                A zen garden journal
              </motion.h1>
              
              <motion.p
                className="text-sm md:text-base lg:text-lg leading-relaxed text-zen-mist/45 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.9 }}
              >
                Built with Next.js 16, Tailwind, shadcn/ui, and Neon PostgreSQL.
                A clean, minimal space for thoughts, notes, and guest messages.{" "}
                <a
                  href="https://github.com/dominikkoenitzer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zen-gold/70 hover:text-zen-gold transition-colors underline underline-offset-4"
                >
                  Follow me on GitHub
                </a>
                .
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* Center Section - Constellation Nodes with mobile-friendly positioning */}
        <div className="flex-1 relative min-h-[400px] md:min-h-[500px]">
          <div className="absolute inset-0 max-w-7xl mx-auto px-4 md:px-12">
            <div className="relative w-full h-full">
              {/* Mobile: Stack nodes vertically, Desktop: Use absolute positioning */}
              <div className="md:hidden flex flex-col items-center gap-12 pt-8">
                <ConstellationNode
                  href="/guestbook"
                  title="Guestbook"
                  description="Leave a message"
                  position={{ x: "50%", y: "0%" }}
                  delay={1.3}
                  icon={<MessageSquare className="w-7 h-7" />}
                  mobile
                />
                <ConstellationNode
                  href="/journal"
                  title="Journal"
                  description="Thoughts, notes, and entries"
                  position={{ x: "50%", y: "0%" }}
                  delay={1.5}
                  icon={<BookOpen className="w-7 h-7" />}
                  mobile
                />
              </div>
              
              {/* Desktop: Absolute positioning */}
              <div className="hidden md:block relative w-full h-full">
                <ConstellationNode
                  href="/journal"
                  title="Journal"
                  description="Thoughts, notes, and entries"
                  position={{ x: "8%", y: "10%" }}
                  delay={1.3}
                  icon={<BookOpen className="w-7 h-7" />}
                />
                <ConstellationNode
                  href="/guestbook"
                  title="Guestbook"
                  description="Leave a message"
                  position={{ x: "82%", y: "-30%" }}
                  delay={1.5}
                  icon={<MessageSquare className="w-7 h-7" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Minimal footer */}
        <div className="pb-6 md:pb-12">
          <motion.div
            className="max-w-7xl mx-auto px-4 md:px-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
          >
            <p className="text-[10px] md:text-xs text-zen-mist/15 uppercase tracking-[0.3em] md:tracking-[0.4em] text-center">
              Navigate the constellation
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
