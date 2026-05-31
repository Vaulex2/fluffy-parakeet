import type { Config } from "tailwindcss";

const seigahaSvg = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F4ECD8' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["selector", "[data-theme='dark']"],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0B",
        surface: "rgba(244,236,216,0.04)",
        "surface-border": "rgba(244,236,216,0.08)",
        primary: "#E11D2A",
        text: {
          primary: "#F4ECD8",
          muted: "rgba(244,236,216,0.55)",
        },
        light: {
          bg: "#F4ECD8",
          text: "#0B0B0B",
        },
      },
      fontFamily: {
        headline: ["Anton", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        accent: ["Caveat Brush", "cursive"],
      },
      letterSpacing: {
        tighter: "-0.03em",
      },
      lineHeight: {
        none: "0.95",
        relaxed: "1.7",
      },
      backgroundImage: {
        seigaiha: seigahaSvg,
      },
    },
  },
  plugins: [],
};

export default config;
