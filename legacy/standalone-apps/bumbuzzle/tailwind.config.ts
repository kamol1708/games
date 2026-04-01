import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#0b1020',
      },
      boxShadow: {
        glow: '0 20px 70px rgba(59,130,246,.18)',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { opacity: '0.75', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        explode: {
          '0%': { transform: 'scale(.8)', opacity: '0' },
          '20%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1.45)', opacity: '0' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 1.6s ease-in-out infinite',
        explode: 'explode .65s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
