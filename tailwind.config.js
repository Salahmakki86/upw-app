/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tr: {
          black:        '#090909',
          dark:         '#111111',
          card:         '#1a1a1a',
          card2:        '#222222',
          border:       '#2a2a2a',
          gold:         '#c9a84c',
          'gold-light': '#e8c96a',
          'gold-dark':  '#a88930',
          white:        '#ffffff',
          gray:         '#888888',
          'gray-light': '#b0b0b0',
          red:          '#e63946',
          green:        '#2ecc71',
          blue:         '#3498db',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      animation: {
        'breath':     'breath 4s ease-in-out infinite alternate',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'pulse-red':  'pulse-red 1.5s ease-in-out infinite',
        'slide-up':   'slide-up 0.4s ease-out',
        'fade-in':    'fade-in 0.5s ease-out',
        'scale-in':   'scale-in 0.3s ease-out',
        'glow':       'glow 2.5s ease-in-out infinite',
      },
      keyframes: {
        'breath': {
          '0%':   { transform: 'scale(1)',    opacity: '0.7' },
          '100%': { transform: 'scale(1.35)', opacity: '1'   },
        },
        'pulse-gold': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0.5)' },
          '50%':     { boxShadow: '0 0 0 18px rgba(201,168,76,0)' },
        },
        'pulse-red': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(230,57,70,0.6)' },
          '50%':     { boxShadow: '0 0 0 20px rgba(230,57,70,0)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        'glow': {
          '0%,100%': { textShadow: '0 0 8px rgba(201,168,76,0.4)' },
          '50%':     { textShadow: '0 0 22px rgba(201,168,76,0.9)' },
        },
      },
      boxShadow: {
        'gold':    '0 0 20px rgba(201,168,76,0.25)',
        'gold-lg': '0 0 40px rgba(201,168,76,0.4)',
        'card':    '0 4px 24px rgba(0,0,0,0.5)',
        'red':     '0 0 20px rgba(230,57,70,0.35)',
      },
    },
  },
  plugins: [],
}
