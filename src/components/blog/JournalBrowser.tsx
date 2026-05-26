"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { JournalPost } from "@/types/blog";
import BlogCard from "./BlogCard";
import PostGrid from "./PostGrid";

type Props = {
  posts: JournalPost[];
};

const PAGE_SIZE = 9;

const JournalBrowser = ({ posts }: Props) => {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Featured posts are surfaced at the top only when no filter/search is active
  // and the frontmatter `featured: true` is set. Capped at 2 so the page stays
  // editorial, not a stack of "look at me" cards.
  const featured = useMemo(
    () => posts.filter((p) => p.featured).slice(0, 2),
    [posts]
  );
  const featuredSlugs = useMemo(
    () => new Set(featured.map((p) => p.slug)),
    [featured]
  );

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (activeTag && !post.tags.includes(activeTag)) return false;
      if (!q) return true;
      const haystack = [post.title, post.excerpt, post.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query, activeTag]);

  const hasFilter = Boolean(activeTag) || query.length > 0;

  // When filtering, show all matches (no pagination). When not, paginate the
  // remainder so the initial page stays light even as the journal grows.
  const restAll = useMemo(
    () => filtered.filter((p) => !featuredSlugs.has(p.slug)),
    [filtered, featuredSlugs]
  );
  const rest = hasFilter ? restAll : restAll.slice(0, visible);
  const hasMore = !hasFilter && visible < restAll.length;

  return (
    <section className="flex flex-col gap-12 md:gap-16">
      {/* Filter bar */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-white/10 pb-2">
          <Search className="h-4 w-4 text-foreground/40" aria-hidden="true" />
          <label htmlFor="journal-search" className="sr-only">
            Search journal entries
          </label>
          <input
            id="journal-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the garden…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/35"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-foreground/40 transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {tagCounts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                activeTag === null
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-foreground/10 text-foreground/55 hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              All
            </button>
            {tagCounts.map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setActiveTag((current) => (current === tag ? null : tag))
                }
                className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                  activeTag === tag
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-foreground/10 text-foreground/55 hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {tag} <span className="text-foreground/35">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Featured (only when no filter) */}
      {!hasFilter && featured.length > 0 && (
        <div className="flex flex-col gap-5">
          <p className="kicker">Featured</p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {featured.map((post, i) => (
              <BlogCard key={post.slug} post={post} index={i} featured />
            ))}
          </div>
        </div>
      )}

      {/* Result count when filtering */}
      {hasFilter && (
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/45">
          {filtered.length === 0
            ? "No entries match"
            : `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"}`}
        </p>
      )}

      {/* Rest of the grid */}
      {rest.length === 0 && hasFilter ? (
        <div className="zen-card flex flex-col items-center gap-3 px-8 py-16 text-center">
          <p className="kicker">No match</p>
          <p className="text-sm text-foreground/65">
            Try a different search or clear the filter.
          </p>
        </div>
      ) : rest.length > 0 ? (
        <div className="flex flex-col gap-8">
          {!hasFilter && featured.length > 0 && (
            <div className="flex items-center gap-4">
              <p className="kicker">All entries</p>
              <span className="h-px flex-1 bg-foreground/10" aria-hidden="true" />
            </div>
          )}
          <PostGrid posts={rest} />
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="rounded-full border border-foreground/15 px-6 py-2.5 text-xs uppercase tracking-[0.3em] text-foreground/70 transition-colors hover:border-primary/40 hover:text-primary"
              >
                Show {Math.min(PAGE_SIZE, restAll.length - visible)} more
              </button>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
};

export default JournalBrowser;
