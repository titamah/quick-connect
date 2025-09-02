/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app.css",
    "node_modules/preline/dist/*.js",
  ],
  theme: {
    extend: {
      colors: {
        /* Brand Colors */
        "brand-yellow": "var(--brand-yellow)",
        "brand-orange": "var(--brand-orange)",
        "brand-light-green": "var(--brand-light-green)",
        "brand-green": "var(--brand-green)",
        "brand-dark": "var(--brand-dark)",

        /* Theme Variables */
        "bg-main": "var(--bg-main)",
        "bg-secondary": "var(--bg-secondary)",
        contrast: "var(--contrast)",
        "contrast-sheer": "var(--contrast-sheer)",
        accent: "var(--accent)",
        "accent-secondary": "var(--accent-secondary)",
        "accent-highlight": "var(--accent-highlight)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "border-color": "var(--border-color)",
        "hover-bg": "var(--hover-bg)",
        "active-bg": "var(--active-bg)",
      },
        
        fontFamily: {
          slab: "var(--font-slab)",
          rubik: "var(--font-rubik)",
          rubikMono: "var(--font-rubik-mono)",
        },
    },
  },
  plugins: [],
};
