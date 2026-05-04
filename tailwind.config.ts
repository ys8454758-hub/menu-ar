import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        plasma: {
          DEFAULT: "var(--color-plasma)",
          dim: "var(--color-plasma-dim)",
          glow: "var(--color-plasma-glow)",
        },
        void: "var(--color-void)",
        terminal: "var(--color-terminal)",
        grid: "var(--color-grid)",
        surface: {
          DEFAULT: "var(--color-surface)",
          high: "var(--color-surface-high)",
        },
        neon: {
          violet: {
            DEFAULT: "var(--color-neon-violet)",
            dim: "var(--color-neon-violet-dim)",
          },
        },
        ember: "var(--color-ember)",
        solar: "var(--color-solar)",
        bio: "var(--color-bio)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",
        ivory: "var(--color-ivory)",
        "ivory-light": "var(--color-ivory-light)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "monospace"],
        ui: ["var(--font-ui)", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      animation: {
        "plasma-pulse": "plasma-pulse 2s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
        typewriter: "typewriter 2s steps(40, end)",
        flicker: "flicker 0.15s infinite",
        materialize: "materialize 0.5s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        "plasma-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px var(--color-plasma-dim)" },
          "50%": { boxShadow: "0 0 20px var(--color-plasma), 0 0 40px var(--color-plasma-glow)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "96%": { opacity: "1" },
          "97%": { opacity: "0.4" },
          "98%": { opacity: "1" },
          "99%": { opacity: "0.6" },
        },
        materialize: {
          from: {
            opacity: "0",
            filter: "blur(20px) brightness(3)",
            transform: "scale(0.8)",
          },
          to: {
            opacity: "1",
            filter: "blur(0) brightness(1)",
            transform: "scale(1)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        "display-2xl": "var(--text-display-2xl)",
        "display-xl": "var(--text-display-xl)",
        "display-lg": "var(--text-display-lg)",
        "display-md": "var(--text-display-md)",
        "body-lg": "var(--text-body-lg)",
        "body-md": "var(--text-body-md)",
        "body-sm": "var(--text-body-sm)",
        "body-xs": "var(--text-body-xs)",
        "ui-lg": "var(--text-ui-lg)",
        "ui-md": "var(--text-ui-md)",
        "ui-sm": "var(--text-ui-sm)",
        "ui-xs": "var(--text-ui-xs)",
      },
      transitionDelay: {
        1000: "1000ms",
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;