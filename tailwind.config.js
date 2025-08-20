/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/views/**/*.hbs', // Tell Tailwind to scan your HBS files
    './public/**/*.js'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

