/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Hierarchical text sizing with responsive scaling - optimized for density
        "page-title": "clamp(1.5rem, 4vw, 2rem)",
        "section-heading": "clamp(1.25rem, 3.5vw, 1.5rem)",
        subtitle: "clamp(1rem, 2.5vw, 1.25rem)",
        "form-label": "clamp(0.875rem, 2vw, 1rem)",
        body: "clamp(0.875rem, 1.75vw, 0.9375rem)",
        "small-text": "clamp(0.75rem, 1.5vw, 0.875rem)",
      },
      colors: {
        sage: {
          DEFAULT: "#e9efe9",
          light: "#f2f7f4",
          dark: "#d1dcd1",
        },
        charcoal: {
          DEFAULT: "#1c1c1c",
          light: "#2a2a2a",
        },
        brand: {
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
        },
        background: {
          DEFAULT: "#FAFAFA",
          sidebar: "#F3F4F6",
          card: "#FFFFFF",
        },
        border: {
          DEFAULT: "#E5E7EB",
          subtle: "#F3F4F6",
          hover: "#D1D5DB",
        },
        accent: {
          purple: "#8B5CF6",
          blue: "#38bdf8",
          pink: "#f472b6",
          cyan: "#22d3ee",
          emerald: "#34d399",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.05)",
        glass: "0 4px 20px rgba(0, 0, 0, 0.05)",
        glow: "0 4px 14px rgba(0, 0, 0, 0.08)",
        "glow-strong": "0 6px 20px rgba(0, 0, 0, 0.12)",
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      }
    },
  },
  plugins: [],
};
