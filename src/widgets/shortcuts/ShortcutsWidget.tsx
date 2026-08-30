import { useEffect, useMemo, useState } from 'react'
import { Folder, Globe, Link2, Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ShortcutFormModal } from './ShortcutFormModal'
import { useShortcutStore } from '@/store/useShortcutStore'
import { cn } from '@/utils/cn'

function faviconUrl(url: string): string {
  try {
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?sz=64&domain=${host}`
  } catch {
    return ''
  }
}

function domainName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function ShortcutsWidget() {
  const { shortcuts, load, loading, remove } = useShortcutStore()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [modalInitialCategory, setModalInitialCategory] = useState<string>('AI Tools')

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Unique list of categories present in shortcuts
  const activeCategories = useMemo(() => {
    const set = new Set<string>()
    for (const s of shortcuts) {
      if (s.category) set.add(s.category)
    }
    return Array.from(set).sort()
  }, [shortcuts])

  // Grouped shortcuts mapping
  const groupedShortcuts = useMemo(() => {
    const map = new Map<string, typeof shortcuts>()
    for (const s of shortcuts) {
      const cat = s.category || 'General'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(s)
    }
    return map
  }, [shortcuts])

  function handleOpenCreate(category?: string) {
    setModalInitialCategory(category || (selectedCategory !== 'All' ? selectedCategory : 'AI Tools'))
    setFormOpen(true)
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Shortcuts</CardTitle>
          <span className="text-[11px] font-semibold text-text-secondary">
            {shortcuts.length} links
          </span>
        </div>
        <IconButton
          icon={<Plus size={16} />}
          label="Add shortcut"
          onClick={() => handleOpenCreate()}
        />
      </CardHeader>

      {/* Category Pills Tab Bar */}
      {activeCategories.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-3 pb-2 pt-0.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap',
              selectedCategory === 'All'
                ? 'bg-accent/15 text-accent shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated',
            )}
          >
            All ({shortcuts.length})
          </button>
          {activeCategories.map((cat) => {
            const count = groupedShortcuts.get(cat)?.length ?? 0
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
                  isSelected
                    ? 'bg-accent/15 text-accent shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated',
                )}
              >
                <span>{cat}</span>
                <span
                  className={cn(
                    'text-[10px] rounded px-1 py-0.2',
                    isSelected ? 'bg-accent/20 text-accent' : 'bg-surface-elevated text-text-secondary',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-elevated" />
            ))}
          </div>
        ) : shortcuts.length === 0 ? (
          <EmptyState
            icon={<Link2 size={28} />}
            title="No shortcuts yet"
            description="Group and pin the tools, readings, and sites you open daily."
            action={
              <button
                onClick={() => handleOpenCreate()}
                className="text-xs font-medium text-accent hover:underline"
              >
                + Add first shortcut
              </button>
            }
          />
        ) : selectedCategory === 'All' ? (
          /* Grouped View across all categories */
          <div className="space-y-4">
            {Array.from(groupedShortcuts.entries()).map(([categoryName, items]) => (
              <div key={categoryName} className="space-y-2">
                <div className="flex items-center justify-between border-b border-border/40 pb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                    <Folder size={13} className="text-accent" />
                    <span>{categoryName}</span>
                    <span className="text-[10px] font-normal text-text-secondary">
                      ({items.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenCreate(categoryName)}
                    className="text-[11px] text-text-secondary hover:text-accent flex items-center gap-0.5"
                    title={`Add shortcut to ${categoryName}`}
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {items.map((s) => (
                    <ShortcutCard key={s.id} shortcut={s} onRemove={remove} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Filtered Single Category View */
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                <Folder size={13} className="text-accent" />
                <span>{selectedCategory}</span>
                <span className="text-[10px] font-normal text-text-secondary">
                  ({groupedShortcuts.get(selectedCategory)?.length ?? 0})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCreate(selectedCategory)}
                className="text-[11px] text-accent hover:underline flex items-center gap-0.5"
              >
                <Plus size={12} /> Add to {selectedCategory}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(groupedShortcuts.get(selectedCategory) ?? []).map((s) => (
                <ShortcutCard key={s.id} shortcut={s} onRemove={remove} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ShortcutFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialCategory={modalInitialCategory}
      />
    </Card>
  )
}

function ShortcutCard({
  shortcut: s,
  onRemove,
}: {
  shortcut: { id: string; title: string; url: string; category?: string }
  onRemove: (id: string) => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="group relative flex flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-elevated/50 px-2 py-3 text-center transition-all hover:border-accent/50 hover:bg-surface-elevated hover:shadow-sm">
      <a
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full flex-col items-center gap-1.5 min-w-0"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface border border-border/50">
          {!imgError ? (
            <img
              src={faviconUrl(s.url)}
              alt=""
              className="h-4 w-4 rounded"
              onError={() => setImgError(true)}
            />
          ) : (
            <Globe size={14} className="text-text-secondary" />
          )}
        </div>
        <div className="w-full min-w-0">
          <span className="block truncate text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
            {s.title}
          </span>
          <span className="block truncate text-[10px] text-text-secondary mt-0.5">
            {domainName(s.url)}
          </span>
        </div>
      </a>
      <button
        aria-label={`Remove ${s.title}`}
        onClick={() => onRemove(s.id)}
        className="absolute right-1 top-1 hidden rounded p-1 text-text-secondary hover:bg-danger/10 hover:text-danger group-hover:block transition-colors"
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}

