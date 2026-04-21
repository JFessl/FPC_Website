/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A2540",
        teal: "#00B8A9",
        slate: "#1F2937",
        surface: "#F8F9FA",
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(10, 37, 64, 0.12)",
        "card-hover": "0 12px 40px -8px rgba(10, 37, 64, 0.18)",
      },
    },
  },
  plugins: [],
}

