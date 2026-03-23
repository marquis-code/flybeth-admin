/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0D1DAD',
          green: '#32B404',
          gray: '#606062',
        },
        primary: '#0D1DAD',
        success: '#32B404',
        neutral: '#606062',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        serif: ['Spectral', 'serif'],
      },
      transitionProperty: {
        'premium': 'all',
      },
      transitionDuration: {
        'premium': '300ms',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      addUtilities({
        '.transition-premium': {
          transitionProperty: theme('transitionProperty.premium'),
          transitionTimingFunction: theme('transitionTimingFunction.premium'),
          transitionDuration: theme('transitionDuration.premium'),
        },
      })
    }
  ],
}

