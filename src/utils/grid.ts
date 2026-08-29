import type { WidgetConfig } from '@/types'

export const GRID_COLUMNS = 12
export const ROW_HEIGHT_PX = 52
export const GAP_PX = 16
export const MAX_ROWS = 60

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

/** True if `rect` overlaps any *other* visible widget in the layout. */
export function overlapsAny(rect: Rect, id: string, layout: WidgetConfig[]): boolean {
  return layout.some((w) => w.id !== id && w.visible && rectsOverlap(rect, w))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
