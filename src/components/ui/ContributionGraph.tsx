import { useMemo, useState } from 'react'
import { cn } from '@/utils/cn'

export interface HeatmapDay {
  date: string // "YYYY-MM-DD"
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface Props {
  days: HeatmapDay[]
  theme?: 'github' | 'leetcode'
  weeksToShow?: number
  className?: string
}

const GITHUB_LEVEL_COLORS = [
  'bg-surface-elevated/70 border-border/40', // 0
  'bg-emerald-950 border-emerald-800 text-emerald-300', // 1
  'bg-emerald-700 border-emerald-600 text-emerald-100', // 2
  'bg-emerald-500 border-emerald-400 text-white', // 3
  'bg-emerald-400 border-emerald-300 text-white', // 4
]

const LEETCODE_LEVEL_COLORS = [
  'bg-surface-elevated/70 border-border/40', // 0
  'bg-amber-950 border-amber-900 text-amber-300', // 1
  'bg-amber-700 border-amber-600 text-amber-100', // 2
  'bg-amber-500 border-amber-400 text-white', // 3
  'bg-amber-400 border-amber-300 text-white', // 4
]

export function ContributionGraph({
  days,
  theme = 'github',
  weeksToShow = 20,
  className,
}: Props) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null)

  // Organize days into 7 rows x N weeks
  const { weeks, monthLabels } = useMemo(() => {
    if (!days || days.length === 0) return { weeks: [], monthLabels: [] }

    const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
    const totalDays = sorted.length
    const sliceCount = Math.min(totalDays, weeksToShow * 7)
    const recentDays = sorted.slice(-sliceCount)

    const cols: HeatmapDay[][] = []
    let currentWeek: HeatmapDay[] = []

    for (const d of recentDays) {
      currentWeek.push(d)
      if (currentWeek.length === 7) {
        cols.push(currentWeek)
        currentWeek = []
      }
    }
    if (currentWeek.length > 0) {
      cols.push(currentWeek)
    }

    // Determine month positions
    const months: { label: string; colIndex: number }[] = []
    let lastMonth = ''

    cols.forEach((col, cIdx) => {
      const firstInCol = col[0]
      if (firstInCol) {
        const monthName = new Date(firstInCol.date + 'T00:00:00').toLocaleString('default', {
          month: 'short',
        })
        if (monthName !== lastMonth) {
          months.push({ label: monthName, colIndex: cIdx })
          lastMonth = monthName
        }
      }
    })

    return { weeks: cols, monthLabels: months }
  }, [days, weeksToShow])

  const colorPalette = theme === 'leetcode' ? LEETCODE_LEVEL_COLORS : GITHUB_LEVEL_COLORS

  function formatDate(dStr: string) {
    try {
      const d = new Date(dStr + 'T00:00:00')
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dStr
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5 overflow-x-auto select-none', className)}>
      {/* Month Labels */}
      <div className="flex text-[10px] text-text-secondary h-4 relative pl-6">
        {monthLabels.map((m, idx) => (
          <span
            key={idx}
            style={{ position: 'absolute', left: `${m.colIndex * 13 + 24}px` }}
            className="font-medium"
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Graph Area with Weekday Labels */}
      <div className="flex gap-1 items-start">
        {/* Day of Week Labels (Mon, Wed, Fri) */}
        <div className="flex flex-col gap-1 text-[9px] text-text-secondary pr-1 font-mono leading-none pt-0.5">
          <span className="h-2.5"></span>
          <span className="h-2.5">Mon</span>
          <span className="h-2.5"></span>
          <span className="h-2.5">Wed</span>
          <span className="h-2.5"></span>
          <span className="h-2.5">Fri</span>
          <span className="h-2.5"></span>
        </div>

        {/* Heatmap Columns */}
        <div className="flex gap-1">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day) => {
                const isHovered = hoveredDay?.date === day.date
                return (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={cn(
                      'h-2.5 w-2.5 rounded-[2px] border transition-transform cursor-pointer',
                      colorPalette[day.level] || colorPalette[0],
                      isHovered && 'scale-125 z-10 border-text-primary',
                    )}
                    title={`${day.count} ${theme === 'leetcode' ? 'submissions' : 'contributions'} on ${formatDate(day.date)}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info & Legend */}
      <div className="flex items-center justify-between text-[10px] text-text-secondary pt-1 px-1">
        <div className="h-4">
          {hoveredDay ? (
            <span className="text-text-primary font-medium">
              {hoveredDay.count}{' '}
              {theme === 'leetcode' ? 'submissions' : 'contributions'} on{' '}
              {formatDate(hoveredDay.date)}
            </span>
          ) : (
            <span>Hover over any day for activity details</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span>Less</span>
          {colorPalette.map((cls, idx) => (
            <div key={idx} className={cn('h-2 w-2 rounded-[2px] border', cls)} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

