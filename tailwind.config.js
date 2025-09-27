/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme colors
        primary: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8dd18d',
          400: '#5bb85b',
          500: '#3a9d3a',
          600: '#2d7d2d',
          700: '#256325',
          800: '#225022',
          900: '#1f421f',
        },
        accent: {
          50: '#fffdf0',
          100: '#fff9dc',
          200: '#fff2bc',
          300: '#ffe88d',
          400: '#ffd95b',
          500: '#ffc73a',
          600: '#e6a02d',
          700: '#cc7a25',
          800: '#b35f22',
          900: '#994f1f',
        },
        // Dark theme colors
        dark: {
          50: '#1a2f1a',
          100: '#1f3a1f',
          200: '#244524',
          300: '#295029',
          400: '#2e5b2e',
          500: '#336633',
          600: '#387138',
          700: '#3d7c3d',
          800: '#428742',
          900: '#479247',
        },
        darkAccent: {
          50: '#2d1a0f',
          100: '#3a1f14',
          200: '#472419',
          300: '#54291e',
          400: '#612e23',
          500: '#6e3328',
          600: '#7b382d',
          700: '#883d32',
          800: '#954237',
          900: '#a2473c',
        }
      },
      fontFamily: {
        'arabic': ['Amiri', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'arabic-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M30 30c0-16.569-13.431-30-30-30v60c16.569 0 30-13.431 30-30z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        'arabic-pattern-dark': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23000000\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M30 30c0-16.569-13.431-30-30-30v60c16.569 0 30-13.431 30-30z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'arabic': '0 4px 20px rgba(58, 157, 58, 0.15)',
        'arabic-dark': '0 4px 20px rgba(51, 102, 51, 0.3)',
        'gold': '0 4px 20px rgba(255, 199, 58, 0.2)',
      }
    },
  },
  plugins: [],
}
