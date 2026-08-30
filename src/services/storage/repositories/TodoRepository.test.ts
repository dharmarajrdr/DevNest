import { describe, it, expect, beforeEach } from 'vitest'
import { installChromeMock } from '@/test/chromeMock'
import { TodoRepository } from './TodoRepository'

beforeEach(() => {
  installChromeMock()
})

describe('TodoRepository', () => {
  it('creates a todo with sensible defaults', async () => {
    const todo = await TodoRepository.create({ title: 'Write tests' })
    expect(todo.title).toBe('Write tests')
    expect(todo.status).toBe('TODO')
    expect(todo.priority).toBe('MEDIUM')
    expect(todo.tags).toEqual([])
  })

  it('persists created todos, visible via getAll', async () => {
    await TodoRepository.create({ title: 'A' })
    await TodoRepository.create({ title: 'B' })
    const all = await TodoRepository.getAll()
    expect(all).toHaveLength(2)
  })

  it('update() bumps updatedAt and applies the patch', async () => {
    const todo = await TodoRepository.create({ title: 'Original' })
    const updated = await TodoRepository.update(todo.id, { title: 'Renamed' })
    expect(updated?.title).toBe('Renamed')
    expect(updated?.id).toBe(todo.id)
  })

  it('complete() sets status and completedAt', async () => {
    const todo = await TodoRepository.create({ title: 'Finish me' })
    const completed = await TodoRepository.complete(todo.id)
    expect(completed?.status).toBe('COMPLETED')
    expect(completed?.completedAt).toBeTruthy()
  })

  it('restore() clears completedAt and reverts status to TODO', async () => {
    const todo = await TodoRepository.create({ title: 'Flip-flop' })
    await TodoRepository.complete(todo.id)
    const restored = await TodoRepository.restore(todo.id)
    expect(restored?.status).toBe('TODO')
    expect(restored?.completedAt).toBeUndefined()
  })

  it('remove() deletes the todo', async () => {
    const todo = await TodoRepository.create({ title: 'Delete me' })
    await TodoRepository.remove(todo.id)
    expect(await TodoRepository.getAll()).toHaveLength(0)
  })

  it('update() on a missing id returns undefined and does not throw', async () => {
    const result = await TodoRepository.update('does-not-exist', { title: 'x' })
    expect(result).toBeUndefined()
  })

  it('complete() does not complete tasks with future due date', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10)
    const todo = await TodoRepository.create({ title: 'Future task', dueDate: futureDate })
    const result = await TodoRepository.complete(todo.id)
    expect(result).toBeUndefined()
    const all = await TodoRepository.getAll()
    expect(all[0].status).toBe('TODO')
  })

  it('completing a recurring task generates the next occurrence', async () => {
    const today = new Date().toISOString().slice(0, 10)
    const todo = await TodoRepository.create({
      title: 'Daily Standup',
      dueDate: today,
      recurrence: { type: 'DAILY', interval: 1 },
    })

    const completed = await TodoRepository.complete(todo.id)
    expect(completed?.status).toBe('COMPLETED')
    expect(completed?.completedAt).toBeTruthy()

    const all = await TodoRepository.getAll()
    expect(all).toHaveLength(2)
    const nextTask = all.find((t) => t.id !== todo.id)
    expect(nextTask).toBeDefined()
    expect(nextTask?.status).toBe('TODO')
    expect(nextTask?.title).toBe('Daily Standup')
    expect(nextTask?.recurrence).toEqual({ type: 'DAILY', interval: 1 })
    expect(nextTask?.dueDate).toBeTruthy()
  })

  it('preserves multi-day date range on recurring task completion', async () => {
    const today = new Date().toISOString().slice(0, 10)
    const nextWeek = new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10)
    const todo = await TodoRepository.create({
      title: 'Sprint Cycle',
      startDate: today,
      endDate: nextWeek,
      isAllDay: true,
      recurrence: { type: 'WEEKLY', interval: 1 },
    })

    const completed = await TodoRepository.complete(todo.id)
    expect(completed?.status).toBe('COMPLETED')

    const all = await TodoRepository.getAll()
    const nextTask = all.find((t) => t.id !== todo.id)
    expect(nextTask).toBeDefined()
    expect(nextTask?.isAllDay).toBe(true)
    expect(nextTask?.startDate).toBeTruthy()
    expect(nextTask?.endDate).toBeTruthy()
    expect(nextTask?.startDate).not.toBe(today)
  })

  it('stops generating next recurring occurrence if past recurrence.endDate', async () => {
    const today = new Date().toISOString().slice(0, 10)
    const todo = await TodoRepository.create({
      title: 'Temporary Daily Sync',
      startDate: today,
      endDate: today,
      recurrence: { type: 'DAILY', interval: 1, endDate: today },
    })

    const completed = await TodoRepository.complete(todo.id)
    expect(completed?.status).toBe('COMPLETED')

    const all = await TodoRepository.getAll()
    // Should NOT have created a new occurrence since next date > endDate
    expect(all).toHaveLength(1)
  })
})
