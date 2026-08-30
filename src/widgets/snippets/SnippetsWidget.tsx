import { useEffect, useMemo, useState } from 'react'
import { Code2, Plus, Star, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CopyIconButton } from '@/widgets/devtools/tools/ToolPrimitives'
import { SnippetFormModal } from './SnippetFormModal'
import { useSnippetStore } from '@/store/useSnippetStore'
import { cn } from '@/utils/cn'
import type { Snippet } from '@/types'

export function SnippetsWidget() {
  const { snippets, load, loading, remove, toggleFavorite } = useSnippetStore()
  const [formOpen, setFormOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [deletingSnippet, setDeletingSnippet] = useState<Snippet | null>(null)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? snippets.filter((s) => s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
      : snippets
    return [...filtered].sort((a, b) => Number(b.favorite) - Number(a.favorite))
  }, [snippets, query])

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-accent" />
          <CardTitle>Snippets</CardTitle>
        </div>
        <IconButton icon={<Plus size={16} />} label="Add snippet" onClick={() => setFormOpen(true)} />
      </CardHeader>

      {snippets.length > 0 && (
        <div className="px-4 pb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search snippets…"
            className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 pb-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-elevated" />)}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<Code2 size={28} />}
            title="No snippets yet"
            description="Save the commands you always have to look up."
            action={
              <button onClick={() => setFormOpen(true)} className="text-xs font-medium text-accent hover:underline">
                + Add snippet
              </button>
            }
          />
        ) : (
          visible.map((s) => (
            <div key={s.id} className="group rounded-lg px-2 py-2 hover:bg-surface-elevated">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm text-text-primary">{s.title}</p>
                  <code className="mt-0.5 block truncate font-mono text-[11px] text-text-secondary">{s.code}</code>
                </div>
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    aria-label={s.favorite ? 'Unfavorite' : 'Favorite'}
                    onClick={() => toggleFavorite(s.id)}
                    className={cn('rounded p-1', s.favorite ? 'text-warning' : 'text-text-secondary hover:text-text-primary')}
                  >
                    <Star size={13} fill={s.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <CopyIconButton value={s.code} />
                  <IconButton
                    icon={<Trash2 size={13} />}
                    label="Delete snippet"
                    onClick={() => setDeletingSnippet(s)}
                  />
                </div>
              </div>
              <Badge className="mt-1">{s.category}</Badge>
            </div>
          ))
        )}
      </div>

      <SnippetFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      <ConfirmModal
        open={!!deletingSnippet}
        title="Delete snippet?"
        message="Are you sure you want to delete this code snippet?"
        itemName={deletingSnippet?.title}
        confirmLabel="Delete snippet"
        onConfirm={async () => {
          if (deletingSnippet) {
            await remove(deletingSnippet.id)
            setDeletingSnippet(null)
          }
        }}
        onCancel={() => setDeletingSnippet(null)}
      />
    </Card>
  )
}
