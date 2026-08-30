import { useEffect, type ReactNode } from 'react'
import { Minimize2, type LucideIcon } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  icon: LucideIcon
  iconColor?: string
  children: ReactNode
}

export function FullScreenTimeOverlay({
  open,
  onClose,
  title,
  icon: Icon,
  iconColor = 'text-accent',
  children,
}: Props) {
  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-bg/95 backdrop-blur-2xl p-6 sm:p-10 md:p-14 animate-fadeIn select-none overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} Full Screen`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated border border-border shadow-sm">
            <Icon size={22} className={iconColor} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">{title}</h2>
            <p className="text-xs text-text-secondary">Distraction-Free Focus Mode</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated/80 px-3.5 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all shadow-sm group"
          title="Exit Full-Screen (Esc)"
        >
          <Minimize2 size={15} className="group-hover:scale-110 transition-transform" />
          <span>Exit Full-Screen</span>
          <kbd className="hidden sm:inline-block rounded bg-bg px-1.5 py-0.5 text-[10px] font-mono text-text-secondary border border-border">
            ESC
          </kbd>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col items-center justify-center w-full max-w-5xl mx-auto py-8">
        {children}
      </div>

      {/* Subtle Bottom Accent Glow & Hint */}
      <div className="flex items-center justify-center text-xs text-text-secondary/70 shrink-0">
        <span>Press <kbd className="font-mono font-semibold text-text-secondary">ESC</kbd> anytime to return to dashboard</span>
      </div>
    </div>
  )
}
