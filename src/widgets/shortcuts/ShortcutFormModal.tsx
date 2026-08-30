import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { ShortcutCategory } from '@/types'
import { useShortcutStore } from '@/store/useShortcutStore'

const DEFAULT_CATEGORIES: string[] = [
  'AI Tools',
  'Readings',
  'Social',
  'Development',
  'Documentation',
  'Cloud',
  'Productivity',
  'Personal',
]

interface Props {
  open: boolean
  onClose: () => void
  initialCategory?: string
}

export function ShortcutFormModal({ open, onClose, initialCategory }: Props) {
  const { create, shortcuts } = useShortcutStore()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState<string>('AI Tools')
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  // Merge default categories with all categories present in existing shortcuts
  const allCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES)
    for (const s of shortcuts) {
      if (s.category) set.add(s.category)
    }
    return Array.from(set)
  }, [shortcuts])

  useEffect(() => {
    if (open) {
      setTitle('')
      setUrl('')
      setIsCreatingNewGroup(false)
      setNewGroupName('')
      if (initialCategory && initialCategory !== 'All') {
        setCategory(initialCategory)
      } else {
        setCategory(allCategories[0] || 'AI Tools')
      }
    }
  }, [open, initialCategory, allCategories])

  function handleCategorySelect(val: string) {
    if (val === '__NEW_GROUP__') {
      setIsCreatingNewGroup(true)
      setNewGroupName('')
    } else {
      setIsCreatingNewGroup(false)
      setCategory(val)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return

    let finalCategory = category
    if (isCreatingNewGroup) {
      if (!newGroupName.trim()) return
      finalCategory = newGroupName.trim()
    }

    let normalizedUrl = url.trim()
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`

    await create({
      title: title.trim(),
      url: normalizedUrl,
      category: finalCategory as ShortcutCategory,
    })

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
            placeholder="ChatGPT, GitHub, Reddit..."
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
            placeholder="chatgpt.com, github.com..."
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor="sc-category" className="mb-1 block text-xs text-text-secondary">
            Group / Category
          </label>
          <select
            id="sc-category"
            value={isCreatingNewGroup ? '__NEW_GROUP__' : category}
            onChange={(e) => handleCategorySelect(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
          >
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__NEW_GROUP__">+ Create New Group...</option>
          </select>
        </div>

        {isCreatingNewGroup && (
          <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 animate-fadeIn">
            <label htmlFor="sc-new-group" className="mb-1 block text-xs font-semibold text-text-primary">
              New Group Name
            </label>
            <div className="flex gap-2">
              <input
                id="sc-new-group"
                autoFocus
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Design, Crypto, Work..."
                className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-xs text-text-primary focus:border-accent"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setIsCreatingNewGroup(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!title.trim() || !url.trim() || (isCreatingNewGroup && !newGroupName.trim())}
          >
            <Plus size={14} /> Add shortcut
          </Button>
        </div>
      </form>
    </Modal>
  )
}

