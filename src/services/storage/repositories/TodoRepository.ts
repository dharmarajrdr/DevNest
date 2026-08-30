import { StorageService } from '../StorageService'
import type { Todo, TodoDraft } from '@/types'
import { generateId } from '@/utils/id'
import { computeNextDueDate, isFutureDate } from '@/utils/date'

const KEY = 'devtab.todos'

async function getAll(): Promise<Todo[]> {
  return (await StorageService.get<Todo[]>(KEY)) ?? []
}

async function saveAll(todos: Todo[]): Promise<void> {
  await StorageService.set(KEY, todos)
}

export const TodoRepository = {
  getAll,

  /** Used by the sync engine to write back a merged local+remote set. */
  async replaceAll(todos: Todo[]): Promise<void> {
    await saveAll(todos)
  },

  async create(draft: TodoDraft): Promise<Todo> {
    const now = new Date().toISOString()
    const todo: Todo = {
      id: generateId(),
      title: draft.title,
      description: draft.description,
      status: 'TODO',
      priority: draft.priority ?? 'MEDIUM',
      dueDate: draft.dueDate,
      dueTime: draft.dueTime,
      tags: draft.tags ?? [],
      recurrence: draft.recurrence,
      recurringParentId: draft.recurringParentId,
      createdAt: now,
      updatedAt: now,
    }
    const all = await getAll()
    await saveAll([...all, todo])
    return todo
  },

  async update(id: string, patch: Partial<Todo>): Promise<Todo | undefined> {
    const all = await getAll()
    let updated: Todo | undefined
    const next = all.map((t) => {
      if (t.id !== id) return t
      updated = { ...t, ...patch, updatedAt: new Date().toISOString() }
      return updated
    })
    await saveAll(next)
    return updated
  },

  async remove(id: string): Promise<void> {
    const all = await getAll()
    await saveAll(all.filter((t) => t.id !== id))
  },

  async complete(id: string): Promise<Todo | undefined> {
    const all = await getAll()
    const todo = all.find((t) => t.id === id)
    if (!todo) return undefined

    if (isFutureDate(todo.dueDate)) {
      return undefined // Future tasks cannot be completed yet
    }

    const now = new Date().toISOString()
    const completedTodo: Todo = {
      ...todo,
      status: 'COMPLETED',
      completedAt: now,
      updatedAt: now,
    }

    const nextTodos = all.map((t) => (t.id === id ? completedTodo : t))

    // If it's a recurring task, schedule the next occurrence
    if (todo.recurrence) {
      const nextDueDate = computeNextDueDate(todo.dueDate, todo.recurrence)
      const nextRecurringTodo: Todo = {
        id: generateId(),
        title: todo.title,
        description: todo.description,
        status: 'TODO',
        priority: todo.priority,
        dueDate: nextDueDate,
        dueTime: todo.dueTime,
        tags: todo.tags ?? [],
        recurrence: todo.recurrence,
        recurringParentId: todo.recurringParentId ?? todo.id,
        createdAt: now,
        updatedAt: now,
      }
      nextTodos.push(nextRecurringTodo)
    }

    await saveAll(nextTodos)
    return completedTodo
  },

  async restore(id: string): Promise<Todo | undefined> {
    return this.update(id, { status: 'TODO', completedAt: undefined })
  },
}
