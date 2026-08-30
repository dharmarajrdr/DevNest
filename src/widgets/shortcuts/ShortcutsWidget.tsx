import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownAZ,
  ArrowUpDown,
  ArrowUpZA,
  Folder,
  Globe,
  Link2,
  Plus,
  Trash2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ShortcutFormModal } from './ShortcutFormModal'
import { useShortcutStore } from '@/store/useShortcutStore'
import { StorageService } from '@/services/storage/StorageService'
import { cn } from '@/utils/cn'
import type { Shortcut } from '@/types'

function faviconUrl(url: string): string {
  try {
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?sz=64&domain=${host}`
  } catch {
    return ''
  }
}

const SORT_KEY = 'devtab.shortcutSortOrder'
type SortOrder = 'default' | 'name-asc' | 'name-desc'

export function ShortcutsWidget() {
  const { shortcuts, load, loading, remove } = useShortcutStore()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [modalInitialCategory, setModalInitialCategory] = useState<string>('AI Tools')
  const [sortOrder, setSortOrder] = useState<SortOrder>('default')
  const [deletingShortcut, setDeletingShortcut] = useState<Shortcut | null>(null)

  useEffect(() => {
    load()
    StorageService.get<SortOrder>(SORT_KEY).then((saved) => {
      if (saved) setSortOrder(saved)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function cycleSort() {
    let next: SortOrder = 'default'
    if (sortOrder === 'default') next = 'name-asc'
    else if (sortOrder === 'name-asc') next = 'name-desc'
    else next = 'default'

    setSortOrder(next)
    StorageService.set(SORT_KEY, next)
  }

  // Unique list of categories present in shortcuts
  const activeCategories = useMemo(() => {
    const set = new Set<string>()
    for (const s of shortcuts) {
      if (s.category) set.add(s.category)
    }
    return Array.from(set).sort()
  }, [shortcuts])

  // Sync selectedCategory when activeCategories change
  const currentCategory = useMemo(() => {
    if (selectedCategory && activeCategories.includes(selectedCategory)) {
      return selectedCategory
    }
    return activeCategories[0] || 'General'
  }, [selectedCategory, activeCategories])

  // Grouped shortcuts mapping with sorting applied
  const groupedShortcuts = useMemo(() => {
    const map = new Map<string, Shortcut[]>()
    for (const s of shortcuts) {
      const cat = s.category || 'General'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(s)
    }

    if (sortOrder !== 'default') {
      for (const [cat, list] of map.entries()) {
        map.set(
          cat,
          [...list].sort((a, b) => {
            const cmp = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
            return sortOrder === 'name-asc' ? cmp : -cmp
          }),
        )
      }
    }

    return map
  }, [shortcuts, sortOrder])

  function handleOpenCreate(category?: string) {
    setModalInitialCategory(category || currentCategory || 'AI Tools')
    setFormOpen(true)
  }

  async function handleConfirmDelete() {
    if (deletingShortcut) {
      await remove(deletingShortcut.id)
      setDeletingShortcut(null)
    }
  }

  const currentItems = groupedShortcuts.get(currentCategory) ?? []

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-accent" />
          <CardTitle>Shortcuts</CardTitle>
          <span className="text-[11px] font-semibold text-text-secondary">
            {shortcuts.length} links
          </span>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            icon={
              sortOrder === 'name-asc' ? (
                <ArrowDownAZ size={16} className="text-accent" />
              ) : sortOrder === 'name-desc' ? (
                <ArrowUpZA size={16} className="text-accent" />
              ) : (
                <ArrowUpDown size={16} />
              )
            }
            label={
              sortOrder === 'name-asc'
                ? 'Sorted A-Z (Click for Z-A)'
                : sortOrder === 'name-desc'
                  ? 'Sorted Z-A (Click for Default)'
                  : 'Sort by name (A-Z)'
            }
            onClick={cycleSort}
          />
          <IconButton
            icon={<Plus size={16} />}
            label="Add shortcut"
            onClick={() => handleOpenCreate()}
          />
        </div>
      </CardHeader>

      {/* Category Pills Tab Bar without 'All' */}
      {activeCategories.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-3 pb-2 pt-0.5 scrollbar-none">
          {activeCategories.map((cat) => {
            const count = groupedShortcuts.get(cat)?.length ?? 0
            const isSelected = currentCategory === cat
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
                    isSelected ? 'bg-accent/20 text-accent font-bold' : 'bg-surface-elevated text-text-secondary',
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
        ) : (
          /* Filtered Active Category View */
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                <Folder size={13} className="text-accent" />
                <span>{currentCategory}</span>
                <span className="text-[10px] font-normal text-text-secondary">
                  ({currentItems.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCreate(currentCategory)}
                className="text-[11px] text-accent hover:underline flex items-center gap-0.5"
              >
                <Plus size={12} /> Add to {currentCategory}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentItems.map((s) => (
                <ShortcutCard
                  key={s.id}
                  shortcut={s}
                  onDeleteRequest={(shortcut) => setDeletingShortcut(shortcut)}
                />
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

      <ConfirmModal
        open={!!deletingShortcut}
        title="Delete shortcut?"
        message="Are you sure you want to delete this shortcut link?"
        itemName={deletingShortcut?.title}
        confirmLabel="Delete shortcut"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingShortcut(null)}
      />
    </Card>
  )
}

function ShortcutCard({
  shortcut: s,
  onDeleteRequest,
}: {
  shortcut: Shortcut
  onDeleteRequest: (shortcut: Shortcut) => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="group relative flex flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-elevated/50 px-2 py-3 text-center transition-all hover:border-accent/50 hover:bg-surface-elevated hover:shadow-sm">
      <a
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1.5 w-full overflow-hidden"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface p-1 shadow-sm">
          {!imgError ? (
            <img
              src={faviconUrl(s.url)}
              alt=""
              className="h-4 w-4 object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <Globe size={14} className="text-text-secondary" />
          )}
        </div>
        <span className="w-full truncate text-xs font-medium text-text-primary group-hover:text-accent">
          {s.title}
        </span>
      </a>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDeleteRequest(s)
        }}
        title="Delete shortcut"
        className="absolute right-1 top-1 rounded p-1 text-text-secondary opacity-0 transition-opacity hover:bg-surface hover:text-danger group-hover:opacity-100"
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}
