import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { TodoPriority } from '@/types'
import { useTodoStore } from '@/store/useTodoStore'

const PRIORITIES: TodoPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

export function TodoFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { create } = useTodoStore()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')

  function reset() {
    setTitle('')
    setPriority('MEDIUM')
    setDueDate('')
    setDueTime('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await create({
      title: title.trim(),
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
    })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="task-title" className="mb-1 block text-xs text-text-secondary">
            Title
          </label>
          <input
            id="task-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to get done?"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-date" className="mb-1 block text-xs text-text-secondary">
              Due date
            </label>
            <input
              id="task-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="task-time" className="mb-1 block text-xs text-text-secondary">
              Due time
            </label>
            <input
              id="task-time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              disabled={!dueDate}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent disabled:opacity-40"
            />
          </div>
        </div>

        <div>
          <span className="mb-1 block text-xs text-text-secondary">Priority</span>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPriority(p)}
                className={
                  'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ' +
                  (priority === p
                    ? 'border-accent bg-accent/15 text-accent'
                    : 'border-border text-text-secondary hover:text-text-primary')
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            Add task
          </Button>
        </div>
      </form>
    </Modal>
  )
}
