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

export function getEffectiveStartDate(todo: Todo): string | undefined {
  return todo.startDate || (!todo.endDate ? todo.dueDate : undefined)
}

export function getEffectiveStartTime(todo: Todo): string | undefined {
  return todo.startTime || (!todo.endDate ? todo.dueTime : undefined)
}

export function getEffectiveEndDate(todo: Todo): string | undefined {
  return todo.endDate || todo.dueDate || todo.startDate
}

export function getEffectiveEndTime(todo: Todo): string | undefined {
  return todo.endTime || todo.dueTime
}

export function isAllDayTask(todo: Todo): boolean {
  if (todo.isAllDay !== undefined) return todo.isAllDay
  return !todo.startTime && !todo.endTime && !todo.dueTime && !!(todo.startDate || todo.endDate || todo.dueDate)
}

export function isTodayTask(todo: Todo): boolean {
  if (todo.status === 'COMPLETED') return false
  const start = getEffectiveStartDate(todo)
  const end = getEffectiveEndDate(todo)
  const today = todayISO()

  if (!start && !end) return true // Undated tasks belong in Today's plan

  if (start && end) {
    return start <= today && today <= end
  }
  if (start) {
    return start <= today
  }
  if (end) {
    return end >= today
  }
  return false
}

export function isUpcomingTask(todo: Todo): boolean {
  if (todo.status === 'COMPLETED') return false
  const start = getEffectiveStartDate(todo)
  const end = getEffectiveEndDate(todo)
  const today = todayISO()

  if (start) {
    return start > today
  }
  if (end) {
    return end > today
  }
  return false
}

export function isOverdueTask(todo: Todo): boolean {
  if (todo.status === 'COMPLETED') return false
  const end = getEffectiveEndDate(todo)
  const endTime = getEffectiveEndTime(todo)
  const today = todayISO()

  if (!end) return false
  if (end > today) return false
  if (end < today) return true

  // Same day as end date: check endTime if not all-day
  if (isAllDayTask(todo) || !endTime) return false
  const [hours, minutes] = endTime.split(':').map(Number)
  const now = new Date()
  const due = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0)
  return due.getTime() < now.getTime()
}

export function isCompleteable(todo: Todo): boolean {
  if (todo.status === 'COMPLETED') return true
  const start = getEffectiveStartDate(todo)
  const end = getEffectiveEndDate(todo)
  const today = todayISO()

  // Future tasks (not yet started) cannot be completed
  if (start && start > today) return false
  if (!start && end && end > today) return false

  return true
}

export function isOverdue(todo: Todo): boolean {
  return isOverdueTask(todo)
}

export function isUpcoming(todo: Todo): boolean {
  return isUpcomingTask(todo)
}

export function dueTimestamp(todo: Todo): number | null {
  const start = getEffectiveStartDate(todo)
  const end = getEffectiveEndDate(todo)
  const date = start || end
  if (!date) return null

  const time = getEffectiveStartTime(todo) || getEffectiveEndTime(todo) || '09:00'
  return new Date(`${date}T${time}:00`).getTime()
}

function formatShortDate(iso: string): string {
  if (isToday(iso)) return 'Today'
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function formatTaskTimeframe(todo: Todo): string {
  const start = getEffectiveStartDate(todo)
  const end = getEffectiveEndDate(todo)
  const startTime = getEffectiveStartTime(todo)
  const endTime = getEffectiveEndTime(todo)
  const allDay = isAllDayTask(todo)

  if (!start && !end) return ''

  const effectiveStart = start || end!
  const effectiveEnd = end || start!
  const isSameDay = effectiveStart === effectiveEnd

  if (allDay) {
    if (isSameDay) {
      return isToday(effectiveStart) ? 'Today (All-day)' : `${formatShortDate(effectiveStart)} (All-day)`
    }
    return `${formatShortDate(effectiveStart)} – ${formatShortDate(effectiveEnd)} (All-day)`
  }

  // Timed task
  if (isSameDay) {
    const dateLabel = formatShortDate(effectiveStart)
    if (startTime && endTime) return `${dateLabel}, ${startTime} – ${endTime}`
    if (startTime) return `${dateLabel}, from ${startTime}`
    if (endTime) return `${dateLabel}, by ${endTime}`
    return dateLabel
  }

  // Multi-day timed task
  if (startTime && endTime) {
    return `${formatShortDate(effectiveStart)}, ${startTime} – ${formatShortDate(effectiveEnd)}, ${endTime}`
  }
  return `${formatShortDate(effectiveStart)} – ${formatShortDate(effectiveEnd)}`
}

export function formatDueLabel(todo: Todo): string {
  return formatTaskTimeframe(todo)
}

export function isValidTimeRange(startTime?: string, endTime?: string): boolean {
  if (!startTime || !endTime) return true
  return startTime <= endTime
}

export function computeNextDueDate(baseDateISO: string | undefined, recurrence: RecurrenceConfig): string {
  const base = baseDateISO || todayISO()
  const interval = Math.max(1, recurrence.interval ?? 1)
  const { type, unit, daysOfWeek, daysOfMonth } = recurrence

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
    if (daysOfMonth && daysOfMonth.length > 0) {
      return getNextDayOfMonthDate(base, daysOfMonth, interval)
    }
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
      if (daysOfMonth && daysOfMonth.length > 0) {
        return getNextDayOfMonthDate(base, daysOfMonth, interval)
      }
      return addMonthsToISODate(base, interval)
    }
  }

  return shiftISODate(base, 1)
}

export function computeNextTimeframe(
  startDate: string | undefined,
  endDate: string | undefined,
  recurrence: RecurrenceConfig,
): { startDate?: string; endDate?: string } | null {
  if (!startDate && !endDate) {
    const next = computeNextDueDate(todayISO(), recurrence)
    if (recurrence.endDate && next > recurrence.endDate) return null
    return { startDate: next, endDate: next }
  }

  const baseStart = startDate || endDate
  const nextStart = computeNextDueDate(baseStart, recurrence)

  if (recurrence.endDate && nextStart > recurrence.endDate) {
    return null
  }

  if (!startDate || !endDate || startDate === endDate) {
    return {
      startDate: startDate ? nextStart : undefined,
      endDate: endDate ? nextStart : undefined,
    }
  }

  // Calculate day difference for multi-day spans
  const [sy, sm, sd] = startDate.split('-').map(Number)
  const [ey, em, ed] = endDate.split('-').map(Number)
  const sDate = Date.UTC(sy, sm - 1, sd)
  const eDate = Date.UTC(ey, em - 1, ed)
  const spanDays = Math.round((eDate - sDate) / 86400000)

  const nextEnd = shiftISODate(nextStart, spanDays)
  return { startDate: nextStart, endDate: nextEnd }
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
  const nextDayInSameWeek = sortedDays.find((day) => day > currentDayOfWeek)

  if (nextDayInSameWeek !== undefined) {
    const diff = nextDayInSameWeek - currentDayOfWeek
    return shiftISODate(baseISO, diff)
  }

  const firstDay = sortedDays[0]
  const daysUntilEndOfWeek = 7 - currentDayOfWeek
  const additionalDays = (intervalWeeks - 1) * 7 + firstDay
  return shiftISODate(baseISO, daysUntilEndOfWeek + additionalDays)
}

function getNextDayOfMonthDate(baseISO: string, daysOfMonth: number[], intervalMonths: number): string {
  const [y, m, d] = baseISO.split('-').map(Number)
  const sortedDays = [...daysOfMonth].sort((a, b) => a - b)

  const nextDayInSameMonth = sortedDays.find((day) => day > d)
  if (nextDayInSameMonth !== undefined) {
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
    const targetDay = Math.min(nextDayInSameMonth, daysInMonth)
    const newDate = new Date(Date.UTC(y, m - 1, targetDay))
    return newDate.toISOString().slice(0, 10)
  }

  const firstDay = sortedDays[0]
  let newYear = y
  let newMonth = m - 1 + intervalMonths
  newYear += Math.floor(newMonth / 12)
  newMonth = ((newMonth % 12) + 12) % 12
  const daysInNewMonth = new Date(Date.UTC(newYear, newMonth + 1, 0)).getUTCDate()
  const targetDay = Math.min(firstDay, daysInNewMonth)
  const newDate = new Date(Date.UTC(newYear, newMonth, targetDay))
  return newDate.toISOString().slice(0, 10)
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function formatRecurrenceLabel(recurrence?: RecurrenceConfig): string {
  if (!recurrence) return ''
  const { type, interval = 1, unit, daysOfWeek, daysOfMonth, endDate } = recurrence
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  let label = ''

  if (type === 'DAILY') {
    label = interval === 1 ? 'Daily' : `Every ${interval} days`
  } else if (type === 'WEEKLY') {
    if (daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
      const days = daysOfWeek.map((d) => DAY_NAMES[d]).join(', ')
      label = interval === 1 ? `Weekly on ${days}` : `Every ${interval} wks on ${days}`
    } else {
      label = interval === 1 ? 'Weekly' : `Every ${interval} weeks`
    }
  } else if (type === 'MONTHLY') {
    if (daysOfMonth && daysOfMonth.length > 0) {
      const days = daysOfMonth.map(ordinal).join(', ')
      label = interval === 1 ? `Monthly on the ${days}` : `Every ${interval} mos on the ${days}`
    } else {
      label = interval === 1 ? 'Monthly' : `Every ${interval} months`
    }
  } else if (type === 'CUSTOM') {
    if (unit === 'week' && daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
      const days = daysOfWeek.map((d) => DAY_NAMES[d]).join(', ')
      label = interval === 1 ? `Every week on ${days}` : `Every ${interval} wks on ${days}`
    } else if (unit === 'month' && daysOfMonth && daysOfMonth.length > 0) {
      const days = daysOfMonth.map(ordinal).join(', ')
      label = `Every ${interval} mos on the ${days}`
    } else {
      const unitLabel = (unit ?? 'day') + (interval > 1 ? 's' : '')
      label = `Every ${interval} ${unitLabel}`
    }
  }

  if (endDate && label) {
    label += ` until ${endDate}`
  }

  return label
}
