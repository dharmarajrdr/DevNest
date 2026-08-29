import { describe, it, expect } from 'vitest'
import { isOverdue, isToday, isUpcoming, shiftISODate, todayISO } from './date'
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
  it('is false for today\u2019s due date', () => {
    const todo = makeTodo({ dueDate: todayISO() })
    expect(isUpcoming(todo)).toBe(false)
  })
  it('is false for an overdue task', () => {
    const todo = makeTodo({ dueDate: shiftISODate(todayISO(), -1) })
    expect(isUpcoming(todo)).toBe(false)
  })
})
