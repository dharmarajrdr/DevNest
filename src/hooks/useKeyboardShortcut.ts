import { useEffect } from 'react'

interface Options {
  key: string
  metaOrCtrl?: boolean
  onTrigger: () => void
}

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA'])

/** Registers a global shortcut; ignored while the user is typing in a field. */
export function useKeyboardShortcut({ key, metaOrCtrl, onTrigger }: Options): void {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isEditing = EDITABLE_TAGS.has(target.tagName) || target.isContentEditable
      if (isEditing && key !== 'Escape') return

      const modifierOk = metaOrCtrl ? e.metaKey || e.ctrlKey : !e.metaKey && !e.ctrlKey
      if (e.key.toLowerCase() === key.toLowerCase() && modifierOk) {
        e.preventDefault()
        onTrigger()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, metaOrCtrl, onTrigger])
}
