import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#05060a',
        'canvas-soft': '#0a0d14',
        stroke: 'rgba(255,255,255,0.1)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(2, 8, 23, 0.65)',
        violet: '0 0 60px rgba(131, 86, 255, 0.3)',
        blue: '0 0 60px rgba(59, 130, 246, 0.22)',
      },
      backgroundImage: {
        'divider-line':
          'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.6), rgba(59, 130, 246, 0.55), transparent)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-140%) skewX(-20deg)' },
          '100%': { transform: 'translateX(160%) skewX(-20deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.2s ease',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config

