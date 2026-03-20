/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink:   { DEFAULT: '#0A0A0A', 50: '#F5F5F5', 100: '#E8E8E8', 200: '#D1D1D1', 300: '#B4B4B4', 400: '#8A8A8A', 500: '#636363', 600: '#404040', 700: '#2D2D2D', 800: '#1A1A1A', 900: '#0A0A0A' },
        sand:  { DEFAULT: '#C8A96E', 50: '#FDFAF4', 100: '#F8F0E0', 200: '#EFE0C0', 300: '#E3CC99', 400: '#D4B57A', 500: '#C8A96E', 600: '#B08940', 700: '#8A6A2E', 800: '#5C4420', 900: '#2E2010' },
        rose:  { DEFAULT: '#C17B6F', 50: '#FDF5F4', 100: '#F9E8E6', 200: '#F0CECA', 300: '#E5ADA7', 400: '#D48F88', 500: '#C17B6F', 600: '#A45E52', 700: '#7D4540', 800: '#542E2B', 900: '#2A1715' },
        ivory: { DEFAULT: '#F5F0E8', 50: '#FEFDFB', 100: '#FAF7F2', 200: '#F5F0E8', 300: '#ECE4D4', 400: '#E0D5C0', 500: '#CFC2A8' },
        sage:  { 50: '#F0F4F1', 100: '#DCE8DF', 200: '#B8D0BE', 300: '#8BB59A', 400: '#619A76', 500: '#3D7A54' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'soft':   '0 2px 20px rgba(10,10,10,0.06)',
        'card':   '0 4px 32px rgba(10,10,10,0.08)',
        'hover':  '0 8px 48px rgba(10,10,10,0.12)',
        'sand':   '0 4px 24px rgba(200,169,110,0.3)',
        'sand-lg':'0 8px 40px rgba(200,169,110,0.4)',
        'inset':  'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'grad-sand':  'linear-gradient(135deg, #C8A96E 0%, #E3CC99 50%, #C8A96E 100%)',
        'grad-dark':  'linear-gradient(160deg, #0A0A0A 0%, #1A1A1A 100%)',
        'grad-hero':  'linear-gradient(160deg, #0A0A0A 0%, #1A1010 40%, #2A1010 100%)',
        'noise':      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        'grid-lines': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23C8A96E' stroke-opacity='0.06' stroke-width='0.5'%3E%3Cpath d='M60 0H0v60'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up':    'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':    'fadeIn 0.5s ease forwards',
        'slide-right':'slideRight 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'pulse-sand': 'pulseSand 2s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity:'0', transform:'translateY(28px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:    { from: { opacity:'0' }, to: { opacity:'1' } },
        slideRight:{ from: { opacity:'0', transform:'translateX(-20px)' }, to: { opacity:'1', transform:'translateX(0)' } },
        float:     { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-12px)' } },
        shimmer:   { '0%': { backgroundPosition:'-200% 0' }, '100%': { backgroundPosition:'200% 0' } },
        pulseSand: { '0%,100%': { opacity:'1' }, '50%': { opacity:'0.6' } },
      },
    },
  },
  plugins: [],
}

module.exports = config
