import { useMemo, useState, type ReactNode } from 'react'
import { CheckSquare, Link2, Search, Code2, NotebookPen, Wrench } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useTodoStore } from '@/store/useTodoStore'
import { useShortcutStore } from '@/store/useShortcutStore'
import { useSnippetStore } from '@/store/useSnippetStore'
import { useNoteStore } from '@/store/useNoteStore'
import { DEV_TOOLS } from '@/widgets/devtools/tools/registry'

interface Props {
  open: boolean
  onClose: () => void
}

/** Cmd/Ctrl+K search across tasks, shortcuts, snippets, notes, and dev tools. */
export function CommandPalette({ open, onClose }: Props) {
  const { todos } = useTodoStore()
  const { shortcuts } = useShortcutStore()
  const { snippets } = useSnippetStore()
  const { notes } = useNoteStore()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { todos: [], shortcuts: [], snippets: [], notes: [], tools: [] }
    return {
      todos: todos.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 5),
      shortcuts: shortcuts.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 5),
      snippets: snippets.filter((s) => s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)).slice(0, 5),
      notes: notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)).slice(0, 5),
      tools: DEV_TOOLS.filter((t) => t.label.toLowerCase().includes(q)).slice(0, 5),
    }
  }, [query, todos, shortcuts, snippets, notes])

  const hasResults = Object.values(results).some((r) => r.length > 0)

  return (
    <Modal open={open} onClose={onClose} title="Search">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2">
        <Search size={15} className="text-text-secondary" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks, shortcuts, snippets, notes, tools…"
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
        />
      </div>

      {query.trim() && (
        <div className="mt-3 max-h-72 space-y-3 overflow-y-auto">
          {!hasResults && <p className="py-4 text-center text-xs text-text-secondary">No matches.</p>}

          {results.todos.length > 0 && (
            <ResultGroup label="Tasks">
              {results.todos.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-elevated">
                  <CheckSquare size={14} className="text-text-secondary" />
                  {t.title}
                </div>
              ))}
            </ResultGroup>
          )}

          {results.shortcuts.length > 0 && (
            <ResultGroup label="Shortcuts">
              {results.shortcuts.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-elevated">
                  <Link2 size={14} className="text-text-secondary" />
                  {s.title}
                </a>
              ))}
            </ResultGroup>
          )}

          {results.snippets.length > 0 && (
            <ResultGroup label="Snippets">
              {results.snippets.map((s) => (
                <div key={s.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-elevated">
                  <Code2 size={14} className="text-text-secondary" />
                  {s.title}
                </div>
              ))}
            </ResultGroup>
          )}

          {results.notes.length > 0 && (
            <ResultGroup label="Notes">
              {results.notes.map((n) => (
                <div key={n.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-elevated">
                  <NotebookPen size={14} className="text-text-secondary" />
                  {n.title || 'Untitled'}
                </div>
              ))}
            </ResultGroup>
          )}

          {results.tools.length > 0 && (
            <ResultGroup label="Developer tools">
              {results.tools.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-elevated">
                  <Wrench size={14} className="text-text-secondary" />
                  {t.label}
                </div>
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </Modal>
  )
}

function ResultGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 px-1 text-[10px] font-semibold uppercase text-text-secondary">{label}</p>
      {children}
    </div>
  )
}
