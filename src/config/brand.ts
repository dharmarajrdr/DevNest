/**
 * Single source of truth for product identity. Nothing else in the app
 * should hardcode the product name — import from here so the extension
 * can be relabeled without touching component code.
 */
export const BRAND_NAME = 'DevTab'
export const BRAND_TAGLINE = 'Your command center for the day'
export const BRAND_LOGO_MARK = '</>' // used by <Logo /> as a text glyph; swap for an <svg> import to rebrand
export const BRAND_PRIMARY_COLOR = '#5B8CFF'
export const BRAND_SECONDARY_COLOR = '#8B5CF6'
