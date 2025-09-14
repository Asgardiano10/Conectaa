/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgmain: "#0b0b0f",
        primary: "#00A3FF",
        secondary: "#1a1d29",
        accent: "#2563eb",
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
      },
    },
  },
  plugins: [],
}
