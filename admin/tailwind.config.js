/** Design tokens come from design/DESIGN.md (Stitch export). */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
        },
        ink: '#0F172A',
        canvas: '#F8FAFC',
        line: '#E2E8F0',
        muted: '#64748B',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '1rem' },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15,23,42,.05), 0 1px 2px -1px rgba(15,23,42,.05)',
        lift: '0 4px 6px -1px rgba(15,23,42,.07), 0 2px 4px -2px rgba(15,23,42,.05)',
        overlay: '0 20px 25px -5px rgba(15,23,42,.1), 0 8px 10px -6px rgba(15,23,42,.06)',
      },
    },
  },
  plugins: [],
};
