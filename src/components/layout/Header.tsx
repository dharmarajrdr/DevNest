import { Search, Settings2, LayoutGrid, Check } from 'lucide-react'
import { BRAND_LOGO_MARK, BRAND_NAME } from '@/config/brand'
import { IconButton } from '@/components/ui/IconButton'
import { useWidgetStore } from '@/store/useWidgetStore'
import { cn } from '@/utils/cn'

interface Props {
  onOpenSearch: () => void
  onOpenSettings: () => void
}

export function Header({ onOpenSearch, onOpenSettings }: Props) {
  const isMac = navigator.platform.toUpperCase().includes('MAC')
  const customizing = useWidgetStore((s) => s.customizing)
  const toggleCustomizing = useWidgetStore((s) => s.toggleCustomizing)

  return (
    <header className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 font-mono text-sm font-bold text-accent">
          {BRAND_LOGO_MARK}
        </div>
        <span className="text-sm font-semibold text-text-primary">{BRAND_NAME}</span>
      </div>

      <button
        onClick={onOpenSearch}
        className="flex w-80 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-left text-text-secondary transition-colors hover:border-accent/40"
      >
        <Search size={14} />
        <span className="flex-1 text-xs">Search tasks and shortcuts…</span>
        <kbd className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px]">
          {isMac ? '⌘K' : 'Ctrl+K'}
        </kbd>
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleCustomizing}
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors',
            customizing
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
          )}
        >
          {customizing ? <Check size={13} /> : <LayoutGrid size={13} />}
          {customizing ? 'Done' : 'Customize'}
        </button>
        <IconButton icon={<Settings2 size={16} />} label="Settings" onClick={onOpenSettings} />
      </div>
    </header>
  )
}
