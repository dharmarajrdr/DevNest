import { describe, it, expect } from 'vitest'
import {
  computeNextDueDate,
  formatRecurrenceLabel,
  isCompleteable,
  isFutureDate,
  isOverdue,
  isToday,
  isUpcoming,
  shiftISODate,
  todayISO,
} from './date'
import type { Todo } from '@/types'

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: '1',
    title: 'Test',
    status: 'TODO',
    priority: 'MEDIUM',
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('shiftISODate', () => {
  it('shifts forward across a month boundary', () => {
    expect(shiftISODate('2026-01-31', 1)).toBe('2026-02-01')
  })
  it('shifts backward across a year boundary', () => {
    expect(shiftISODate('2026-01-01', -1)).toBe('2025-12-31')
  })
  it('is a no-op for a zero shift', () => {
    expect(shiftISODate('2026-06-15', 0)).toBe('2026-06-15')
  })
})

describe('isToday', () => {
  it('is true for today\u2019s date', () => {
    expect(isToday(todayISO())).toBe(true)
  })
  it('is false for an undefined date', () => {
    expect(isToday(undefined)).toBe(false)
  })
  it('is false for a past date', () => {
    expect(isToday(shiftISODate(todayISO(), -3))).toBe(false)
  })
})

describe('isOverdue', () => {
  it('is true for a past due date on an incomplete task', () => {
    const todo = makeTodo({ dueDate: shiftISODate(todayISO(), -1) })
    expect(isOverdue(todo)).toBe(true)
  })
  it('is false once the task is completed, even if past due', () => {
    const todo = makeTodo({ dueDate: shiftISODate(todayISO(), -1), status: 'COMPLETED' })
    expect(isOverdue(todo)).toBe(false)
  })
  it('is false with no due date', () => {
    expect(isOverdue(makeTodo())).toBe(false)
  })
  it('is false for a future due date', () => {
    const todo = makeTodo({ dueDate: shiftISODate(todayISO(), 3) })
    expect(isOverdue(todo)).toBe(false)
  })
})

describe('isUpcoming', () => {
  it('is true for a future due date', () => {
    const todo = makeTodo({ dueDate: shiftISODate(todayISO(), 2) })
    expect(isUpcoming(todo)).toBe(true)
  })
  it('is false for today’s due date', () => {
    const todo = makeTodo({ dueDate: todayISO() })
    expect(isUpcoming(todo)).toBe(false)
  })
  it('is false for an overdue task', () => {
    const todo = makeTodo({ dueDate: shiftISODate(todayISO(), -1) })
    expect(isUpcoming(todo)).toBe(false)
  })
})

describe('isFutureDate', () => {
  it('is true for dates ahead of today', () => {
    expect(isFutureDate(shiftISODate(todayISO(), 1))).toBe(true)
  })
  it('is false for today', () => {
    expect(isFutureDate(todayISO())).toBe(false)
  })
  it('is false for past dates and undefined', () => {
    expect(isFutureDate(shiftISODate(todayISO(), -1))).toBe(false)
    expect(isFutureDate(undefined)).toBe(false)
  })
})

describe('isCompleteable', () => {
  it('is true for today or overdue tasks or tasks without dueDate', () => {
    expect(isCompleteable(makeTodo({ dueDate: todayISO() }))).toBe(true)
    expect(isCompleteable(makeTodo({ dueDate: shiftISODate(todayISO(), -1) }))).toBe(true)
    expect(isCompleteable(makeTodo())).toBe(true)
  })
  it('is false for future tasks when not yet completed', () => {
    expect(isCompleteable(makeTodo({ dueDate: shiftISODate(todayISO(), 1) }))).toBe(false)
  })
})

describe('computeNextDueDate', () => {
  const today = todayISO()

  it('computes daily recurrence (interval 1)', () => {
    expect(computeNextDueDate(today, { type: 'DAILY' })).toBe(shiftISODate(today, 1))
  })

  it('computes daily recurrence with interval 3', () => {
    expect(computeNextDueDate(today, { type: 'DAILY', interval: 3 })).toBe(shiftISODate(today, 3))
  })

  it('computes weekly recurrence (interval 1)', () => {
    expect(computeNextDueDate(today, { type: 'WEEKLY' })).toBe(shiftISODate(today, 7))
  })

  it('computes monthly recurrence', () => {
    expect(computeNextDueDate('2026-01-15', { type: 'MONTHLY' })).toBe('2026-02-15')
    expect(computeNextDueDate('2026-01-31', { type: 'MONTHLY' })).toBe('2026-02-28')
  })

  it('computes custom recurrence for days, weeks, and months', () => {
    expect(computeNextDueDate(today, { type: 'CUSTOM', interval: 4, unit: 'day' })).toBe(
      shiftISODate(today, 4),
    )
    expect(computeNextDueDate(today, { type: 'CUSTOM', interval: 2, unit: 'week' })).toBe(
      shiftISODate(today, 14),
    )
    expect(computeNextDueDate('2026-03-31', { type: 'CUSTOM', interval: 2, unit: 'month' })).toBe(
      '2026-05-31',
    )
  })

  it('handles custom days of week correctly', () => {
    // 2026-08-30 is Sunday (day 0)
    // Next day among Mon (1), Wed (3), Fri (5) is Mon (2026-08-31)
    expect(
      computeNextDueDate('2026-08-30', {
        type: 'WEEKLY',
        daysOfWeek: [1, 3, 5],
      }),
    ).toBe('2026-08-31')
  })
})

describe('formatRecurrenceLabel', () => {
  it('formats daily, weekly, monthly, and custom labels', () => {
    expect(formatRecurrenceLabel({ type: 'DAILY' })).toBe('Daily')
    expect(formatRecurrenceLabel({ type: 'DAILY', interval: 3 })).toBe('Every 3 days')
    expect(formatRecurrenceLabel({ type: 'WEEKLY' })).toBe('Weekly')
    expect(formatRecurrenceLabel({ type: 'MONTHLY' })).toBe('Monthly')
    expect(formatRecurrenceLabel({ type: 'CUSTOM', interval: 2, unit: 'month' })).toBe(
      'Every 2 months',
    )
  })
})
