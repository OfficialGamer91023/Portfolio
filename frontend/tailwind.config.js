/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- "Engineering notebook" tokens ---
        // Every value is a CSS variable defined in index.css, so a single
        // `data-theme` attribute on <html> swaps the whole palette (paper <-> blueprint).
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        card: 'var(--card)',
        edge: 'var(--edge)',
        grid: 'var(--grid)',
        'grid-bold': 'var(--grid-bold)',
        plot: 'var(--plot)',
        verify: 'var(--verify)',
        blueprint: 'var(--blue)',
        // Text weights: content (primary), content-2 (body), content-3 (muted).
        content: 'var(--ink)',
        'content-2': 'var(--ink-2)',
        'content-3': 'var(--ink-3)',

        // --- Legacy dark-theme tokens (kept until the migration is complete) ---
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        ink: {
          950: '#07070b',
          900: '#0b0b12',
          850: '#101018',
          800: '#15151f',
          700: '#22222f',
          600: '#31313f',
        },
        accent: '#22d3ee',
        violet: '#8b5cf6',
        muted: '#9ca3b8',
        'card-bg': '#101018',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        serif: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
        hand: ['Caveat', 'ui-rounded', 'cursive'],
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Hero status dot + chess "thinking" pulse.
        pulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-slow': 'pulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
