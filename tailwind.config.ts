
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'arabic': ['Amiri', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#28717c", // islamic-teal
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#d4af37", // islamic-gold
          foreground: "#221F26",
        },
        accent: {
          DEFAULT: "#f8f7f2", // islamic-cream
          foreground: "#221F26",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        islamic: {
          teal: "#28717c",
          gold: "#d4af37",
          brightGold: "#e9c46a", // Enhanced brighter gold
          solidGreen: "#e1f5e0", // New solid green background
          lightGreen: "#f0f9ef", // Lighter green for gradients
          burgundy: "#6b2025",
          blue: "#235789",
          cream: "#f8f7f2",
          sand: "#e6dbc9",
          // Dark mode variants - enhanced for better visibility
          darkTeal: "#39a0af", // Lightened for better visibility
          darkGold: "#f0c64a", // Brightened for better contrast
          darkBrightGold: "#ffd966", // Enhanced brighter gold for dark mode
          darkGreen: "#132c12", // Darker background for better contrast
          darkBurgundy: "#9c2731", // Brightened for visibility
          darkBlue: "#4d8fd3", // Brightened for visibility
          darkCream: "#fff8e6", // Brightened for visibility
          darkBg: "#121212", // Darker background
          darkCard: "#1e1e1e", // Darker card background
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slow-pulse": {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.3" },
        },
        'title-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.95' },
          '50%': { transform: 'scale(1.02)', opacity: '1' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        "slow-pulse": "slow-pulse 8s ease-in-out infinite",
        'title-pulse': 'title-pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
