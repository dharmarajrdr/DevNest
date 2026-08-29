import { useEffect, useMemo, useState } from 'react'
import { NotebookPen, Plus, Pencil } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { NoteEditorModal } from './NoteEditorModal'
import { useNoteStore } from '@/store/useNoteStore'
import type { Note } from '@/types'

export function NotesWidget() {
  const { notes, load, loading, create, update } = useNoteStore()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Note | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
  }, [notes, query])

  async function handleCreate() {
    const note = await create({ title: 'Untitled', content: '' })
    setEditing(note)
  }

  function startRename(n: Note) {
    setRenamingId(n.id)
    setRenameValue(n.title)
  }

  async function commitRename() {
    const id = renamingId
    setRenamingId(null)
    if (!id) return
    const trimmed = renameValue.trim() || 'Untitled'
    await update(id, { title: trimmed })
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
        <IconButton icon={<Plus size={16} />} label="New note" onClick={handleCreate} />
      </CardHeader>

      {notes.length > 0 && (
        <div className="px-4 pb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 pb-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {[1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-elevated" />)}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<NotebookPen size={28} />}
            title="No notes yet"
            description="Jot down system design ideas, interview notes, or things to remember."
            action={
              <button onClick={handleCreate} className="text-xs font-medium text-accent hover:underline">
                + New note
              </button>
            }
          />
        ) : (
          visible.map((n) => (
            <div key={n.id} className="group flex items-start gap-1 rounded-lg px-2 py-2 hover:bg-surface-elevated">
              <div className="min-w-0 flex-1">
                {renamingId === n.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename()
                      if (e.key === 'Escape') setRenamingId(null)
                    }}
                    className="w-full rounded-md border border-accent bg-bg px-1.5 py-0.5 text-sm text-text-primary focus:outline-none"
                  />
                ) : (
                  <button type="button" onClick={() => setEditing(n)} className="block w-full text-left">
                    <p className="truncate text-sm text-text-primary">{n.title || 'Untitled'}</p>
                  </button>
                )}
                <p className="truncate text-[11px] text-text-secondary">{n.content || 'No content'}</p>
              </div>
              <IconButton
                icon={<Pencil size={13} />}
                label={`Rename ${n.title || 'note'}`}
                onClick={() => startRename(n)}
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
          ))
        )}
      </div>

      <NoteEditorModal note={editing} onClose={() => setEditing(null)} />
    </Card>
  )
}
