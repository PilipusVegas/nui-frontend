/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#326058',
        secondary: '#F4A261',
        accent: '#2A9D8F',
        background: '#F6F6F6',
        text: '#333333',
        warning: '#E76F51',
        success: '#3A6351',
        info: '#457B9D',
      },
    },
  },
  plugins: [],
}