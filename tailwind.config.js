/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#FAF8F5',  // Elegant off-white background
          muted: '#C5A880',  // Muted gold borders
          deep: '#836822',   // Signature royal gold accent
          dark: '#5C4716',   // Rich hover states
        },
        charcoal: {
          light: '#555555',  // High-legibility body text
          dark: '#111111',   // Rich titles
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Didot', 'Georgia', 'serif'],
        sans: ['Montserrat', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.12em',
        ultra: '0.24em',
      }
    },
  },
  plugins: [],
}