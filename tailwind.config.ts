import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#05080f",
        foreground: "#f3ede2",
        zen: {
          mist: "#f0ebe1",
          moss: "#6a8c69",
          ember: "#c38c66",
          dusk: "#1a1f2b",
          tide: "#142836",
          bloom: "#e2b3c0",
          aurora: "#8db9d6",
          gold: "#f7d8a0",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "sans-serif"],
        display: ["var(--font-heading)", "Playfair Display", "serif"],
        mono: ["var(--font-mono)", "Geist Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 60px rgba(247, 216, 160, 0.35)",
        innerGlow: "inset 0 0 35px rgba(237, 197, 125, 0.25)",
        card: "0 15px 45px rgba(7, 11, 23, 0.65)",
      },
      backgroundImage: {
        "zen-grid":
          "linear-gradient(120deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(60deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "zen-mist":
          "radial-gradient(circle at 20% 20%, rgba(243,237,226,0.15), transparent 55%), radial-gradient(circle at 80% 0%, rgba(142,185,214,0.25), transparent 45%), radial-gradient(circle at 50% 80%, rgba(226,179,192,0.18), transparent 60%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 25px rgba(247, 216, 160, 0.2)" },
          "50%": { boxShadow: "0 0 50px rgba(247, 216, 160, 0.45)" },
        },
        drift: {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(-50%, -50%, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        spark: {
          "0%": { opacity: "0", transform: "scale(0.8) translateY(0)" },
          "25%": { opacity: "1", transform: "scale(1) translateY(-8px)" },
          "100%": { opacity: "0", transform: "scale(0.9) translateY(-16px)" },
        },
      },
      animation: {
        float: "float 14s ease-in-out infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        drift: "drift 25s linear infinite",
        shimmer: "shimmer 6s ease-in-out infinite",
        spark: "spark 4s linear infinite",
      },
      borderRadius: {
        zen: "2rem",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;

