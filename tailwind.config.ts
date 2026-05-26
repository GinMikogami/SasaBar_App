import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#e8c878",
          500: "#c9a84c",
          600: "#b8962e",
          700: "#9a7d22",
          800: "#7a6219",
          900: "#5a4812",
        },
        bar: {
          black: "#0a0a0a",
          dark: "#141414",
          card: "#1a1a1a",
          border: "#2a2a2a",
          muted: "#888888",
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #c9a84c 0%, #e8c878 50%, #c9a84c 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
