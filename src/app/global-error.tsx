"use client";

/**
 * The root boundary re-declares <html>/<body>, so it may render before (or
 * without) the stylesheet. Every value here is inlined as a literal on purpose —
 * this is the one file where the semantic-token rule cannot apply, because a
 * Tailwind class that never loads leaves an unreadable page.
 *
 * It also has to be the last exit: `reset()` only re-renders the tree, so there
 * is always a plain <a> to the home page beside it in case that is not enough.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#fbf5ec",
          color: "#3b2e24",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "32rem",
            border: "1px solid rgba(140,100,70,0.14)",
            borderRadius: "1rem",
            padding: "3rem",
            textAlign: "center",
            background: "#fffdf9",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#b4593a",
              marginBottom: "1.5rem",
            }}
          >
            error — all of it
          </p>
          <h1
            style={{
              fontSize: "1.875rem",
              marginBottom: "1rem",
              color: "#3b2e24",
            }}
          >
            well. the whole site fell over.
          </h1>
          <p
            style={{
              color: "rgba(59,46,36,0.85)",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            not one page — everything, at once, in front of you specifically.
            hit try again. if that does nothing, take the home link next to it,
            and if that does nothing either, close the tab and come back in ten
            minutes — this one is entirely my fault and i am already annoyed
            about it.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(59,46,36,0.78)",
                marginBottom: "1.5rem",
              }}
            >
              ref · {error.digest}
            </p>
          )}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "9999px",
                border: "1px solid rgba(180,89,58,0.35)",
                background: "rgba(180,89,58,0.06)",
                color: "#b4593a",
                fontSize: "0.75rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a
                hard navigation is the point: the root layout itself threw, so
                client-side routing is exactly the thing that may not recover. */}
            <a
              href="/"
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "9999px",
                border: "1px solid rgba(140,100,70,0.24)",
                color: "rgba(59,46,36,0.85)",
                fontSize: "0.75rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
