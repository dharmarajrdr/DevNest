import { useState, type RefObject } from 'react'
import type { WidgetConfig } from '@/types'
import { useWidgetStore } from '@/store/useWidgetStore'
import { GRID_COLUMNS, ROW_HEIGHT_PX, GAP_PX, MAX_ROWS, clamp, type Rect } from '@/utils/grid'

/**
 * Pointer-based move/resize for one Bento Grid tile. Deliberately not a
 * general-purpose grid library (react-grid-layout et al.) — with nine
 * widgets and a fixed 12-column grid, plain pointer events plus the
 * store's overlap check (see useWidgetStore.updateWidgetRect) cover the
 * real requirement without the dependency weight. Widgets don't push each
 * other out of the way on collision; an overlapping drop is refused and
 * the tile snaps back, which the caller sees as `rect` reverting to the
 * committed config once the drag ends.
 */
export function useDragResize(config: WidgetConfig, gridRef: RefObject<HTMLDivElement>) {
  const updateWidgetRect = useWidgetStore((s) => s.updateWidgetRect)
  const [preview, setPreview] = useState<Rect | null>(null)

  function metrics() {
    const el = gridRef.current
    if (!el) return null
    const box = el.getBoundingClientRect()
    const colStep = (box.width - GAP_PX * (GRID_COLUMNS - 1)) / GRID_COLUMNS + GAP_PX
    const rowStep = ROW_HEIGHT_PX + GAP_PX
    return { colStep, rowStep }
  }

  function beginDrag(e: React.PointerEvent, mode: 'move' | 'resize') {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const m = metrics()
    if (!m) return

    const startClientX = e.clientX
    const startClientY = e.clientY
    const startRect: Rect = { x: config.x, y: config.y, w: config.w, h: config.h }

    function onMove(ev: PointerEvent) {
      const deltaCols = Math.round((ev.clientX - startClientX) / m!.colStep)
      const deltaRows = Math.round((ev.clientY - startClientY) / m!.rowStep)

      if (mode === 'move') {
        setPreview({
          x: clamp(startRect.x + deltaCols, 0, GRID_COLUMNS - startRect.w),
          y: clamp(startRect.y + deltaRows, 0, MAX_ROWS - startRect.h),
          w: startRect.w,
          h: startRect.h,
        })
      } else {
        setPreview({
          x: startRect.x,
          y: startRect.y,
          w: clamp(startRect.w + deltaCols, 2, GRID_COLUMNS - startRect.x),
          h: clamp(startRect.h + deltaRows, 2, MAX_ROWS - startRect.y),
        })
      }
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setPreview((current) => {
        if (current) void updateWidgetRect(config.id, current)
        return null
      })
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return {
    rect: preview ?? { x: config.x, y: config.y, w: config.w, h: config.h },
    isActive: preview !== null,
    startMove: (e: React.PointerEvent) => beginDrag(e, 'move'),
    startResize: (e: React.PointerEvent) => beginDrag(e, 'resize'),
  }
}
