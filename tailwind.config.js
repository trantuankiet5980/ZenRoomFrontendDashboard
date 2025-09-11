/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brandBg: "#FFE3B8",
        brandBtn: "#fbb040",
      },
      boxShadow: {
        brand: "0 8px 20px rgba(251,176,64,0.35)",
      },
    },
  },
  plugins: [],
};
