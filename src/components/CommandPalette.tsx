"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Github, Home, MessageSquare, Search } from "lucide-react";

type Action = {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon: React.ReactNode;
  perform: () => void;
};

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/i.test(navigator.platform || "");

const subscribeMounted = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;

export default function CommandPalette() {
  const router = useRouter();
  const mounted = useSyncExternalStore(
    subscribeMounted,
    getMountedSnapshot,
    getMountedServerSnapshot
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const openPalette = useCallback(() => {
    setQuery("");
    setActive(0);
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closePalette = useCallback(() => setOpen(false), []);

  const actions = useMemo<Action[]>(
    () => [
      {
        id: "home",
        label: "Go home",
        hint: "/",
        keywords: "home garden start",
        icon: <Home className="h-4 w-4" />,
        perform: () => router.push("/"),
      },
      {
        id: "journal",
        label: "Open journal",
        hint: "/journal",
        keywords: "blog notes posts entries",
        icon: <BookOpen className="h-4 w-4" />,
        perform: () => router.push("/journal"),
      },
      {
        id: "guestbook",
        label: "Sign the guestbook",
        hint: "/guestbook",
        keywords: "message comment leave",
        icon: <MessageSquare className="h-4 w-4" />,
        perform: () => router.push("/guestbook"),
      },
      {
        id: "github",
        label: "Visit GitHub",
        hint: "external",
        keywords: "code repo open source",
        icon: <Github className="h-4 w-4" />,
        perform: () =>
          window.open(
            "https://github.com/dominikkoenitzer",
            "_blank",
            "noopener,noreferrer"
          ),
      },
    ],
    [router]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) =>
      `${a.label} ${a.keywords ?? ""} ${a.hint ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [actions, query]);

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setActive(0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) closePalette();
        else openPalette();
        return;
      }
      if (e.key === "/" && !open) {
        const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        e.preventDefault();
        openPalette();
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        const a = filtered[active];
        if (a) {
          e.preventDefault();
          closePalette();
          a.perform();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active, openPalette, closePalette]);

  useEffect(() => {
    if (typeof document === "undefined" || !open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={openPalette}
        aria-label="Open command palette"
        className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-zen-mist/55 backdrop-blur-md transition-colors hover:text-zen-gold/80 hover:border-zen-gold/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-gold/60"
      >
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">{isMac ? "⌘K" : "Ctrl K"}</span>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={closePalette}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[rgba(8,12,22,0.95)] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
          <Search className="h-4 w-4 text-zen-gold/60" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={onQueryChange}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent text-sm text-zen-mist placeholder:text-zen-mist/35 outline-none"
            aria-label="Command palette search"
          />
          <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-zen-mist/50">
            esc
          </kbd>
        </div>
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-zen-mist/40">
              Nothing matches.
            </p>
          )}
          {filtered.map((a, i) => (
            <button
              key={a.id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                closePalette();
                a.perform();
              }}
              className={`relative flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                i === active
                  ? "bg-zen-gold/15 text-zen-gold"
                  : "text-zen-mist/80 hover:bg-white/[0.03]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-zen-gold transition-opacity ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              />
              <span className="flex items-center gap-3">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-md border transition-colors ${
                    i === active
                      ? "border-zen-gold/60 bg-zen-gold/15 text-zen-gold"
                      : "border-white/10 text-zen-mist/60"
                  }`}
                >
                  {a.icon}
                </span>
                <span className={i === active ? "font-medium" : ""}>
                  {a.label}
                </span>
              </span>
              {a.hint && (
                <span
                  className={`text-[10px] uppercase tracking-[0.25em] ${
                    i === active ? "text-zen-gold/70" : "text-zen-mist/35"
                  }`}
                >
                  {a.hint}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-zen-mist/35">
          <span>↑ ↓ to navigate</span>
          <span>↵ to select</span>
        </div>
      </div>
    </div>
  );
}
