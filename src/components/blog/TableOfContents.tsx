"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";
import { cn } from "@/lib/utils";

type Props = {
  items: TocItem[];
};

const TableOfContents = ({ items }: Props) => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -35% 0%",
        threshold: 0,
      }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [items]);

  if (items.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    // Wait a bit for any animations to complete
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 120; // Account for sticky header
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });
        
        // Also update URL hash without triggering scroll
        window.history.pushState(null, "", `#${id}`);
      } else {
        // Fallback: try again after a short delay in case element isn't ready
        setTimeout(() => {
          const retryElement = document.getElementById(id);
          if (retryElement) {
            const offset = 120;
            const elementPosition = retryElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: "smooth",
            });
            window.history.pushState(null, "", `#${id}`);
          }
        }, 100);
      }
    }, 50);
  };

  return (
    <nav className="sticky top-24 self-start">
      <div className="border-l border-white/5 pl-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.5em] text-zen-gold/40 mb-4">
          Contents
        </p>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={(e) => handleClick(e, item.id)}
                className={cn(
                  "text-left text-sm transition-colors hover:text-zen-gold/80 w-full",
                  item.level === 2 && "pl-0 text-zen-mist/70",
                  item.level === 3 && "pl-4 text-zen-mist/60 text-xs",
                  item.level === 4 && "pl-8 text-zen-mist/50 text-xs",
                  activeId === item.id && "text-zen-gold"
                )}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default TableOfContents;

