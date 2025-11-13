"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

type Props = {
  href: string;
  title: string;
  description: string;
  position: { x: string; y: string };
  delay: number;
  icon?: React.ReactNode;
  mobile?: boolean;
};

const ConstellationNode = ({ href, title, description, position, delay, icon, mobile = false }: Props) => {
  return (
    <motion.div
      className={mobile ? "relative" : "absolute"}
      style={mobile ? {} : { left: position.x, top: position.y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={href} className="group block">
        <motion.div
          className="relative"
          whileHover={{ scale: mobile ? 1.05 : 1.15 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {/* Outer glow rings */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-full h-full rounded-full border border-zen-gold/20" />
          </motion.div>
          
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <div className="w-full h-full rounded-full border border-zen-gold/15" />
          </motion.div>

          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-full bg-zen-gold/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Star core */}
          <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-zen-gold/40 bg-zen-gold/5 group-hover:border-zen-gold/60 group-hover:bg-zen-gold/10 transition-all duration-500" />
            <div className="relative z-10 text-zen-gold/80 group-hover:text-zen-gold transition-colors">
              {icon || <Sparkles className="w-6 h-6 md:w-7 md:h-7" />}
            </div>
          </div>

          {/* Connection line - hidden on mobile */}
          {!mobile && (
            <motion.div
              className="absolute top-1/2 left-full w-32 h-px origin-left hidden md:block"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: delay + 0.8, duration: 1.2, ease: "easeOut" }}
            >
              <div className="h-full bg-gradient-to-r from-zen-gold/30 via-zen-gold/10 to-transparent" />
            </motion.div>
          )}

          {/* Label */}
          <motion.div
            className={mobile 
              ? "mt-4 text-center" 
              : "absolute left-36 top-1/2 -translate-y-1/2 whitespace-nowrap hidden md:block"
            }
            initial={{ opacity: 0, x: mobile ? 0 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 1, duration: 0.8 }}
          >
            <div className={`space-y-2 ${mobile ? '' : 'group-hover:translate-x-2 transition-transform duration-300'}`}>
              <div className={`flex items-center gap-2 ${mobile ? 'justify-center' : ''}`}>
                <p className="font-display text-lg md:text-xl text-zen-mist group-hover:text-zen-gold transition-colors">
                  {title}
                </p>
                {!mobile && (
                  <ArrowRight className="w-4 h-4 text-zen-gold/40 group-hover:text-zen-gold group-hover:translate-x-1 transition-all" />
                )}
              </div>
              <p className={`text-xs text-zen-mist/40 ${mobile ? 'max-w-none' : 'max-w-[220px]'}`}>
                {description}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default ConstellationNode;
