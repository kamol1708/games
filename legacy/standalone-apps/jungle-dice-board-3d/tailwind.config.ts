import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 10px 40px rgba(0,0,0,0.35)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        floaty: 'floaty 2.8s ease-in-out infinite',
        pulseGlow: 'pulseGlow 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
