/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  future: {
    // Compiles every `hover:` utility inside `@media (hover: hover)`, so touch
    // devices never latch a hover state after a tap.
    hoverOnlyWhenSupported: true,
  },
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // benji.org pairs a neutral sans for body copy with an italic serif
        // used sparingly for emphasis.
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      fontWeight: {
        // benji.org sets body copy at 460 — between normal and medium.
        book: '460',
      },
      letterSpacing: {
        tightish: '-0.00563rem',
      },
      keyframes: {
        'letter-in': {
          '0%': { opacity: '0', transform: 'translateY(0.4em)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'stagger-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'letter-in': 'letter-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
        'stagger-in': 'stagger-in 0.5s ease both',
      },
    },
  },
  plugins: [],
}
