import { Eye } from 'lucide-react'
import { useWidgetStore } from '@/store/useWidgetStore'
import { WIDGET_REGISTRY } from '@/widgets/registry'

/** Shown only in customize mode — widgets hidden via the tile's eye-off
 *  button (or Settings) land here so they're never lost, just parked. */
export function HiddenWidgetsTray() {
  const layout = useWidgetStore((s) => s.layout)
  const toggleVisible = useWidgetStore((s) => s.toggleVisible)
  const hidden = layout.filter((w) => !w.visible)

  if (hidden.length === 0) return null

  return (
    <div className="mt-4 rounded-card border border-dashed border-border p-3">
      <p className="mb-2 text-[11px] font-medium text-text-secondary">Hidden widgets</p>
      <div className="flex flex-wrap gap-2">
        {hidden.map((w) => {
          const def = WIDGET_REGISTRY[w.type]
          if (!def) return null
          return (
            <button
              key={w.id}
              onClick={() => toggleVisible(w.id)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-2.5 py-1.5 text-xs text-text-secondary hover:border-accent/50 hover:text-text-primary"
            >
              <Eye size={12} />
              {def.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}
