import type { Todo } from '@/types'

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function shiftISODate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function isToday(dateISO?: string): boolean {
  return !!dateISO && dateISO === todayISO()
}

export function isOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.status === 'COMPLETED') return false
  const due = new Date(`${todo.dueDate}T${todo.dueTime ?? '23:59'}:00`)
  return due.getTime() < Date.now()
}

export function isUpcoming(todo: Todo): boolean {
  if (!todo.dueDate || todo.status === 'COMPLETED') return false
  return !isToday(todo.dueDate) && !isOverdue(todo)
}

export function dueTimestamp(todo: Todo): number | null {
  if (!todo.dueDate) return null
  return new Date(`${todo.dueDate}T${todo.dueTime ?? '09:00'}:00`).getTime()
}

export function formatDueLabel(todo: Todo): string {
  if (!todo.dueDate) return ''
  const label = isToday(todo.dueDate)
    ? 'Today'
    : new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return todo.dueTime ? `${label}, ${todo.dueTime}` : label
}
