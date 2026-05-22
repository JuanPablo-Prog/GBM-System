/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    '#07090f',
          surface: '#0d1117',
          card:    '#131a24',
          hover:   '#1a2333',
        },
        border: {
          subtle: '#1e2d3d',
          default:'#253447',
          strong: '#2e4060',
        },
        amber: {
          DEFAULT: '#f59e0b',
          hover:   '#d97706',
          muted:   '#92400e22',
          text:    '#fbbf24',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04)',
        glow:  '0 0 20px rgba(245,158,11,.15)',
        modal: '0 25px 60px rgba(0,0,0,.8)',
      },
      backgroundImage: {
        'grid-faint': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23253447' fill-opacity='0.15'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}