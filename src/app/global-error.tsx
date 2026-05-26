"use client";

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
          background: "#05080f",
          color: "#f3ede2",
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
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1rem",
            padding: "3rem",
            textAlign: "center",
            background: "rgba(9,14,23,0.85)",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: "rgba(247,216,160,0.4)",
              marginBottom: "1.5rem",
            }}
          >
            すべて崩れた
          </p>
          <h1
            style={{
              fontSize: "1.875rem",
              marginBottom: "1rem",
              color: "#f3ede2",
            }}
          >
            The garden has collapsed.
          </h1>
          <p style={{ color: "rgba(243,237,226,0.65)", marginBottom: "2rem" }}>
            A critical error occurred. Reload to begin again.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(243,237,226,0.3)",
                marginBottom: "1.5rem",
              }}
            >
              ref · {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "9999px",
              border: "1px solid rgba(247,216,160,0.3)",
              background: "rgba(247,216,160,0.05)",
              color: "rgba(247,216,160,0.85)",
              fontSize: "0.75rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
