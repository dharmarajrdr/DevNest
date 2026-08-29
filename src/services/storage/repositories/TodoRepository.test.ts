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
})
