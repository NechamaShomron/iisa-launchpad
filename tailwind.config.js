/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'space-blue': '#0a1929',
        'cosmic-blue': '#1e3a5f',
        'nebula-purple': '#7c3aed',
      },
    },
  },
  plugins: [],
}
