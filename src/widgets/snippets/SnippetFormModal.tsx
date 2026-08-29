import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { SnippetCategory } from '@/types'
import { useSnippetStore } from '@/store/useSnippetStore'

const CATEGORIES: SnippetCategory[] = [
  'Git', 'Java', 'Spring Boot', 'JavaScript', 'TypeScript', 'SQL', 'Docker', 'Kubernetes', 'Linux', 'Regex', 'Custom',
]

export function SnippetFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { create } = useSnippetStore()
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')
  const [category, setCategory] = useState<SnippetCategory>('Git')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !code.trim()) return
    await create({ title: title.trim(), code, category })
    setTitle('')
    setCode('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New snippet">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="sn-title" className="mb-1 block text-xs text-text-secondary">Title</label>
          <input
            id="sn-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Git reset last commit"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="sn-code" className="mb-1 block text-xs text-text-secondary">Snippet</label>
          <textarea
            id="sn-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={4}
            spellCheck={false}
            placeholder="git reset --soft HEAD~1"
            className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs text-text-primary placeholder:text-text-secondary focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="sn-category" className="mb-1 block text-xs text-text-secondary">Category</label>
          <select
            id="sn-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as SnippetCategory)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!title.trim() || !code.trim()}>Add snippet</Button>
        </div>
      </form>
    </Modal>
  )
}
