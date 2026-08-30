import { useEffect, useRef } from 'react'
import { Check, LayoutGrid } from 'lucide-react'
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
  const { layout, loading, customizing, toggleCustomizing, load } = useWidgetStore()
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return null

  return (
    <div className="relative pb-16">
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

      {/* Floating Layout Customization Completed Bar */}
      {customizing && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-2xl border border-accent/50 bg-surface-elevated/95 px-5 py-3 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-accent animate-ping" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <LayoutGrid size={15} className="text-accent" />
              <span>Customizing Layout</span>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-text-secondary">
              • Drag & resize tiles to rearrange
            </span>
          </div>

          <button
            onClick={toggleCustomizing}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-lg shadow-accent/30 hover:scale-105 transition-all active:scale-95"
            title="Finish layout customization"
          >
            <Check size={14} strokeWidth={3} />
            <span>Done & Save</span>
          </button>
        </div>
      )}
    </div>
  )
}
