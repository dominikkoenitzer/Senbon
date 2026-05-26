"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, MessageSquare, Github } from "lucide-react";

const navItems = [
  {
    href: "/journal",
    kicker: "01 — Journal",
    title: "Field notes",
    description:
      "Slow, written entries on building, breaking, and reassembling things.",
    icon: BookOpen,
  },
  {
    href: "/guestbook",
    kicker: "02 — Guestbook",
    title: "Leave a mark",
    description:
      "A quiet wall. Sign your name, leave a sentence, see who passed through.",
    icon: MessageSquare,
  },
];

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 md:px-10 md:py-16 lg:py-20">
        {/* Top meta row */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="flex items-center justify-between"
        >
          <span className="kicker">千本 · Senbon</span>
        </motion.header>

        {/* Hero */}
        <section className="flex flex-1 flex-col justify-center py-16 md:py-24">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease }}
            className="kicker mb-6"
          >
            A digital garden · one thousand entries
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 1, ease }}
            className="font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9rem] display-balance"
          >
            <span className="block">A journal,</span>
            <span className="mt-2 block italic text-foreground/85">
              kept slowly.
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[1.2fr_1fr] md:gap-16 lg:gap-24"
          >
            <p className="max-w-xl text-base leading-relaxed text-foreground/75 read-prose md:text-lg">
              A quiet, hand-tended space for thinking, writing, and watching
              ideas grow. No tracking, no audience, no algorithm — just{" "}
              <span className="text-foreground">words on a stone</span>.
            </p>

            <ul className="flex flex-col gap-2 text-sm text-foreground/55 md:items-end md:text-right">
              <li>
                <span className="text-foreground/40">Stack —</span> Next.js · Tailwind · 
              </li>
              <li>
                <span className="text-foreground/40">Shortcut —</span>{" "}
                <kbd className="rounded border border-foreground/15 px-1.5 py-0.5 text-[10px] tracking-widest">
                  ⌘K
                </kbd>{" "}
                to navigate
              </li>
              <li>
                <a
                  href="https://github.com/dominikkoenitzer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-foreground/70 transition-colors hover:text-primary"
                >
                  <Github className="h-3.5 w-3.5" /> dominikkoenitzer
                </a>
              </li>
            </ul>
          </motion.div>
        </section>

        {/* Nav cards */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.9, ease }}
          aria-label="Primary"
          className="grid gap-4 md:grid-cols-2 md:gap-6"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="zen-card group relative flex flex-col gap-6 overflow-hidden p-7 md:p-9 transition-transform hover:-translate-y-0.5"
              >
                {/* Glow on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at 20% 0%, rgba(230,194,129,0.12), transparent 60%)",
                  }}
                />

                <div className="relative flex items-start justify-between">
                  <span className="kicker">{item.kicker}</span>
                  <ArrowUpRight
                    className="h-4 w-4 text-foreground/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>

                <div className="relative flex flex-col gap-3">
                  <h2 className="font-display text-3xl leading-tight text-foreground md:text-4xl">
                    {item.title}
                  </h2>
                  <p className="max-w-md text-sm leading-relaxed text-foreground/65 md:text-base read-prose">
                    {item.description}
                  </p>
                </div>

                <div className="relative mt-auto flex items-center gap-3 pt-4">
                  <Icon
                    className="h-4 w-4 text-primary/70"
                    aria-hidden="true"
                  />
                  <span className="text-xs uppercase tracking-[0.25em] text-foreground/45">
                    Enter
                  </span>
                </div>
              </Link>
            );
          })}
        </motion.nav>

        {/* Bottom rule + tagline */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 flex flex-col gap-6 md:mt-24"
        >
          <div className="zen-rule" />
          <p className="text-center text-[11px] uppercase tracking-[0.4em] text-foreground/35">
            Tend the garden · 庭を整える
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
