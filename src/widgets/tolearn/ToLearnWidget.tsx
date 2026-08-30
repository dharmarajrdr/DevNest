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
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Trash2,
  Trophy,
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
type TopicFilter = 'IN_PROGRESS' | 'TO_LEARN'

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
  const [filter, setFilter] = useState<TopicFilter>('IN_PROGRESS')
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

  // Detail Modal for clicked Badge in Skills tab
  const [selectedSkillBadge, setSelectedSkillBadge] = useState<LearnTopic | null>(null)

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

  // Active uncompleted topics
  const activeUncompletedTopics = useMemo(() => {
    return topics.filter((t) => t.status !== 'COMPLETED')
  }, [topics])

  // Filtered active topics for Topics tab
  const filteredActiveTopics = useMemo(() => {
    return activeUncompletedTopics.filter((t) => {
      const matchSearch =
        !search.trim() ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.toLowerCase().includes(search.toLowerCase()) ||
        t.notes?.toLowerCase().includes(search.toLowerCase())

      if (!matchSearch) return false
      if (filter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS'
      return t.status === filter
    })
  }, [activeUncompletedTopics, search, filter])

  // Completed topics for Skills tab
  const completedSkills = useMemo(() => {
    return topics.filter((t) => t.status === 'COMPLETED')
  }, [topics])

  const totalCount = topics.length
  const completedCount = completedSkills.length
  const uncompletedCount = activeUncompletedTopics.length
  const masteryPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  function formatCompletedDate(dStr?: string) {
    if (!dStr) return 'Earned recently'
    try {
      const d = new Date(dStr)
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return 'Earned recently'
    }
  }

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-accent" />
            <CardTitle>To Learn</CardTitle>

            {/* View Switcher: Topics (Uncompleted) vs Skills (Earned Badges) */}
            <div className="flex rounded-md border border-border bg-surface-elevated/40 p-0.5 ml-2">
              <button
                onClick={() => setActiveTab('topics')}
                className={cn(
                  'flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                  activeTab === 'topics'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                <BookOpen size={11} /> Topics ({uncompletedCount})
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={cn(
                  'flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                  activeTab === 'skills'
                    ? 'bg-amber-500 text-white shadow-sm font-bold'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                <Trophy size={11} /> Skills Badges ({completedCount})
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
          /* Topics List View (Active / Uncompleted Topics Only) */
          <div className="flex flex-1 flex-col justify-between p-4 pt-1 gap-3 overflow-hidden">
            {/* Search & Filter Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search active topics (Docker, Kubernetes)..."
                  className="w-full rounded-lg border border-border bg-bg pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent"
                />
              </div>

              {/* Status Filters */}
              <div className="flex gap-1">
                {(['IN_PROGRESS', 'TO_LEARN'] as TopicFilter[]).map((f) => (
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
                    {f === 'IN_PROGRESS' ? 'Learning' : 'To Learn'}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Topics List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredActiveTopics.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
                    <Sparkles size={22} />
                  </div>
                  <h4 className="text-xs font-bold text-text-primary">
                    {uncompletedCount === 0 ? 'All Topics Completed! 🎉' : 'No matching topics'}
                  </h4>
                  <p className="text-[11px] text-text-secondary mt-1 max-w-xs">
                    {uncompletedCount === 0
                      ? 'You have completed all added topics and earned your badges! Visit the Skills tab to view your rewards.'
                      : 'Try adjusting your search or filter.'}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {uncompletedCount === 0 && (
                      <Button size="sm" variant="secondary" onClick={() => setActiveTab('skills')}>
                        <Trophy size={13} className="text-amber-400" /> View Earned Badges
                      </Button>
                    )}
                    <Button size="sm" onClick={handleOpenCreate}>
                      <Plus size={13} /> Add New Topic
                    </Button>
                  </div>
                </div>
              ) : (
                filteredActiveTopics.map((t) => {
                  const lvl = LEVEL_COLORS[t.level]

                  return (
                    <div
                      key={t.id}
                      className="group flex items-start gap-3 rounded-lg border border-border/70 bg-surface-elevated/40 p-2.5 transition-all hover:border-accent/40"
                    >
                      {/* Checkbox to Mark Completed -> Moves to Skills Badges */}
                      <button
                        onClick={() => toggleComplete(t.id)}
                        className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all',
                          t.status === 'IN_PROGRESS'
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 hover:bg-emerald-500/20 hover:border-emerald-500'
                            : 'border-border hover:border-emerald-500 hover:bg-emerald-500/10',
                        )}
                        title="Mark as Completed (Earn Badge in Skills tab)"
                      >
                        {t.status === 'IN_PROGRESS' ? <Clock size={11} /> : null}
                      </button>

                      {/* Topic Main Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base select-none">{t.icon || '🚀'}</span>
                          <span className="text-xs font-bold text-text-primary">
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
                        <button
                          onClick={() => toggleComplete(t.id)}
                          className="rounded px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                          title="Mark as Completed"
                        >
                          <Check size={11} strokeWidth={3} /> Complete
                        </button>
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
          /* Skills / Earned Badges & Rewards Tab */
          <div className="flex flex-1 flex-col justify-between p-4 pt-1 gap-3 overflow-hidden">
            {/* Gamification / Rewards Banner */}
            <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-surface-elevated/40 p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
                  <Trophy size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <span>Acquired Skills & Rewards</span>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[9px] py-0">
                      {completedCount * 100} XP
                    </Badge>
                  </h4>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {completedCount} of {totalCount} total skills mastered ({masteryPercentage}%)
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                  Badges Earned
                </span>
                <span className="font-mono text-base font-bold text-amber-400">
                  {completedCount} 🏅
                </span>
              </div>
            </div>

            {/* Earned Badges Grid Showcase */}
            <div className="flex-1 overflow-y-auto pr-1">
              {completedSkills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-text-secondary mb-2">
                    <Award size={24} className="opacity-40" />
                  </div>
                  <h4 className="text-xs font-bold text-text-primary">No Skill Badges Earned Yet</h4>
                  <p className="text-[11px] text-text-secondary mt-1 max-w-xs">
                    Complete learning topics in the Topics tab to unlock your shiny achievement badges and track your mastery here!
                  </p>
                  <Button size="sm" onClick={() => setActiveTab('topics')} className="mt-3">
                    <BookOpen size={13} /> View Topics to Learn
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {completedSkills.map((t) => {
                    const lvl = LEVEL_COLORS[t.level]

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedSkillBadge(t)}
                        className="group relative rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-surface-elevated/60 to-surface-elevated/40 p-3.5 flex flex-col justify-between gap-3 cursor-pointer transition-all hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10 select-none shadow-sm"
                        title="Click to view skill details"
                      >
                        {/* Top Badge Tier & Star */}
                        <div className="flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated border border-amber-500/30 text-2xl shadow-inner transition-transform">
                            {t.icon || '🚀'}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="flex items-center gap-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 text-[9px] font-bold text-amber-400 shadow-sm">
                              <Star size={9} className="fill-amber-400" /> Mastered
                            </span>
                            <Badge className={cn('text-[8px] px-1 py-0', lvl.bg, lvl.text, lvl.border)}>
                              {t.level}
                            </Badge>
                          </div>
                        </div>

                        {/* Title and Category */}
                        <div>
                          <h4 className="text-xs font-bold text-text-primary truncate">{t.title}</h4>
                          <span className="text-[10px] text-text-secondary block truncate mt-0.5">
                            {t.category || 'Core Skill'}
                          </span>
                        </div>

                        {/* Footer info: Click hint & Date */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-text-secondary">
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 size={11} /> {formatCompletedDate(t.completedAt)}
                          </span>
                          <span className="text-[9px] text-accent opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                            Details →
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Skill Badge Details Modal */}
      <Modal
        open={Boolean(selectedSkillBadge)}
        onClose={() => setSelectedSkillBadge(null)}
        title="Skill Badge & Reward"
        maxWidth="max-w-md"
      >
        {selectedSkillBadge && (
          <div className="space-y-4">
            {/* Header Hero */}
            <div className="flex items-center gap-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-surface-elevated/40 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-amber-500/40 text-3xl shadow-md">
                {selectedSkillBadge.icon || '🚀'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text-primary truncate">
                    {selectedSkillBadge.title}
                  </h3>
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                    <Star size={10} className="fill-amber-400" /> Mastered
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <Badge
                    className={cn(
                      'text-[10px] px-2 py-0.5',
                      LEVEL_COLORS[selectedSkillBadge.level].bg,
                      LEVEL_COLORS[selectedSkillBadge.level].text,
                      LEVEL_COLORS[selectedSkillBadge.level].border,
                    )}
                  >
                    {selectedSkillBadge.level}
                  </Badge>
                  <span className="text-text-secondary">
                    {selectedSkillBadge.category || 'General Skill'}
                  </span>
                </div>
              </div>
            </div>

            {/* Achievement Timestamp */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated/40 px-3.5 py-2.5 text-xs text-text-secondary">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 size={13} /> Completed & Badge Unlocked
              </span>
              <span className="font-mono text-text-primary">
                {formatCompletedDate(selectedSkillBadge.completedAt)}
              </span>
            </div>

            {/* Roadmap / Notes */}
            {selectedSkillBadge.notes && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-text-primary">Roadmap & Learned Concepts</span>
                <div className="rounded-lg border border-border bg-bg p-3 text-xs text-text-secondary leading-relaxed">
                  {selectedSkillBadge.notes}
                </div>
              </div>
            )}

            {/* Resource Documentation Link */}
            {selectedSkillBadge.resourceLink && (
              <div className="pt-1">
                <a
                  href={selectedSkillBadge.resourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-3.5 py-2 text-xs font-semibold text-accent hover:bg-accent/20 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <ExternalLink size={13} /> Open Documentation & Resources
                  </span>
                  <span>↗</span>
                </a>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (selectedSkillBadge) {
                    await toggleComplete(selectedSkillBadge.id)
                    setSelectedSkillBadge(null)
                  }
                }}
                className="text-xs text-text-secondary hover:text-amber-400"
              >
                <RotateCcw size={12} /> Move back to Topics
              </Button>

              <Button type="button" size="sm" onClick={() => setSelectedSkillBadge(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
