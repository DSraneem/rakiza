/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Tajawal', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#e8f5f0',
          100: '#c5e8d8',
          500: '#1d9e75',
          600: '#0f6e56',
          700: '#085041',
          900: '#04342c',
        },
      },
    },
  },
  plugins: [],
}
