import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { ShortcutCategory } from '@/types'
import { useShortcutStore } from '@/store/useShortcutStore'

const CATEGORIES: ShortcutCategory[] = [
  'Development',
  'Documentation',
  'Cloud',
  'Productivity',
  'Personal',
  'Custom',
]

export function ShortcutFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { create } = useShortcutStore()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState<ShortcutCategory>('Development')

  function reset() {
    setTitle('')
    setUrl('')
    setCategory('Development')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    let normalizedUrl = url.trim()
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`
    await create({ title: title.trim(), url: normalizedUrl, category })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New shortcut">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="sc-title" className="mb-1 block text-xs text-text-secondary">
            Name
          </label>
          <input
            id="sc-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="GitHub"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="sc-url" className="mb-1 block text-xs text-text-secondary">
            URL
          </label>
          <input
            id="sc-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="github.com"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="sc-category" className="mb-1 block text-xs text-text-secondary">
            Category
          </label>
          <select
            id="sc-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ShortcutCategory)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim() || !url.trim()}>
            Add shortcut
          </Button>
        </div>
      </form>
    </Modal>
  )
}
