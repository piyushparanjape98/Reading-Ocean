/** @type {import('tailwindcss').Config} */
// Every value below was read from the Figma frames Bookshelf_Home, Open_Genre_Store,
// Mobile_Home and Mobile_Store. Near-duplicate creams in the file (#f2e6cf / #f1e4ca /
// #f1dec0 …) are consolidated into one scale; one-off values stay as arbitrary classes.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Figma: Cormorant Garamond Regular for display, Inter Regular for UI
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          100: '#f4e5c7', // headings on walnut
          200: '#f2e6cf', // nav + footer text
          300: '#e4d2b4', // taglines
          400: '#d4c6af', // muted labels
          500: '#ceba9b', // author names
        },
        brass: {
          200: '#e5d4b6', // Login button
          300: '#d6bb86', // + Cart button, cart badge
          400: '#c8a36b', // section numerals
          500: '#a67443', // fine brass rules
          600: '#977951', // outlined button borders
        },
        walnut: {
          950: '#1b130e', // shelf interior, top
          900: '#2a1c14',
          800: '#443124', // Wishlist / Close button fill
          700: '#58341f', // shelf divider
          600: '#6a472d', // showcase surround, top
          500: '#8c5933', // polished shelf, top
          400: '#a77a47', // showcase ledge, top
        },
        room: {
          nav: '#342e25',
          dim: '#171611',
          wainscot: '#2f3226',
        },
      },
      boxShadow: {
        spine: '5px 3px 6px rgba(0,0,0,0.5)',
        cover: '5px 6px 7px rgba(0,0,0,0.5)',
        'cover-sm': '4px 5px 7px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
}
