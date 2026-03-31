/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './src/**/*.css'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#d4d4d8',
          300: '#a1a1aa',
          400: '#71717a',
          500: '#52525b',
          600: '#3f3f46',
        },
        amber: {
          glow: '#fbbf24',
        },
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(ellipse 100% 85% at 50% -35%, rgba(217,119,6,0.28), transparent 52%), radial-gradient(ellipse 55% 45% at 100% 15%, rgba(245,158,11,0.14), transparent 48%), radial-gradient(ellipse 45% 38% at 0% 85%, rgba(146,64,14,0.12), transparent 42%)',
        'gold-line': 'linear-gradient(135deg, rgba(253,230,138,0.55), rgba(245,158,11,0.35), rgba(146,64,14,0.45))',
      },
      boxShadow: {
        glass: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow: '0 0 40px -8px rgba(245,158,11,0.35)',
        'glow-sm': '0 0 24px -6px rgba(251,191,36,0.4)',
        card: '0 20px 50px -20px rgba(0,0,0,0.65)',
      },
      keyframes: {
        'glow-drift': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1) translate(0, 0)' },
          '50%': { opacity: '0.85', transform: 'scale(1.08) translate(3%, -2%)' },
        },
        'glow-drift-slow': {
          '0%, 100%': { opacity: '0.35', transform: 'translate(0, 0)' },
          '50%': { opacity: '0.65', transform: 'translate(-4%, 3%)' },
        },
      },
      animation: {
        'glow-drift': 'glow-drift 14s ease-in-out infinite',
        'glow-drift-slow': 'glow-drift-slow 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
