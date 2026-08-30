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

/**
 * Resolves grid collisions when `movedId` is dropped at `targetRect`.
 * Colliding visible widgets are automatically pushed down to make room,
 * and any cascading overlaps are resolved iteratively.
 */
export function resolveCollisions(
  movedId: string,
  targetRect: Rect,
  layout: WidgetConfig[],
): WidgetConfig[] {
  // Clone layout and assign the new rect to the target widget
  const result: WidgetConfig[] = layout.map((w) =>
    w.id === movedId ? { ...w, ...targetRect } : { ...w },
  )

  let hasCollision = true
  let iterations = 0
  const MAX_ITERATIONS = 100

  while (hasCollision && iterations < MAX_ITERATIONS) {
    hasCollision = false
    iterations++

    for (let i = 0; i < result.length; i++) {
      const a = result[i]
      if (!a.visible) continue

      for (let j = i + 1; j < result.length; j++) {
        const b = result[j]
        if (!b.visible) continue

        if (rectsOverlap(a, b)) {
          hasCollision = true
          if (a.id === movedId) {
            b.y = a.y + a.h
          } else if (b.id === movedId) {
            a.y = b.y + b.h
          } else {
            if (a.y <= b.y) {
              b.y = a.y + a.h
            } else {
              a.y = b.y + b.h
            }
          }
          a.y = clamp(a.y, 0, MAX_ROWS - a.h)
          b.y = clamp(b.y, 0, MAX_ROWS - b.h)
        }
      }
    }
  }

  return result
}
