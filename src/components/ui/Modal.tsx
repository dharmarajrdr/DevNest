import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { IconButton } from './IconButton'
import { cn } from '@/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
  bodyClassName?: string
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  bodyClassName = 'p-5',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const openPrevRef = useRef(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Keyboard accessibility: Escape closes, Tab is trapped inside the
  // dialog while it's open, and focus returns to whatever triggered the
  // modal once it closes.
  useEffect(() => {
    if (!open) {
      if (openPrevRef.current) {
        openPrevRef.current = false
        previouslyFocused.current?.focus()
      }
      return
    }

    const isFirstOpen = !openPrevRef.current
    openPrevRef.current = true

    if (isFirstOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement | null

      // Delay slightly to let children render, then focus first input or panel if nothing inside is focused
      requestAnimationFrame(() => {
        const panel = panelRef.current
        if (panel && !panel.contains(document.activeElement)) {
          const autoFocusEl = panel.querySelector<HTMLElement>('[autofocus]')
          const firstInput = panel.querySelector<HTMLElement>('input:not([disabled]), textarea:not([disabled]), select:not([disabled])')
          const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
          const target = autoFocusEl ?? firstInput ?? focusable?.[0] ?? panel
          target?.focus()
        }
      })
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      const panel = panelRef.current
      if (e.key !== 'Tab' || !panel) return

      const nodes = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (nodes.length === 0) return
      const firstEl = nodes[0]
      const lastEl = nodes[nodes.length - 1]

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[6vh] pb-[6vh] px-4 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'w-full rounded-card border border-border bg-surface-elevated shadow-card my-auto max-h-[88vh] flex flex-col',
          maxWidth,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3 shrink-0">
          <h2 id="modal-title" className="text-sm font-semibold">
            {title}
          </h2>
          <IconButton icon={<X size={16} />} label="Close" onClick={onClose} />
        </div>
        <div className={cn('overflow-y-auto flex-1', bodyClassName)}>{children}</div>
      </div>
    </div>
  )
}
