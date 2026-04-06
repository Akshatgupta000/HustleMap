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
        "page-title": "clamp(1.5rem, 4vw, 2rem)", // 1.5rem - 2rem (reduced from 2rem-2.5rem)
        "section-heading": "clamp(1.25rem, 3.5vw, 1.5rem)", // 1.25rem - 1.5rem (reduced from 1.5rem-2rem)
        subtitle: "clamp(1rem, 2.5vw, 1.25rem)", // 1rem - 1.25rem (reduced from 1.25rem-1.75rem)
        "form-label": "clamp(0.875rem, 2vw, 1rem)", // 0.875rem - 1rem (reduced from 1rem-1.25rem)
        body: "clamp(0.875rem, 1.75vw, 0.9375rem)", // 0.875rem - 0.9375rem (14px-15px, reduced from 0.95rem-1rem)
        "small-text": "clamp(0.75rem, 1.5vw, 0.875rem)", // 0.75rem - 0.875rem (reduced from 0.8rem-0.95rem)
      },
      colors: {
        notion: {
          bg: "#000000",
          sidebar: "#050505",
          card: "#0A0A0F",
          border: "#1A1A24",
          text: "#F3F4F6",
          muted: "#9CA3AF",
          accent: "#A78BFA",
        },
        accent: {
          purple: "#A78BFA",
          blue: "#60A5FA",
          pink: "#F472B6",
          yellow: "#FBBF24",
          green: "#34D399",
        },
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
