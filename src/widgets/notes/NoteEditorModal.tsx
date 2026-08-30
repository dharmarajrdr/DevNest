import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { Note } from '@/types'
import { useNoteStore } from '@/store/useNoteStore'

export function NoteEditorModal({ note, onClose }: { note: Note | null; onClose: () => void }) {
  const { update, remove } = useNoteStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setShowDeleteConfirm(false)
    }
  }, [note])

  // Autosave on blur/close rather than on every keystroke — avoids a write
  // per character while still never losing anything the user typed.
  async function persistAndClose() {
    if (note && (title !== note.title || content !== note.content)) {
      await update(note.id, { title: title.trim() || 'Untitled', content })
    }
    onClose()
  }

  if (!note) return null

  return (
    <>
      <Modal open={!!note} onClose={persistAndClose} title="Note">
        <div className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent text-sm font-semibold text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="Write something…"
            className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 self-start text-xs font-medium text-danger hover:underline"
          >
            <Trash2 size={12} /> Delete note
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete note?"
        message="Are you sure you want to delete this note?"
        itemName={note.title || 'Untitled'}
        confirmLabel="Delete note"
        onConfirm={async () => {
          await remove(note.id)
          setShowDeleteConfirm(false)
          onClose()
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}
