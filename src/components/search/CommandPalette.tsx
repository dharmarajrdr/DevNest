import { useMemo, useState } from 'react'
import { CheckSquare, Link2, Search } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useTodoStore } from '@/store/useTodoStore'
import { useShortcutStore } from '@/store/useShortcutStore'

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * Cmd/Ctrl+K search across todos and shortcuts today; wires into the
 * same widget stores that dev-tools/snippets/notes will register with
 * once those widgets exist, so this list grows without a rewrite.
 */
export function CommandPalette({ open, onClose }: Props) {
  const { todos } = useTodoStore()
  const { shortcuts } = useShortcutStore()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { todos: [], shortcuts: [] }
    return {
      todos: todos.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 5),
      shortcuts: shortcuts.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 5),
    }
  }, [query, todos, shortcuts])

  const hasResults = results.todos.length > 0 || results.shortcuts.length > 0

  return (
    <Modal open={open} onClose={onClose} title="Search">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2">
        <Search size={15} className="text-text-secondary" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks and shortcuts…"
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
        />
      </div>

      {query.trim() && (
        <div className="mt-3 max-h-64 space-y-3 overflow-y-auto">
          {!hasResults && (
            <p className="py-4 text-center text-xs text-text-secondary">No matches.</p>
          )}
          {results.todos.length > 0 && (
            <div>
              <p className="mb-1 px-1 text-[10px] font-semibold uppercase text-text-secondary">
                Tasks
              </p>
              {results.todos.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-elevated">
                  <CheckSquare size={14} className="text-text-secondary" />
                  {t.title}
                </div>
              ))}
            </div>
          )}
          {results.shortcuts.length > 0 && (
            <div>
              <p className="mb-1 px-1 text-[10px] font-semibold uppercase text-text-secondary">
                Shortcuts
              </p>
              {results.shortcuts.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-elevated"
                >
                  <Link2 size={14} className="text-text-secondary" />
                  {s.title}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
