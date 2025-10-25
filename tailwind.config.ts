import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // All Wondrous Brand Colors (Updated 2024)
        wondrous: {
          // Primary magenta palette
          magenta: "#A71075",           // Vivid Magenta (primary brand color)
          "magenta-alt": "#AB1D79",     // Magenta variation
          // Blue palette
          blue: "#12229D",              // Brand blue
          "blue-light": "#E8EAFF",      // Light blue for backgrounds
          "dark-blue": "#0A1466",       // Dark blue for text/icons
          cyan: "#B8E6F0",              // Cyan for accents/avatars
          // Orange/Yellow accent
          orange: "#F4B324",            // Orange accent (buttons, highlights)
          // Neutrals
          "grey-light": "#D7D7DB",      // Light grey (borders, outlines)
          "grey-dark": "#272030",       // Dark grey purple (text, backgrounds)
          // Legacy support (for existing components)
          primary: "#A71075",
          "primary-hover": "#8b0d5f",
        },
      },
      fontFamily: {
        sans: ["var(--font-lato)", "system-ui", "sans-serif"],
        heading: ["var(--font-montserrat)", "system-ui", "sans-serif"], // Montserrat for modern fitness vibe
        body: ["var(--font-lato)", "system-ui", "sans-serif"],
        display: ["var(--font-bodoni)", "Georgia", "serif"], // Bodoni for logos/display only
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
