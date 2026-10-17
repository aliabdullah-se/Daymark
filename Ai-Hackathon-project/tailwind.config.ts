import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "Cambria", "'Times New Roman'", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "Menlo", "Courier New", "monospace"],
        headline: ["'Cinzel'", "'Playfair Display'", "Georgia", "serif"],
      },
      colors: {
        paper: {
          50: "#FCFBF7",
          100: "#F7F4EB",
          200: "#EFEADB",
          300: "#E5DEC9",
          800: "#24211D",
          900: "#181614",
          950: "#0F0E0C",
        },
        ink: {
          900: "#121212",
          800: "#242526",
          700: "#383A3C",
          600: "#525559",
          500: "#71767C",
          400: "#9DA3A9",
          300: "#CBD0D6",
          200: "#E2E5E9",
          100: "#F1F3F5",
        },
        editorial: {
          crimson: "#8B1E1E",
          navy: "#1B365D",
          amber: "#B45309",
          olive: "#3D5A40",
          gold: "#D97706",
        }
      },
      screens: {
        'print': { 'raw': 'print' },
      }
    },
  },
  plugins: [],
};
export default config;
