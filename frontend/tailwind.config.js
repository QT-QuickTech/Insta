module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}", // all React files in src folder
    "./public/index.html"               // if you have a static HTML
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'], // ✅ Add this line
        playfair: ['Playfair Display', 'serif'],
         playwrite: ['Playwrite HR Lijeva', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
