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
        serif: ["'Newsreader'", "'Playfair Display'", "Georgia", "'Times New Roman'", "serif"],
        headline: ["'Playfair Display'", "'Newsreader'", "Georgia", "serif"],
        'headline-serif': ["'Newsreader'", "Georgia", "'Times New Roman'", "serif"],
        'headline-sans': ["Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
        'headline-classic': ["'Playfair Display'", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "Menlo", "Courier New", "monospace"],
      },
      colors: {
        // Midnight Editorial Dark Theme Palette
        midnight: {
          bg: "#07111F",
          sidebar: "#081321",
          surface: "#0D1B2C",
          elevated: "#12243A",
          subtle: "#0A1624",
          border: "#20344B",
          'border-strong': "#2A435E",
          text: "#F1F5FA",
          'text-secondary': "#A4B3C7",
          'text-muted': "#6C829D",
          accent: "#526BFF",
          'accent-hover': "#697EFF",
          'accent-cyan': "#4DB8E8",
          success: "#22C55E",
          error: "#EF4444",
        },
        // Classic Broadsheet Ivory Palette
        ivory: {
          50: "#FAF9F5",
          100: "#F7F5EF", // Canvas background
          200: "#EFECE2",
          300: "#E5DFD1", // Subtle dividers
          400: "#D7CFBE",
          500: "#C4BBA7",
        },
        // Ink Charcoal Typography Palette
        charcoal: {
          950: "#141514",
          900: "#20211F", // Primary typography
          800: "#2E302D",
          700: "#444742",
          600: "#5D615B", // Secondary text
          500: "#7C8079", // Muted metadata
          400: "#9DA199",
          300: "#C2C5BE",
          200: "#E0E3DD",
        },
        // Editorial Forest Green Accent Palette
        forest: {
          50: "#F2F6F3",
          100: "#E4EDE6",
          200: "#C9DBCF",
          500: "#496653", // Primary accent
          600: "#3D5545",
          700: "#324538",
          800: "#27362C",
          900: "#1A251E",
        },
        terracotta: {
          100: "#FBECE5",
          500: "#B85D38",
          600: "#9E4C2B",
        },
      },
      screens: {
        'print': { 'raw': 'print' },
      }
    },
  },
  plugins: [],
};
export default config;
