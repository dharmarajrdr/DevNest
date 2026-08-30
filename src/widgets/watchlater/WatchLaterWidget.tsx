import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ExternalLink,
  Film,
  ListVideo,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Tv,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useWatchLaterStore } from '@/store/useWatchLaterStore'
import { parseYouTubeUrl } from '@/services/storage/repositories/WatchLaterRepository'
import type { WatchLaterItem } from '@/types'
import { cn } from '@/utils/cn'

type FilterTab = 'UNWATCHED' | 'WATCHED'

export function WatchLaterWidget() {
  const { items, loading, load, addByUrl, toggleComplete, remove } = useWatchLaterStore()
  const [urlInput, setUrlInput] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('UNWATCHED')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingItem, setDeletingItem] = useState<WatchLaterItem | null>(null)

  useEffect(() => {
    load()
  }, [load])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const trimmed = urlInput.trim()
    if (!trimmed) return

    const parsed = parseYouTubeUrl(trimmed)
    if (!parsed.valid) {
      setError('Please enter a valid YouTube video or playlist URL (e.g. https://youtube.com/watch?v=... or https://youtu.be/...).')
      return
    }

    try {
      setAdding(true)
      await addByUrl(trimmed)
      setUrlInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video.')
    } finally {
      setAdding(false)
    }
  }

  // Filter & search items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search.trim() || item.title.toLowerCase().includes(search.toLowerCase())

      if (!matchesSearch) return false
      if (filter === 'UNWATCHED') return !item.completed
      if (filter === 'WATCHED') return item.completed
      return true
    })
  }, [items, search, filter])

  const unwatchedCount = items.filter((i) => !i.completed).length

  function formatDate(dStr: string) {
    try {
      const d = new Date(dStr)
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Tv size={16} className="text-rose-500" />
            <CardTitle>Watch Later</CardTitle>
            {unwatchedCount > 0 && (
              <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] py-0.5">
                {unwatchedCount} left
              </Badge>
            )}
          </div>
        </CardHeader>

        <div className="flex flex-1 flex-col justify-between p-4 pt-1 gap-3 overflow-hidden">
          {/* Add Video/Playlist Form */}
          <form onSubmit={handleAdd} className="space-y-1.5">
            <div className="flex gap-2">
              <input
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="Paste YouTube video or playlist link..."
                className={cn(
                  'flex-1 rounded-lg border bg-bg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent',
                  error ? 'border-danger/50' : 'border-border',
                )}
              />
              <Button size="sm" type="submit" disabled={adding || !urlInput.trim()} className="shrink-0 bg-rose-600 hover:bg-rose-500 text-white">
                {adding ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={13} /> Add
                  </>
                )}
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-danger animate-fadeIn">
                <AlertCircle size={13} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Search & Filter Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved videos..."
                className="w-full rounded-lg border border-border bg-bg pl-7 pr-3 py-1 text-[11px] text-text-primary placeholder:text-text-secondary focus:border-accent"
              />
            </div>

            <div className="flex gap-1">
              {(['UNWATCHED', 'WATCHED'] as FilterTab[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                    filter === f
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'text-text-secondary hover:text-text-primary',
                  )}
                >
                  {f === 'UNWATCHED' ? 'To Watch' : 'Watched'}
                </button>
              ))}
            </div>
          </div>

          {/* Videos / Playlists List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="flex-1 animate-pulse" />
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center text-text-secondary">
                <Film size={22} className="opacity-30 mb-1.5" />
                <p className="text-xs">No videos in watch later.</p>
                <p className="text-[11px] text-text-secondary/70 mt-0.5">Paste a YouTube link above to save for later.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'group flex items-start gap-3 rounded-lg border border-border/60 bg-surface-elevated/40 p-2 transition-all hover:border-rose-500/40',
                    item.completed && 'opacity-70 bg-surface-elevated/20',
                  )}
                >
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className={cn(
                      'mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                      item.completed
                        ? 'border-rose-500 bg-rose-500 text-white'
                        : 'border-border hover:border-rose-500',
                    )}
                    title={item.completed ? 'Mark as unwatched' : 'Mark as watched'}
                  >
                    {item.completed && <Check size={12} strokeWidth={3} />}
                  </button>

                  {/* Video Thumbnail */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block w-20 h-12 rounded overflow-hidden shrink-0 border border-border/80 group-hover:scale-105 transition-transform"
                    title="Watch on YouTube"
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={14} className="text-white fill-white" />
                    </div>
                    {item.type === 'playlist' && (
                      <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 py-0.2 text-[8px] font-bold text-white flex items-center gap-0.5">
                        <ListVideo size={8} /> Playlist
                      </span>
                    )}
                  </a>

                  {/* Title and Metadata */}
                  <div className="min-w-0 flex-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'block text-xs font-semibold hover:text-rose-400 transition-colors line-clamp-2 leading-snug',
                        item.completed ? 'text-text-secondary line-through' : 'text-text-primary',
                      )}
                    >
                      {item.title}
                    </a>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-text-secondary">
                      <span>{formatDate(item.createdAt)}</span>
                      {item.completed && (
                        <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
                          <CheckCircle2 size={10} /> Watched
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-text-secondary hover:text-rose-400 hover:bg-surface-elevated transition-colors"
                      title="Open in YouTube"
                    >
                      <ExternalLink size={12} />
                    </a>
                    <IconButton
                      icon={<Trash2 size={12} />}
                      label="Remove"
                      onClick={() => setDeletingItem(item)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deletingItem)}
        title="Remove from Watch Later?"
        message="Are you sure you want to remove this video from your watch later list?"
        itemName={deletingItem?.title || ''}
        confirmLabel="Remove video"
        onConfirm={async () => {
          if (deletingItem) {
            await remove(deletingItem.id)
            setDeletingItem(null)
          }
        }}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  )
}
