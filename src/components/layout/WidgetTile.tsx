import { type RefObject } from 'react'
import { GripVertical, EyeOff } from 'lucide-react'
import type { WidgetConfig } from '@/types'
import { WIDGET_REGISTRY } from '@/widgets/registry'
import { useWidgetStore } from '@/store/useWidgetStore'
import { useDragResize } from '@/hooks/useDragResize'
import { cn } from '@/utils/cn'

export function WidgetTile({ config, gridRef }: { config: WidgetConfig; gridRef: RefObject<HTMLDivElement> }) {
  const customizing = useWidgetStore((s) => s.customizing)
  const toggleVisible = useWidgetStore((s) => s.toggleVisible)
  const def = WIDGET_REGISTRY[config.type]
  const { rect, isActive, startMove, startResize } = useDragResize(config, gridRef)

  if (!def) return null
  const Widget = def.component

  return (
    <div
      style={{
        gridColumnStart: rect.x + 1,
        gridColumnEnd: `span ${rect.w}`,
        gridRowStart: rect.y + 1,
        gridRowEnd: `span ${rect.h}`,
      }}
      className={cn('relative transition-shadow', isActive && 'z-20 shadow-card')}
    >
      <div className={cn('h-full', customizing && 'pointer-events-none opacity-90')}>
        <Widget />
      </div>

      {customizing && (
        <div
          className={cn(
            'absolute inset-0 rounded-card border-2 border-dashed',
            isActive ? 'border-accent bg-accent/5' : 'border-accent/40',
          )}
        >
          <div
            onPointerDown={startMove}
            className="flex h-7 cursor-grab items-center gap-1.5 rounded-t-[14px] bg-bg/80 px-2 text-text-secondary backdrop-blur-sm active:cursor-grabbing"
          >
            <GripVertical size={13} />
            <span className="truncate text-[11px] font-medium">{def.title}</span>
            <button
              aria-label={`Hide ${def.title}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => toggleVisible(config.id)}
              className="ml-auto rounded p-0.5 hover:bg-surface-elevated hover:text-danger"
            >
              <EyeOff size={13} />
            </button>
          </div>

          <div
            onPointerDown={startResize}
            aria-hidden
            className="absolute bottom-1 right-1 h-4 w-4 cursor-nwse-resize rounded-sm border-b-2 border-r-2 border-accent/60"
          />
        </div>
      )}
    </div>
  )
}
