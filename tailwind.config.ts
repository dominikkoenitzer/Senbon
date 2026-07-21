import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Kept in step with the CSS custom properties in globals.css. Prefer
        // the semantic tokens (bg-background, text-primary) in components —
        // these named shades exist for the few places a specific pigment is
        // the point.
        background: "#fbf5ec",
        foreground: "#3b2e24",
        zen: {
          mist: "#fbf5ec",
          moss: "#7e9a7c",
          ember: "#d9a05a",
          dusk: "#3b2e24",
          tide: "#574335",
          bloom: "#d3937f",
          clay: "#a54d30",
          gold: "#c9873c",
          ink: "#3b2e24",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "sans-serif"],
        display: ["var(--font-heading)", "Playfair Display", "serif"],
        mono: ["var(--font-mono)", "Geist Mono", "monospace"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        drift: {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(2%, -2%, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        float: "float 14s ease-in-out infinite",
        drift: "drift 38s ease-in-out infinite alternate",
        shimmer: "shimmer 6s ease-in-out infinite",
      },
      borderRadius: {
        zen: "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
