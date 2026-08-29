import { useEffect, useState } from 'react'
import { Link2, Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ShortcutFormModal } from './ShortcutFormModal'
import { useShortcutStore } from '@/store/useShortcutStore'

function faviconUrl(url: string): string {
  try {
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?sz=64&domain=${host}`
  } catch {
    return ''
  }
}

export function ShortcutsWidget() {
  const { shortcuts, load, loading, remove } = useShortcutStore()
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Shortcuts</CardTitle>
        <IconButton icon={<Plus size={16} />} label="Add shortcut" onClick={() => setFormOpen(true)} />
      </CardHeader>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {loading ? (
          <div className="grid grid-cols-3 gap-2 p-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-elevated" />
            ))}
          </div>
        ) : shortcuts.length === 0 ? (
          <EmptyState
            icon={<Link2 size={28} />}
            title="No shortcuts yet"
            description="Pin the sites you open every day."
            action={
              <button
                onClick={() => setFormOpen(true)}
                className="text-xs font-medium text-accent hover:underline"
              >
                + Add shortcut
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-3 gap-2 p-1">
            {shortcuts.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-2 py-3 text-center transition-colors hover:border-accent/50"
              >
                <img
                  src={faviconUrl(s.url)}
                  alt=""
                  className="h-6 w-6 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.visibility = 'hidden'
                  }}
                />
                <span className="w-full truncate text-[11px] text-text-primary">{s.title}</span>
                <button
                  aria-label={`Remove ${s.title}`}
                  onClick={(e) => {
                    e.preventDefault()
                    remove(s.id)
                  }}
                  className="absolute right-1 top-1 hidden rounded p-0.5 text-text-secondary hover:text-danger group-hover:block"
                >
                  <Trash2 size={12} />
                </button>
              </a>
            ))}
          </div>
        )}
      </div>

      <ShortcutFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </Card>
  )
}
