/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
      colors: {
        ink: { 950: "#0b1120", 900: "#0f172a", 850: "#131c31", 800: "#1b2540", 700: "#263352" },
        protein: "#60a5fa",
        carbs: "#fbbf24",
        fats: "#f472b6",
      },
      boxShadow: { glow: "0 0 0 1px rgba(52,211,153,.25), 0 10px 40px -10px rgba(16,185,129,.35)" },
    },
  },
  plugins: [],
};
