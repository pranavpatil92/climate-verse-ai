/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B7A3D',
          light: '#2ea855',
          dark: '#145e2f',
        },
        secondary: {
          DEFAULT: '#2563A8',
          light: '#3b82f6',
          dark: '#1d4f8a',
        },
        navy: {
          DEFAULT: '#0F1F3D',
          light: '#1a2f57',
          dark: '#080f1e',
        },
        risk: {
          low: '#16a34a',
          medium: '#d97706',
          high: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(15,31,61,0.08)',
        'card-hover': '0 8px 32px 0 rgba(15,31,61,0.16)',
      },
    },
  },
  plugins: [],
};
