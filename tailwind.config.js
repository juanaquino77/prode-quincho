/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        union: {
          blue: '#00A8DE',
          'blue-light': '#33BCE8',
          'blue-dark': '#0090BE',
          navy: '#001B38',
          'navy-light': '#002A54',
          'navy-mid': '#003366',
          white: '#FDFEFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-navy': 'linear-gradient(135deg, #001B38 0%, #002A54 50%, #003366 100%)',
        'gradient-blue': 'linear-gradient(135deg, #00A8DE 0%, #0090BE 100%)',
      },
    },
  },
  plugins: [],
}
