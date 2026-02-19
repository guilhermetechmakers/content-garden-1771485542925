import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          foreground: 'rgb(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary))',
          foreground: 'rgb(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent))',
          foreground: 'rgb(var(--accent-foreground))',
        },
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        card: {
          DEFAULT: 'rgb(var(--card))',
          foreground: 'rgb(var(--card-foreground))',
        },
        border: 'rgb(var(--border))',
        input: 'rgb(var(--input))',
        ring: 'rgb(var(--ring))',
        muted: {
          DEFAULT: 'rgb(var(--muted))',
          foreground: 'rgb(var(--muted-foreground))',
        },
        destructive: 'rgb(var(--destructive))',
        electric: 'rgb(var(--electric))',
        orange: 'rgb(var(--orange))',
        purple: 'rgb(var(--purple))',
        yellow: 'rgb(var(--yellow))',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['3rem', { lineHeight: '1.1' }],
        'title': ['1.5rem', { lineHeight: '1.3' }],
        'section': ['1.125rem', { lineHeight: '1.4' }],
        'body': ['0.875rem', { lineHeight: '1.6' }],
        'caption': ['0.8125rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        'card': '0.625rem',
        'card-lg': '1rem',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgb(var(--border))',
        'glow-electric': '0 0 20px rgba(57, 255, 144, 0.3)',
        'glow-purple': '0 0 20px rgba(162, 89, 255, 0.3)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'drawer-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(57, 255, 144, 0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(57, 255, 144, 0.4)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'drawer-in-right': 'drawer-in-right 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'scale-in': 'scale-in 0.2s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), typography],
}
