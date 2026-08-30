import { useEffect, useMemo, useState } from 'react'
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { IconButton } from '@/components/ui/IconButton'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToLearnStore } from '@/store/useToLearnStore'
import type { LearnStatus, LearnTopic, SkillLevel } from '@/types'
import { cn } from '@/utils/cn'

type ViewTab = 'topics' | 'skills'
type FilterTab = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'TO_LEARN'

const LEVEL_COLORS: Record<SkillLevel, { bg: string; text: string; border: string }> = {
  BEGINNER: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  INTERMEDIATE: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  ADVANCED: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  EXPERT: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
}

const COMMON_EMOJIS = ['🐳', '☸️', '📊', '🔷', '🦀', '🐹', '🐍', '⚛️', '☁️', '🐧', '⚡', '🚀', '🧠', '🛡️', '📦']

export function ToLearnWidget() {
  const { topics, loading, load, create, update, toggleComplete, remove } = useToLearnStore()
  const [activeTab, setActiveTab] = useState<ViewTab>('topics')
  const [filter, setFilter] = useState<FilterTab>('ALL')
  const [search, setSearch] = useState('')

  // Add / Edit modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<LearnTopic | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState<SkillLevel>('BEGINNER')
  const [status, setStatus] = useState<LearnStatus>('TO_LEARN')
  const [icon, setIcon] = useState('🚀')
  const [resourceLink, setResourceLink] = useState('')
  const [notes, setNotes] = useState('')

  // Delete confirm modal state
  const [deletingTopic, setDeletingTopic] = useState<LearnTopic | null>(null)

  useEffect(() => {
    load()
  }, [load])

  function handleOpenCreate() {
    setEditingTopic(null)
    setTitle('')
    setCategory('')
    setLevel('BEGINNER')
    setStatus('TO_LEARN')
    setIcon('🚀')
    setResourceLink('')
    setNotes('')
    setModalOpen(true)
  }

  function handleOpenEdit(t: LearnTopic) {
    setEditingTopic(t)
    setTitle(t.title)
    setCategory(t.category || '')
    setLevel(t.level)
    setStatus(t.status)
    setIcon(t.icon || '🚀')
    setResourceLink(t.resourceLink || '')
    setNotes(t.notes || '')
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    let formattedLink = resourceLink.trim()
    if (formattedLink && !/^https?:\/\//i.test(formattedLink)) {
      formattedLink = `https://${formattedLink}`
    }

    const payload = {
      title: title.trim(),
      category: category.trim() || undefined,
      level,
      status,
      icon: icon.trim() || '🚀',
      resourceLink: formattedLink || undefined,
      notes: notes.trim() || undefined,
    }

    if (editingTopic) {
      await update(editingTopic.id, payload)
    } else {
      await create(payload)
    }
    setModalOpen(false)
  }

  // Filtered topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchSearch =
        !search.trim() ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.toLowerCase().includes(search.toLowerCase()) ||
        t.notes?.toLowerCase().includes(search.toLowerCase())

      if (!matchSearch) return false
      if (filter === 'ALL') return true
      return t.status === filter
    })
  }, [topics, search, filter])

  // Metrics
  const totalCount = topics.length
  const completedCount = topics.filter((t) => t.status === 'COMPLETED').length
  const masteryPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-accent" />
            <CardTitle>To Learn</CardTitle>

            {/* View Switcher: Topics vs Skills */}
            <div className="flex rounded-md border border-border bg-surface-elevated/40 p-0.5 ml-2">
              <button
                onClick={() => setActiveTab('topics')}
                className={cn(
                  'flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors',
                  activeTab === 'topics'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                <BookOpen size={11} /> Topics ({totalCount})
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={cn(
                  'flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors',
                  activeTab === 'skills'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                <Award size={11} /> Skills Grid ({completedCount}/{totalCount})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <IconButton icon={<Plus size={15} />} label="Add Topic" onClick={handleOpenCreate} />
          </div>
        </CardHeader>

        {loading ? (
          <div className="flex-1 animate-pulse p-4" />
        ) : activeTab === 'topics' ? (
          /* Topics List View */
          <div className="flex flex-1 flex-col justify-between p-4 pt-1 gap-3 overflow-hidden">
            {/* Search & Filter Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search topics (e.g. Docker, Grafana)..."
                  className="w-full rounded-lg border border-border bg-bg pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent"
                />
              </div>

              {/* Status Filters */}
              <div className="flex gap-1">
                {(['ALL', 'IN_PROGRESS', 'COMPLETED'] as FilterTab[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      'rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                      filter === f
                        ? 'bg-accent/15 text-accent border border-accent/30'
                        : 'text-text-secondary hover:text-text-primary',
                    )}
                  >
                    {f === 'ALL' ? 'All' : f === 'IN_PROGRESS' ? 'Learning' : 'Mastered'}
                  </button>
                ))}
              </div>
            </div>

            {/* Topics Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredTopics.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-36 text-center text-text-secondary">
                  <Target size={24} className="opacity-30 mb-2" />
                  <p className="text-xs">No learning topics found.</p>
                  <p className="text-[11px] text-text-secondary/70 mt-0.5">Click "+" to add a skill you want to learn.</p>
                </div>
              ) : (
                filteredTopics.map((t) => {
                  const isDone = t.status === 'COMPLETED'
                  const lvl = LEVEL_COLORS[t.level]

                  return (
                    <div
                      key={t.id}
                      className={cn(
                        'group flex items-start gap-3 rounded-lg border border-border/60 bg-surface-elevated/40 p-2.5 transition-all hover:border-accent/40',
                        isDone && 'opacity-80 bg-surface-elevated/20',
                      )}
                    >
                      {/* Status Toggle Checkbox */}
                      <button
                        onClick={() => toggleComplete(t.id)}
                        className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                          isDone
                            ? 'border-accent bg-accent text-white'
                            : t.status === 'IN_PROGRESS'
                              ? 'border-amber-500/50 bg-amber-500/10 text-amber-500'
                              : 'border-border hover:border-accent',
                        )}
                        title={isDone ? 'Mark as learning' : 'Mark as mastered'}
                      >
                        {isDone ? <Check size={12} strokeWidth={3} /> : t.status === 'IN_PROGRESS' ? <Clock size={11} /> : null}
                      </button>

                      {/* Topic Main Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base select-none">{t.icon || '🚀'}</span>
                          <span className={cn('text-xs font-bold', isDone ? 'text-text-secondary line-through' : 'text-text-primary')}>
                            {t.title}
                          </span>
                          <Badge className={cn('text-[9px] px-1.5 py-0.2', lvl.bg, lvl.text, lvl.border)}>
                            {t.level}
                          </Badge>
                          {t.category && (
                            <span className="text-[10px] text-text-secondary/80">
                              • {t.category}
                            </span>
                          )}
                          {t.resourceLink && (
                            <a
                              href={t.resourceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent/80 hover:text-accent p-0.5 hover:bg-accent/10 rounded transition-colors inline-flex items-center"
                              title="Open resource documentation"
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>

                        {t.notes && (
                          <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                            {t.notes}
                          </p>
                        )}
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconButton icon={<Pencil size={12} />} label="Edit topic" onClick={() => handleOpenEdit(t)} />
                        <IconButton icon={<Trash2 size={12} />} label="Delete topic" onClick={() => setDeletingTopic(t)} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          /* Skills Badges Grid View */
          <div className="flex flex-1 flex-col justify-between p-4 pt-1 gap-3 overflow-hidden">
            {/* Progress / Mastery Overview */}
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-text-primary">
                  <Sparkles size={14} className="text-accent" />
                  <span>Skills Mastery Journey</span>
                </div>
                <span className="font-mono font-bold text-accent">
                  {completedCount} / {totalCount} Acquired ({masteryPercentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden border border-border">
                <div
                  style={{ width: `${masteryPercentage}%` }}
                  className="h-full bg-accent transition-all duration-500 rounded-full shadow-sm shadow-accent/50"
                />
              </div>
            </div>

            {/* Skills Badges Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 pr-1">
              {topics.map((t) => {
                const isAcquired = t.status === 'COMPLETED'
                const lvl = LEVEL_COLORS[t.level]

                return (
                  <div
                    key={t.id}
                    onClick={() => toggleComplete(t.id)}
                    className={cn(
                      'group relative rounded-xl border p-3 flex flex-col justify-between gap-2 cursor-pointer transition-all hover:scale-[1.02] shadow-sm select-none',
                      isAcquired
                        ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60'
                        : t.status === 'IN_PROGRESS'
                          ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60'
                          : 'border-border bg-surface-elevated/40 hover:border-accent/40',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-2xl drop-shadow-sm">{t.icon || '🚀'}</span>
                      <Badge className={cn('text-[9px] px-1.5 py-0.5', lvl.bg, lvl.text, lvl.border)}>
                        {t.level}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-text-primary truncate">{t.title}</h4>
                      <span className="text-[10px] text-text-secondary block truncate mt-0.5">
                        {t.category || 'General Skill'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                      <span
                        className={cn(
                          'font-semibold flex items-center gap-1',
                          isAcquired ? 'text-emerald-400' : t.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-text-secondary',
                        )}
                      >
                        {isAcquired ? (
                          <>
                            <CheckCircle2 size={11} /> Mastered
                          </>
                        ) : t.status === 'IN_PROGRESS' ? (
                          <>
                            <Clock size={11} /> In Progress
                          </>
                        ) : (
                          <>
                            <Target size={11} /> To Learn
                          </>
                        )}
                      </span>

                      {t.resourceLink && (
                        <a
                          href={t.resourceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-text-secondary hover:text-accent"
                          title="Open Resource"
                        >
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Topic Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTopic ? 'Edit Topic' : 'Add Learning Topic'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="topic-title" className="mb-1 block text-xs font-semibold text-text-primary">
              Topic / Skill Name
            </label>
            <input
              id="topic-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Docker, Kubernetes, Grafana, Rust..."
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="topic-category" className="mb-1 block text-xs font-semibold text-text-primary">
                Category
              </label>
              <input
                id="topic-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. DevOps, Cloud..."
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="topic-level" className="mb-1 block text-xs font-semibold text-text-primary">
                Skill Level
              </label>
              <select
                id="topic-level"
                value={level}
                onChange={(e) => setLevel(e.target.value as SkillLevel)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text-primary focus:border-accent"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-text-primary">
              Choose Icon Badge
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_EMOJIS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setIcon(em)}
                  className={cn(
                    'h-8 w-8 rounded-lg border text-base flex items-center justify-center transition-all',
                    icon === em
                      ? 'border-accent bg-accent/20 scale-110 shadow-sm'
                      : 'border-border bg-surface-elevated/40 hover:bg-surface-elevated',
                  )}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="topic-link" className="mb-1 block text-xs font-semibold text-text-primary">
              Documentation / Resource Link (Optional)
            </label>
            <input
              id="topic-link"
              value={resourceLink}
              onChange={(e) => setResourceLink(e.target.value)}
              placeholder="e.g. https://kubernetes.io/docs/"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="topic-notes" className="mb-1 block text-xs font-semibold text-text-primary">
              Learning Notes / Roadmap
            </label>
            <textarea
              id="topic-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key concepts to learn, commands, or roadmap milestones..."
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {editingTopic ? 'Save Changes' : 'Add Topic'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deletingTopic)}
        title="Delete learning topic?"
        message="Are you sure you want to remove this topic from your learning roadmap?"
        itemName={deletingTopic?.title || ''}
        confirmLabel="Delete topic"
        onConfirm={async () => {
          if (deletingTopic) {
            await remove(deletingTopic.id)
            setDeletingTopic(null)
          }
        }}
        onCancel={() => setDeletingTopic(null)}
      />
    </>
  )
}
