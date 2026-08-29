import { useEffect, useRef } from 'react'
import { useWidgetStore } from '@/store/useWidgetStore'
import { WidgetTile } from './WidgetTile'
import { HiddenWidgetsTray } from './HiddenWidgetsTray'

/**
 * Renders whatever is in the widget layout store as a 12-column CSS grid,
 * using each widget's explicit x/y so drag placement (see useDragResize)
 * lands exactly where the user drops it — not wherever grid auto-flow
 * would otherwise put it. Layout is data (WidgetConfig[]), not markup.
 */
export function BentoGrid() {
  const { layout, loading, customizing, load } = useWidgetStore()
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return null

  return (
    <div>
      <div
        ref={gridRef}
        className="grid auto-rows-[52px] grid-cols-12 gap-4"
        role="region"
        aria-label="Dashboard widgets"
      >
        {layout
          .filter((w) => w.visible)
          .map((w) => (
            <WidgetTile key={w.id} config={w} gridRef={gridRef} />
          ))}
      </div>
      {customizing && <HiddenWidgetsTray />}
    </div>
  )
}
