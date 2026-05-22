/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        espresso: "#4A2C2A",
        burgundy: "#5F1F34",
        rose: "#B96B7D",
        blush: "#EBC8D5",
        cream: "#F8F1E9",
        pearl: "#FFF9F4",
        peach: "#F6C7A7",
        sage: "#879E8C",
        storm: "#435466"
      },
      fontFamily: {
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"]
      },
      boxShadow: {
        luxury: "0 24px 80px rgba(74, 44, 42, 0.18)",
        glass: "0 18px 55px rgba(95, 31, 52, 0.18)"
      }
    }
  },
  plugins: []
};
