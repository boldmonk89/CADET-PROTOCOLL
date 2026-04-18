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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        tactical: {
          100: "#1a1c1a",
          200: "#222522",
          300: "#2c302c",
          400: "#495048",
          800: "#8e9b89",
        },
        success: {
          DEFAULT: "#00FF9D", // Bright military neon green
          foreground: "#000000",
        },
        caution: {
          DEFAULT: "#FFB000", // Bright warning yellow
          foreground: "#000000",
        },
      },
      borderRadius: {
        lg: "0", // Tactical sharp edges instead of rounded
        md: "0",
        sm: "0",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["'Inter'", "sans-serif"],
        "mono-tac": ["'SF Text'", "'Courier New'", "monospace"],
        command: ["'Times New Roman'", "serif"],
      },
      borderWidth: {
        "1": "1px",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)",
        "glass-gradient": "linear-gradient(180deg, rgba(20,22,20,0.6) 0%, rgba(10,12,10,0.9) 100%)",
      },
      boxShadow: {
        "glow-gold": "0 0 20px rgba(255, 215, 0, 0.2)",
        "glow-success": "0 0 15px rgba(0, 255, 157, 0.3)",
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
        breathe: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "glitch-anim": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 1px)" },
          "40%": { transform: "translate(-1px, -2px)" },
          "60%": { transform: "translate(2px, 1px)" },
          "80%": { transform: "translate(1px, -1px)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        breathe: "breathe 3s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
        glitch: "glitch-anim 0.3s cubic-bezier(.25, .46, .45, .94) both infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
