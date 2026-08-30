import { describe, it, expect } from 'vitest'
import {
  completionRateToday,
  currentStreak,
  generateHeatmapGrid,
  getHeatmapLevel,
  longestStreak,
  tasksCompletedOn,
} from './productivity'
import { shiftISODate, todayISO } from './date'
import type { Todo } from '@/types'

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: Math.random().toString(36),
    title: 'Test',
    status: 'TODO',
    priority: 'MEDIUM',
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function completedOn(dateISO: string): Todo {
  return makeTodo({ status: 'COMPLETED', completedAt: `${dateISO}T12:00:00.000Z` })
}

describe('tasksCompletedOn', () => {
  it('only counts completed tasks with a matching completedAt date', () => {
    const today = todayISO()
    const todos = [completedOn(today), completedOn(shiftISODate(today, -1)), makeTodo({ status: 'TODO' })]
    expect(tasksCompletedOn(todos, today)).toHaveLength(1)
  })
})

describe('currentStreak', () => {
  const today = todayISO()

  it('is zero with no completions', () => {
    expect(currentStreak([])).toBe(0)
  })

  it('counts today plus consecutive prior days', () => {
    const todos = [completedOn(today), completedOn(shiftISODate(today, -1)), completedOn(shiftISODate(today, -2))]
    expect(currentStreak(todos)).toBe(3)
  })

  it('stops at the first gap', () => {
    const todos = [completedOn(today), completedOn(shiftISODate(today, -1)), completedOn(shiftISODate(today, -3))]
    expect(currentStreak(todos)).toBe(2)
  })

  it('still counts as current if yesterday had activity but today does not yet', () => {
    const todos = [completedOn(shiftISODate(today, -1)), completedOn(shiftISODate(today, -2))]
    expect(currentStreak(todos)).toBe(2)
  })

  it('is zero if the most recent completion was two or more days ago', () => {
    const todos = [completedOn(shiftISODate(today, -2))]
    expect(currentStreak(todos)).toBe(0)
  })
})

describe('completionRateToday', () => {
  it('is null when nothing is due today', () => {
    expect(completionRateToday([makeTodo({ dueDate: shiftISODate(todayISO(), 3) })])).toBeNull()
  })

  it('computes completed/total among tasks due today', () => {
    const today = todayISO()
    const todos = [
      makeTodo({ dueDate: today, status: 'COMPLETED' }),
      makeTodo({ dueDate: today, status: 'TODO' }),
      makeTodo({ dueDate: shiftISODate(today, 1) }),
    ]
    expect(completionRateToday(todos)).toEqual({ completed: 1, total: 2 })
  })
})

describe('longestStreak', () => {
  const today = todayISO()

  it('is zero with no completions', () => {
    expect(longestStreak([])).toBe(0)
  })

  it('computes max historical streak regardless of recent gap', () => {
    const todos = [
      completedOn(shiftISODate(today, -10)),
      completedOn(shiftISODate(today, -9)),
      completedOn(shiftISODate(today, -8)),
      completedOn(shiftISODate(today, -7)),
      completedOn(today),
    ]
    expect(longestStreak(todos)).toBe(4)
  })
})

describe('getHeatmapLevel', () => {
  it('returns appropriate tier 0 to 4 based on count', () => {
    expect(getHeatmapLevel(0)).toBe(0)
    expect(getHeatmapLevel(1)).toBe(1)
    expect(getHeatmapLevel(2)).toBe(2)
    expect(getHeatmapLevel(3)).toBe(3)
    expect(getHeatmapLevel(5)).toBe(4)
  })
})

describe('generateHeatmapGrid', () => {
  it('generates 20 weeks of days ending at current week end', () => {
    const todos = [completedOn(todayISO())]
    const grid = generateHeatmapGrid(todos, 20)
    expect(grid).toHaveLength(20)
    expect(grid[0].days).toHaveLength(7)
    // Find today in the grid
    const allDays = grid.flatMap((w) => w.days)
    const todayCell = allDays.find((d) => d.isToday)
    expect(todayCell).toBeDefined()
    expect(todayCell?.count).toBe(1)
    expect(todayCell?.level).toBe(1)
  })
})
