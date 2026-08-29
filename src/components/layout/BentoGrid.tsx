import { WIDGET_REGISTRY } from '@/widgets/registry'
import { useWidgetStore } from '@/store/useWidgetStore'
import { useEffect } from 'react'

/**
 * Renders whatever is in the widget layout store as a 12-column CSS grid.
 * Layout is data (WidgetConfig[]), not markup — nothing here is hardcoded
 * to "clock top, todo left, shortcuts right"; that's just today's default.
 */
export function BentoGrid() {
  const { layout, load, loading } = useWidgetStore()

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return null

  return (
    <div
      className="grid auto-rows-[52px] grid-cols-12 gap-4"
      role="region"
      aria-label="Dashboard widgets"
    >
      {layout
        .filter((w) => w.visible)
        .map((w) => {
          const def = WIDGET_REGISTRY[w.type]
          if (!def) return null
          const Widget = def.component
          return (
            <div
              key={w.id}
              style={{
                gridColumn: `span ${w.w} / span ${w.w}`,
                gridRow: `span ${w.h} / span ${w.h}`,
              }}
            >
              <Widget />
            </div>
          )
        })}
    </div>
  )
}
