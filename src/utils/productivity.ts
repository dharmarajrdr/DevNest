import type { FocusSessionLogEntry, Todo } from '@/types'
import { isTodayTask, shiftISODate, todayISO } from './date'

function dateOf(iso: string): string {
  return iso.slice(0, 10)
}

export function tasksCompletedOn(todos: Todo[], dateISO: string): Todo[] {
  return todos.filter((t) => t.status === 'COMPLETED' && t.completedAt && dateOf(t.completedAt) === dateISO)
}

export function tasksCompletedInLast7Days(todos: Todo[]): number {
  const cutoff = shiftISODate(todayISO(), -6)
  return todos.filter((t) => t.status === 'COMPLETED' && t.completedAt && dateOf(t.completedAt) >= cutoff).length
}

export function focusMinutesOn(log: FocusSessionLogEntry[], dateISO: string): number {
  return log.filter((e) => dateOf(e.completedAt) === dateISO).reduce((sum, e) => sum + e.minutes, 0)
}

export function pomodoroSessionsOn(log: FocusSessionLogEntry[], dateISO: string): number {
  return log.filter((e) => dateOf(e.completedAt) === dateISO).length
}

/**
 * Consecutive days with at least one completed task, ending today (or
 * ending yesterday if today has no completions yet — so the streak
 * doesn't look broken to someone checking their dashboard in the morning
 * before they've completed anything).
 */
export function currentStreak(todos: Todo[]): number {
  const completedDates = new Set(
    todos.filter((t) => t.status === 'COMPLETED' && t.completedAt).map((t) => dateOf(t.completedAt!)),
  )

  let cursor = todayISO()
  if (!completedDates.has(cursor)) {
    cursor = shiftISODate(cursor, -1)
    if (!completedDates.has(cursor)) return 0
  }

  let streak = 0
  while (completedDates.has(cursor)) {
    streak++
    cursor = shiftISODate(cursor, -1)
  }
  return streak
}

/**
 * Longest consecutive streak of days with at least one completed task across all time.
 */
export function longestStreak(todos: Todo[]): number {
  const completedDates = Array.from(
    new Set(
      todos.filter((t) => t.status === 'COMPLETED' && t.completedAt).map((t) => dateOf(t.completedAt!)),
    ),
  ).sort()

  if (completedDates.length === 0) return 0

  let maxStreak = 1
  let current = 1

  for (let i = 1; i < completedDates.length; i++) {
    const expected = shiftISODate(completedDates[i - 1], 1)
    if (completedDates[i] === expected) {
      current++
      if (current > maxStreak) maxStreak = current
    } else {
      current = 1
    }
  }

  return maxStreak
}

export function totalCompletedTasks(todos: Todo[]): number {
  return todos.filter((t) => t.status === 'COMPLETED').length
}

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4

export function getHeatmapLevel(count: number): HeatmapLevel {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count === 3) return 3
  return 4
}

export interface HeatmapDay {
  date: string // YYYY-MM-DD
  count: number
  level: HeatmapLevel
  isToday: boolean
  isFuture: boolean
  dayOfWeek: number // 0 = Sun, 6 = Sat
}

export interface HeatmapWeek {
  days: HeatmapDay[]
  monthLabel?: string
}

/**
 * Generates weeks of heatmap data ending at the end of the current week.
 * @param todos Task list
 * @param numWeeks Number of weeks to display (default: 20)
 */
export function generateHeatmapGrid(todos: Todo[], numWeeks = 20): HeatmapWeek[] {
  const today = todayISO()
  const [y, m, d] = today.split('-').map(Number)
  const todayDate = new Date(Date.UTC(y, m - 1, d))
  const todayDayOfWeek = todayDate.getUTCDay() // 0 = Sun

  // Days to the end of the current week (Saturday = 6)
  const daysToEndOfWeek = 6 - todayDayOfWeek
  const gridEndDate = shiftISODate(today, daysToEndOfWeek)

  // Start date is numWeeks * 7 - 1 days before gridEndDate
  const totalDays = numWeeks * 7
  const gridStartDate = shiftISODate(gridEndDate, -(totalDays - 1))

  // Map counts
  const countsByDate = new Map<string, number>()
  for (const todo of todos) {
    if (todo.status === 'COMPLETED' && todo.completedAt) {
      const dateKey = dateOf(todo.completedAt)
      countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1)
    }
  }

  const weeks: HeatmapWeek[] = []
  let lastMonth = -1

  for (let w = 0; w < numWeeks; w++) {
    const days: HeatmapDay[] = []
    let monthLabel: string | undefined

    for (let dIdx = 0; dIdx < 7; dIdx++) {
      const dayOffset = w * 7 + dIdx
      const dateStr = shiftISODate(gridStartDate, dayOffset)
      const count = countsByDate.get(dateStr) ?? 0
      const [year, month, day] = dateStr.split('-').map(Number)
      const dayDate = new Date(Date.UTC(year, month - 1, day))
      const dayOfWeek = dayDate.getUTCDay()

      // Month label appears on the first week that enters a new month
      if (month !== lastMonth && dIdx === 0) {
        lastMonth = month
        monthLabel = dayDate.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' })
      }

      days.push({
        date: dateStr,
        count,
        level: getHeatmapLevel(count),
        isToday: dateStr === today,
        isFuture: dateStr > today,
        dayOfWeek,
      })
    }

    weeks.push({ days, monthLabel })
  }

  return weeks
}

/** Completion rate among tasks active/scheduled for today; null if nothing is scheduled today. */
export function completionRateToday(todos: Todo[]): { completed: number; total: number } | null {
  const today = todayISO()
  const todayTasks = todos.filter((t) => {
    if (t.status === 'COMPLETED') {
      return (
        (t.completedAt && dateOf(t.completedAt) === today) ||
        isTodayTask({ ...t, status: 'TODO' })
      )
    }
    return isTodayTask(t)
  })
  if (todayTasks.length === 0) return null
  const completed = todayTasks.filter((t) => t.status === 'COMPLETED').length
  return { completed, total: todayTasks.length }
}

export function formatFocusMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}
