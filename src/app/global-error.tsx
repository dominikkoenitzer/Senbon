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
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: "rgba(180,89,58,0.5)",
              marginBottom: "1.5rem",
            }}
          >
            すべて崩れた
          </p>
          <h1
            style={{
              fontSize: "1.875rem",
              marginBottom: "1rem",
              color: "#3b2e24",
            }}
          >
            The garden has collapsed.
          </h1>
          <p style={{ color: "rgba(59,46,36,0.7)", marginBottom: "2rem" }}>
            A critical error occurred. Reload to begin again.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(59,46,36,0.4)",
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
              border: "1px solid rgba(180,89,58,0.35)",
              background: "rgba(180,89,58,0.06)",
              color: "#b4593a",
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
