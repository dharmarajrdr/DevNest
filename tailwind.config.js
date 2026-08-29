/** @type {import('tailwindcss').Config} */
export default {
  content: ['./newtab.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0F14',
        surface: '#111720',
        'surface-elevated': '#171E29',
        border: '#273142',
        'text-primary': '#F5F7FA',
        'text-secondary': '#94A3B8',
        accent: 'var(--accent)',
        'accent-secondary': '#8B5CF6',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['"Inter var"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
