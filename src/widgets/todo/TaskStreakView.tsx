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

export function TaskStreakView({ todos }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null)

  const current = useMemo(() => currentStreak(todos), [todos])
  const longest = useMemo(() => longestStreak(todos), [todos])
  const total = useMemo(() => totalCompletedTasks(todos), [todos])
  const weeks = useMemo(() => generateHeatmapGrid(todos, 52), [todos])

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
        return 'bg-emerald-950 border-emerald-800 text-emerald-300'
      case 2:
        return 'bg-emerald-700 border-emerald-600 text-emerald-100'
      case 3:
        return 'bg-emerald-500 border-emerald-400 text-white'
      case 4:
        return 'bg-emerald-400 border-emerald-300 text-white'
      case 0:
      default:
        return 'bg-surface-elevated/70 border-border/40 hover:border-text-secondary/40'
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

  const totalCols = Math.max(weeks.length, 1)

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

      {/* Heatmap Section - 100% Full Width */}
      <div className="rounded-lg border border-border bg-surface-elevated/30 p-3 w-full">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-text-secondary">Last 12 Months Activity</span>
          {hoveredDay && (
            <span className="text-xs font-semibold text-text-primary">
              {hoveredDay.isFuture
                ? 'Future'
                : `${hoveredDay.count} task${hoveredDay.count === 1 ? '' : 's'} on ${formatDisplayDate(hoveredDay.date)}`}
            </span>
          )}
        </div>

        {/* Heatmap full-width container */}
        <div className="flex flex-col gap-1.5 w-full select-none">
          {/* Month labels spanning 100% width */}
          <div className="flex text-[10px] text-text-secondary h-3.5 relative pl-6 pr-1 w-full overflow-hidden">
            <div className="relative w-full h-full">
              {weeks.map((w, idx) => {
                if (!w.monthLabel) return null
                const leftPercent = (idx / totalCols) * 100
                return (
                  <span
                    key={idx}
                    style={{ left: `${leftPercent}%` }}
                    className="absolute font-medium transform -translate-x-1 whitespace-nowrap text-[9px] sm:text-[10px]"
                  >
                    {w.monthLabel}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Grid rows with weekday labels and responsive cells */}
          <div className="flex gap-1.5 items-center w-full">
            {/* Day of Week Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between h-full text-[9px] text-text-secondary w-5 shrink-0 font-mono leading-none py-0.5 select-none">
              <span className="opacity-0">.</span>
              <span>Mon</span>
              <span className="opacity-0">.</span>
              <span>Wed</span>
              <span className="opacity-0">.</span>
              <span>Fri</span>
              <span className="opacity-0">.</span>
            </div>

            {/* Responsive Heatmap Columns spanning full width */}
            <div className="flex flex-1 gap-[2px] sm:gap-[3px] w-full">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-1 flex-col gap-[2px] sm:gap-[3px] min-w-0">
                  {week.days.map((day) => {
                    const isSelected = selectedDate === day.date
                    const isHovered = hoveredDay?.date === day.date

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
                          'w-full aspect-square rounded-[2px] border transition-all cursor-pointer',
                          getLevelClass(day.level, day.isFuture),
                          day.isToday && 'ring-1 ring-accent ring-offset-1 ring-offset-bg',
                          isSelected && 'scale-150 ring-2 ring-white z-20 shadow-md',
                          isHovered && !isSelected && 'scale-125 z-10',
                        )}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-text-secondary">
          <span>Click a day to view completions</span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            <span className="h-2 w-2 rounded-[2px] border border-border/40 bg-surface-elevated/70" />
            <span className="h-2 w-2 rounded-[2px] border border-emerald-800 bg-emerald-950" />
            <span className="h-2 w-2 rounded-[2px] border border-emerald-600 bg-emerald-700" />
            <span className="h-2 w-2 rounded-[2px] border border-emerald-400 bg-emerald-500" />
            <span className="h-2 w-2 rounded-[2px] border border-emerald-300 bg-emerald-400" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="mt-3 rounded-lg border border-border bg-surface-elevated/40 p-3 animate-fadeIn">
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
