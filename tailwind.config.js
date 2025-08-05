/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': '#0d1117',
        'theme-text': '#f0f6fc',
        'theme-card': '#0d1117',
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}

