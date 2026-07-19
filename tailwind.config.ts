import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          2: "rgb(var(--surface-2) / <alpha-value>)",
        },
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
        },
        res: {
          DEFAULT: "rgb(var(--res) / <alpha-value>)",
          soft: "rgb(var(--res-soft) / <alpha-value>)",
        },
        sus: {
          DEFAULT: "rgb(var(--sus) / <alpha-value>)",
          soft: "rgb(var(--sus-soft) / <alpha-value>)",
        },
        atu: {
          DEFAULT: "rgb(var(--atu) / <alpha-value>)",
          soft: "rgb(var(--atu-soft) / <alpha-value>)",
        },
        "base-a": "rgb(var(--base-a) / <alpha-value>)",
        "base-t": "rgb(var(--base-t) / <alpha-value>)",
        "base-c": "rgb(var(--base-c) / <alpha-value>)",
        "base-g": "rgb(var(--base-g) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "helix-spin": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out forwards",
        "helix-spin": "helix-spin 18s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
