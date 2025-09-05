/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // update this if needed
  theme: {
    extend: {
      colors: {
        primary: "#0a192f",      // Navy Blue
        secondary: "#112240",    // Darker Navy
        accent: "#f4c430",       // Mustard Yellow
        textLight: "#e2e8f0",    // Light text (whiteish)
        textMuted: "#94a3b8",    // Muted grey-blue
      },
    },
  },
  plugins: [],
};
