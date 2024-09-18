/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#326058', // Warna biru khusus
        secondary: '#ff5722', // Warna oranye khusus
        customGray: '#2d2d2d', // Warna abu-abu khusus
      },
    },
  },
  plugins: [],
}