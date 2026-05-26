import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0b0a08",
        foreground: "#f4ede0",
        zen: {
          mist: "#f4ede0",
          moss: "#7a9989",
          ember: "#d9a86b",
          dusk: "#1a1410",
          tide: "#2a201b",
          bloom: "#c89993",
          aurora: "#9fb3c4",
          gold: "#e6c281",
          ink: "#0b0a08",
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
