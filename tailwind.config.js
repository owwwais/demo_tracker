/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0B3B2E', 2: '#0A2F25', soft: '#3D5A51' },
        brand: { DEFAULT: '#0F5C3F', 600: '#0C4D35', 50: '#E7F1EC', 100: '#D3E7DC' },
        gold: { DEFAULT: '#D9A33B', 600: '#B8862A', text: '#7A5410', 50: '#FBF3E2' },
        ground: '#F4F6F5',
        line: '#E3E8E6',
        late: { DEFAULT: '#C2560C', text: '#9A3F06', 50: '#FDF0E6' },
        bad: { DEFAULT: '#B42318', 50: '#FDECEA' },
        bubble: '#DCF3E4',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        display: ['Anton', '"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      borderRadius: { xl2: '20px', '4xl': '28px' },
      boxShadow: {
        soft: '0 1px 2px rgba(11,59,46,.04), 0 8px 24px -12px rgba(11,59,46,.12)',
        float: '0 24px 60px -20px rgba(11,59,46,.35)',
      },
      keyframes: {
        rise: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'none' } },
        slidein: { from: { opacity: 0, transform: 'translateY(16px) scale(.98)' }, to: { opacity: 1, transform: 'none' } },
        scan: { '0%': { top: '8%' }, '50%': { top: '88%' }, '100%': { top: '8%' } },
        pop: { '0%': { transform: 'scale(.9)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        flash: { '0%': { opacity: 0 }, '20%': { opacity: 1 }, '100%': { opacity: 0 } },
        pulseRing: { '0%': { boxShadow: '0 0 0 0 rgba(217,163,59,.55)' }, '100%': { boxShadow: '0 0 0 10px rgba(217,163,59,0)' } },
      },
      animation: {
        rise: 'rise .6s cubic-bezier(.2,.7,.2,1) both',
        slidein: 'slidein .45s cubic-bezier(.2,.7,.2,1) both',
        scan: 'scan 1.4s ease-in-out infinite',
        pop: 'pop .3s cubic-bezier(.2,.7,.2,1) both',
        flash: 'flash .5s ease-out both',
        ring: 'pulseRing 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
}
