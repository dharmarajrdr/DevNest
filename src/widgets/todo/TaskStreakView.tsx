import { useMemo, useState } from 'react'
import { CheckCircle2, Flame, Trophy, Calendar } from 'lucide-react'
import type { Todo } from '@/types'
import {
  currentStreak,
  longestStreak,
  totalCompletedTasks,
  generateHeatmapGrid,
  type HeatmapDay,
} from '@/utils/productivity'
import { cn } from '@/utils/cn'

interface Props {
  todos: Todo[]
}

const DISPLAY_WEEKDAYS = [
  { index: 1, label: 'M' },
  { index: 3, label: 'W' },
  { index: 5, label: 'F' },
]

export function TaskStreakView({ todos }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null)

  const current = useMemo(() => currentStreak(todos), [todos])
  const longest = useMemo(() => longestStreak(todos), [todos])
  const total = useMemo(() => totalCompletedTasks(todos), [todos])
  const weeks = useMemo(() => generateHeatmapGrid(todos, 20), [todos])

  const selectedTasks = useMemo(() => {
    if (!selectedDate) return []
    return todos.filter(
      (t) => t.status === 'COMPLETED' && t.completedAt && t.completedAt.slice(0, 10) === selectedDate,
    )
  }, [todos, selectedDate])

  function getLevelClass(level: number, isFuture: boolean): string {
    if (isFuture) return 'bg-surface-elevated/20 opacity-30 border-transparent cursor-default'
    switch (level) {
      case 1:
        return 'bg-emerald-500/30 border-emerald-500/40 hover:border-emerald-400'
      case 2:
        return 'bg-emerald-500/60 border-emerald-500/70 hover:border-emerald-300'
      case 3:
        return 'bg-emerald-500/85 border-emerald-400 hover:border-emerald-200'
      case 4:
        return 'bg-emerald-500 border-emerald-300 hover:border-white shadow-sm'
      case 0:
      default:
        return 'bg-surface-elevated/70 border-border/50 hover:border-text-secondary/40'
    }
  }

  function formatDisplayDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number)
    const date = new Date(Date.UTC(y, m - 1, d))
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3 text-text-primary">
      {/* Stats row */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-elevated/40 p-2.5 text-center">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Flame size={16} className="fill-amber-500/20" />
            <span className="text-base font-bold">{current}</span>
          </div>
          <span className="text-[10px] text-text-secondary">Current Streak</span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-elevated/40 p-2.5 text-center">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Trophy size={15} />
            <span className="text-base font-bold">{longest}</span>
          </div>
          <span className="text-[10px] text-text-secondary">Longest Streak</span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-elevated/40 p-2.5 text-center">
          <div className="flex items-center gap-1.5 text-emerald-500">
            <CheckCircle2 size={15} />
            <span className="text-base font-bold">{total}</span>
          </div>
          <span className="text-[10px] text-text-secondary">Total Done</span>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="rounded-lg border border-border bg-surface-elevated/30 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-text-secondary">Activity Heatmap</span>
          {hoveredDay && (
            <span className="text-[11px] font-medium text-text-primary">
              {hoveredDay.isFuture
                ? 'Future'
                : `${hoveredDay.count} task${hoveredDay.count === 1 ? '' : 's'} on ${formatDisplayDate(hoveredDay.date)}`}
            </span>
          )}
        </div>

        {/* Heatmap container */}
        <div className="overflow-x-auto pb-1">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex text-[9px] text-text-secondary">
              <div className="w-4 shrink-0" />
              <div className="flex gap-1">
                {weeks.map((w, wIdx) => (
                  <div key={wIdx} className="w-3 text-left">
                    {w.monthLabel ? (
                      <span className="truncate whitespace-nowrap">{w.monthLabel}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid rows */}
            <div className="flex gap-1.5 pt-1">
              {/* Day labels on side */}
              <div className="flex flex-col justify-between py-0.5 text-[9px] text-text-secondary">
                {DISPLAY_WEEKDAYS.map((d) => (
                  <span key={d.index} className="h-3 leading-3">
                    {d.label}
                  </span>
                ))}
              </div>

              {/* Day cells by week columns */}
              <div className="flex gap-1">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1">
                    {week.days.map((day) => {
                      const isSelected = selectedDate === day.date
                      return (
                        <button
                          key={day.date}
                          type="button"
                          disabled={day.isFuture}
                          onClick={() => setSelectedDate(isSelected ? null : day.date)}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          title={
                            day.isFuture
                              ? `Future date (${formatDisplayDate(day.date)})`
                              : `${day.count} completed task${day.count === 1 ? '' : 's'} on ${formatDisplayDate(day.date)}`
                          }
                          className={cn(
                            'h-3 w-3 rounded-sm border transition-all',
                            getLevelClass(day.level, day.isFuture),
                            day.isToday && 'ring-1 ring-accent ring-offset-1 ring-offset-bg',
                            isSelected && 'scale-125 ring-2 ring-white z-10',
                          )}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-text-secondary">
          <span>Click a day to view completions</span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            <span className="h-2.5 w-2.5 rounded-sm border border-border/50 bg-surface-elevated/70" />
            <span className="h-2.5 w-2.5 rounded-sm border border-emerald-500/40 bg-emerald-500/30" />
            <span className="h-2.5 w-2.5 rounded-sm border border-emerald-500/70 bg-emerald-500/60" />
            <span className="h-2.5 w-2.5 rounded-sm border border-emerald-400 bg-emerald-500/85" />
            <span className="h-2.5 w-2.5 rounded-sm border border-emerald-300 bg-emerald-500" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="mt-3 rounded-lg border border-border bg-surface-elevated/40 p-3">
          <div className="mb-2 flex items-center justify-between border-b border-border/50 pb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <Calendar size={13} className="text-accent" />
              <span>{formatDisplayDate(selectedDate)}</span>
            </div>
            <span className="text-[11px] text-text-secondary">
              {selectedTasks.length} task{selectedTasks.length === 1 ? '' : 's'} completed
            </span>
          </div>

          {selectedTasks.length === 0 ? (
            <p className="py-2 text-center text-xs text-text-secondary">
              No tasks completed on this date.
            </p>
          ) : (
            <div className="space-y-1.5">
              {selectedTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md bg-bg/50 px-2.5 py-1.5 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span className="truncate font-medium text-text-primary">{t.title}</span>
                  </div>
                  {t.completedAt && (
                    <span className="shrink-0 text-[10px] text-text-secondary">
                      {new Date(t.completedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
