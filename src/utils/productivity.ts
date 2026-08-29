import type { FocusSessionLogEntry, Todo } from '@/types'
import { shiftISODate, todayISO } from './date'

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

/** Completion rate among tasks due today; null if nothing is due today. */
export function completionRateToday(todos: Todo[]): { completed: number; total: number } | null {
  const dueToday = todos.filter((t) => t.dueDate === todayISO())
  if (dueToday.length === 0) return null
  return { completed: dueToday.filter((t) => t.status === 'COMPLETED').length, total: dueToday.length }
}

export function formatFocusMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}
