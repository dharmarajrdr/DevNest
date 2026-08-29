/**
 * Design tokens, mirrored as CSS custom properties in styles/globals.css
 * (Tailwind's `accent` color reads --accent at runtime so users can pick
 * a custom accent in Settings without a rebuild).
 */
export const theme = {
  color: {
    bg: '#0B0F14',
    surface: '#111720',
    surfaceElevated: '#171E29',
    border: '#273142',
    textPrimary: '#F5F7FA',
    textSecondary: '#94A3B8',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  accentPresets: ['#5B8CFF', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4'],
} as const
