import type { RecurrenceConfig, Todo } from '@/types'

export function todayISO(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shiftISODate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function isToday(dateISO?: string): boolean {
  return !!dateISO && dateISO === todayISO()
}

export function isFutureDate(dateISO?: string): boolean {
  if (!dateISO) return false
  return dateISO > todayISO()
}

export function isCompleteable(todo: Todo): boolean {
  if (todo.status === 'COMPLETED') return true
  if (!todo.dueDate) return true
  return !isFutureDate(todo.dueDate)
}

export function isOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.status === 'COMPLETED') return false
  if (todo.dueDate > todayISO()) return false
  if (todo.dueDate < todayISO()) return true
  // Same day: check dueTime
  if (!todo.dueTime) return false
  const [hours, minutes] = todo.dueTime.split(':').map(Number)
  const now = new Date()
  const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0)
  return due.getTime() < now.getTime()
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
    : new Date(`${todo.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return todo.dueTime ? `${label}, ${todo.dueTime}` : label
}

export function computeNextDueDate(baseDateISO: string | undefined, recurrence: RecurrenceConfig): string {
  const base = baseDateISO || todayISO()
  const interval = Math.max(1, recurrence.interval ?? 1)
  const { type, unit, daysOfWeek } = recurrence

  if (type === 'DAILY') {
    return shiftISODate(base, interval)
  }

  if (type === 'WEEKLY') {
    if (daysOfWeek && daysOfWeek.length > 0) {
      return getNextDayOfWeekDate(base, daysOfWeek, interval)
    }
    return shiftISODate(base, 7 * interval)
  }

  if (type === 'MONTHLY') {
    return addMonthsToISODate(base, interval)
  }

  if (type === 'CUSTOM') {
    const customUnit = unit ?? 'day'
    if (customUnit === 'day') {
      return shiftISODate(base, interval)
    }
    if (customUnit === 'week') {
      if (daysOfWeek && daysOfWeek.length > 0) {
        return getNextDayOfWeekDate(base, daysOfWeek, interval)
      }
      return shiftISODate(base, 7 * interval)
    }
    if (customUnit === 'month') {
      return addMonthsToISODate(base, interval)
    }
  }

  return shiftISODate(base, 1)
}

function addMonthsToISODate(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  let newYear = y
  let newMonth = m - 1 + months
  newYear += Math.floor(newMonth / 12)
  newMonth = ((newMonth % 12) + 12) % 12
  const daysInNewMonth = new Date(Date.UTC(newYear, newMonth + 1, 0)).getUTCDate()
  const newDay = Math.min(d, daysInNewMonth)
  const date = new Date(Date.UTC(newYear, newMonth, newDay))
  return date.toISOString().slice(0, 10)
}

function getNextDayOfWeekDate(baseISO: string, daysOfWeek: number[], intervalWeeks: number): string {
  const [y, m, d] = baseISO.split('-').map(Number)
  const baseDate = new Date(Date.UTC(y, m - 1, d))
  const currentDayOfWeek = baseDate.getUTCDay()

  const sortedDays = [...daysOfWeek].sort((a, b) => a - b)
  // Check if there is a later day in the same week
  const nextDayInSameWeek = sortedDays.find((day) => day > currentDayOfWeek)

  if (nextDayInSameWeek !== undefined) {
    const diff = nextDayInSameWeek - currentDayOfWeek
    return shiftISODate(baseISO, diff)
  }

  // Otherwise, advance by intervalWeeks weeks to the first selected day of the week
  const firstDay = sortedDays[0]
  const daysUntilEndOfWeek = 7 - currentDayOfWeek
  const additionalDays = (intervalWeeks - 1) * 7 + firstDay
  return shiftISODate(baseISO, daysUntilEndOfWeek + additionalDays)
}

export function formatRecurrenceLabel(recurrence?: RecurrenceConfig): string {
  if (!recurrence) return ''
  const { type, interval = 1, unit, daysOfWeek } = recurrence
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (type === 'DAILY') {
    return interval === 1 ? 'Daily' : `Every ${interval} days`
  }
  if (type === 'WEEKLY') {
    if (daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
      const days = daysOfWeek.map((d) => DAY_NAMES[d]).join(', ')
      return interval === 1 ? `Weekly on ${days}` : `Every ${interval} wks on ${days}`
    }
    return interval === 1 ? 'Weekly' : `Every ${interval} weeks`
  }
  if (type === 'MONTHLY') {
    return interval === 1 ? 'Monthly' : `Every ${interval} months`
  }
  if (type === 'CUSTOM') {
    if (unit === 'week' && daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
      const days = daysOfWeek.map((d) => DAY_NAMES[d]).join(', ')
      return interval === 1 ? `Every week on ${days}` : `Every ${interval} wks on ${days}`
    }
    const unitLabel = (unit ?? 'day') + (interval > 1 ? 's' : '')
    return `Every ${interval} ${unitLabel}`
  }
  return ''
}
