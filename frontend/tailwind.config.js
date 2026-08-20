/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Accent scale — unchanged hues from the original blue `primary`, but the
        // 300-500 stops now carry the weight since they sit on a dark canvas.
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
        // Surface scale — 950 is the page canvas, 800 is an elevated card,
        // 700/600 are the two border weights.
        ink: {
          950: '#07070b',
          900: '#0b0b12',
          850: '#101018',
          800: '#15151f',
          700: '#22222f',
          600: '#31313f',
        },
        // Gradient partners for the accent. Used only inside gradients/glows.
        accent: '#22d3ee',
        violet: '#8b5cf6',
        // Body copy on dark surfaces (7.1:1 against ink-950).
        muted: '#9ca3b8',
        // Card surface token, retained from the original palette with a dark value.
        'card-bg': '#101018',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(5deg)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        // --- reactbits primitives ---
        // ShinyText: sweeps a highlight band across clipped text.
        shine: {
          '0%': { backgroundPosition: '100%' },
          '100%': { backgroundPosition: '-100%' },
        },
        // GradientText: pans an oversized gradient behind clipped text.
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // StarBorder: two comet highlights tracking the top and bottom edges.
        'star-movement-bottom': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
        },
        'star-movement-top': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(100%, 0%)', opacity: '0' },
        },
        // AuroraGlow: three independently drifting colour fields.
        auroraOne: {
          '0%, 100%': { transform: 'translate3d(-8%, -6%, 0) scale(1)' },
          '50%': { transform: 'translate3d(10%, 8%, 0) scale(1.18)' },
        },
        auroraTwo: {
          '0%, 100%': { transform: 'translate3d(6%, 10%, 0) scale(1.1)' },
          '50%': { transform: 'translate3d(-10%, -6%, 0) scale(0.92)' },
        },
        auroraThree: {
          '0%, 100%': { transform: 'translate3d(0%, 6%, 0) scale(0.95)' },
          '50%': { transform: 'translate3d(8%, -10%, 0) scale(1.15)' },
        },
        // RotatingText: characters rise into the slot and exit through the top.
        charIn: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        charOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-120%)' },
        },
        // LogoLoop: seamless marquee over a duplicated track.
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 2s infinite',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'shine': 'shine 5s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
        'star-movement-top': 'star-movement-top linear infinite alternate',
        'aurora-one': 'auroraOne 22s ease-in-out infinite',
        'aurora-two': 'auroraTwo 28s ease-in-out infinite',
        'aurora-three': 'auroraThree 34s ease-in-out infinite',
        'char-in': 'charIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'char-out': 'charOut 0.4s cubic-bezier(0.55, 0, 0.55, 0.2) both',
        'marquee': 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
