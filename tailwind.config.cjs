/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 60-30-10 Color Scheme
        'bg-primary': '#000000',      // 60% - Pure Black
        'bg-secondary': '#0f172a',    // Secondary surface
        'bg-tertiary': '#1f2937',     // 30% - Dark Gray (accent)
        'text-primary': '#e5e7eb',    // 10% - Light gray text
        'text-secondary': '#9ca3af',  // Secondary text
        'text-tertiary': '#6b7280',   // Tertiary text
        'accent-primary': '#3b82f6',  // 10% - Blue accent
        'accent-secondary': '#10b981', // 10% - Green accent
        'accent-tertiary': '#f59e0b', // 10% - Amber accent
        
        // Extended color palette
        'surface': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#000000',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    }
  },
  plugins: [require('tailwindcss-animate')],
};