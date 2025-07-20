/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // AVA Brand Colors - Clean Modern Theme
        'ava': {
          primary: '#1a202c',
          secondary: '#4a5568',
          accent: '#e53e3e',
          gold: '#d69e2e',
          cream: '#f7fafc',
        },
        // Background colors
        'ava-bg': {
          primary: 'var(--ava-bg-primary)',
          secondary: 'var(--ava-bg-secondary)',
          tertiary: 'var(--ava-bg-tertiary)',
        },
        // Text colors
        'ava-text': {
          primary: 'var(--ava-text-primary)',
          secondary: 'var(--ava-text-secondary)',
          muted: 'var(--ava-text-muted)',
        },
        // Border colors
        'ava-border': {
          default: 'var(--ava-border)',
          dark: 'var(--ava-border-dark)',
        },
      },
      fontFamily: {
        'ava-primary': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'ava-secondary': ['Playfair Display', 'Georgia', 'serif'],
      },
      spacing: {
        'ava-xs': 'var(--ava-space-xs)',
        'ava-sm': 'var(--ava-space-sm)',
        'ava-md': 'var(--ava-space-md)',
        'ava-lg': 'var(--ava-space-lg)',
        'ava-xl': 'var(--ava-space-xl)',
        'ava-2xl': 'var(--ava-space-2xl)',
        'ava-3xl': 'var(--ava-space-3xl)',
      },
      borderRadius: {
        'ava-sm': 'var(--ava-radius-sm)',
        'ava-md': 'var(--ava-radius-md)',
        'ava-lg': 'var(--ava-radius-lg)',
        'ava-xl': 'var(--ava-radius-xl)',
        'ava-2xl': 'var(--ava-radius-2xl)',
      },
      transitionDuration: {
        'ava-fast': 'var(--ava-transition-fast)',
        'ava-normal': 'var(--ava-transition-normal)',
        'ava-slow': 'var(--ava-transition-slow)',
      },
      boxShadow: {
        'ava': '0 2px 4px rgba(45, 55, 72, 0.1)',
        'ava-lg': '0 8px 16px rgba(45, 55, 72, 0.15)',
        'ava-xl': '0 12px 24px rgba(45, 55, 72, 0.2)',
      },
      backgroundImage: {
        'ava-gradient-primary': 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
        'ava-gradient-accent': 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
        'ava-gradient-gold': 'linear-gradient(135deg, #D69E2E 0%, #B7791F 100%)',
        'ava-gradient-cream': 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    // Custom plugin for AVA utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-gradient': {
          background: theme('backgroundImage.ava-gradient-primary'),
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.bg-gradient-primary': {
          background: theme('backgroundImage.ava-gradient-primary'),
        },
        '.bg-gradient-accent': {
          background: theme('backgroundImage.ava-gradient-accent'),
        },
        '.bg-gradient-gold': {
          background: theme('backgroundImage.ava-gradient-gold'),
        },
        '.bg-gradient-cream': {
          background: theme('backgroundImage.ava-gradient-cream'),
        },
        '.shadow-ava': {
          boxShadow: theme('boxShadow.ava'),
        },
        '.shadow-ava-lg': {
          boxShadow: theme('boxShadow.ava-lg'),
        },
        '.shadow-ava-xl': {
          boxShadow: theme('boxShadow.ava-xl'),
        },
        '.border-ava': {
          borderColor: theme('colors.ava-border.default'),
        },
        '.border-ava-light': {
          borderColor: theme('colors.ava-border.dark'),
        },
        '.animate-fade-in': {
          animation: 'fadeIn 0.5s ease-in-out',
        },
        '.animate-slide-in': {
          animation: 'slideIn 0.3s ease-out',
        },
        '.animate-scale-in': {
          animation: 'scaleIn 0.2s ease-out',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} 