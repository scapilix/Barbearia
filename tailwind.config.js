/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--primary))",
          light: "rgb(var(--primary-light))",
          dark: "rgb(var(--primary-dark))",
        },
        secondary: "rgb(var(--secondary))",
        card: "rgb(var(--bg-card))",
        "border-main": "rgb(var(--border-main))",
        muted: "rgb(var(--text-muted))",
        dark: {
          DEFAULT: "rgb(var(--dark))",
        },
        accent: "rgb(var(--accent))",
        sidebar: "rgb(var(--nav-bg))",
      },
      backgroundColor: {
        main: "rgb(var(--bg-main))",
      },
      textColor: {
        main: "rgb(var(--text-main))",
      },
      borderColor: {
        main: "rgb(var(--border-main))",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
