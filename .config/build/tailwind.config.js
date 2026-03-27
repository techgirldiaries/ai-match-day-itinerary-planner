module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bebas: ["Bebas Neue", "cursive"],
      },
      fontSize: {
        "responsive-title": ["clamp(2rem, 6vw, 3.5rem)", "1.1"],
        "responsive-body": ["clamp(1rem, 3vw, 1.5rem)", "1.5"],
      },
    },
  },
  plugins: [],
};
