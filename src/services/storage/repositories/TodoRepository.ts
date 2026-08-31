import { StorageService } from '../StorageService'
import type { Todo, TodoDraft } from '@/types'
import { generateTaskId } from '@/utils/id'
import { computeNextTimeframe, isCompleteable, todayISO } from '@/utils/date'

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
      id: draft.id || generateTaskId(),
      title: draft.title,
      description: draft.description,
      status: 'TODO',
      priority: draft.priority ?? 'MEDIUM',
      startDate: draft.startDate,
      startTime: draft.startTime,
      endDate: draft.endDate,
      endTime: draft.endTime,
      isAllDay: draft.isAllDay,
      link: draft.link,
      dueDate: draft.dueDate || draft.endDate,
      dueTime: draft.dueTime || draft.endTime,
      tags: draft.tags ?? [],
      recurrence: draft.recurrence,
      recurringParentId: draft.recurringParentId,
      spawnedFromId: draft.spawnedFromId,
      spawnedChildId: draft.spawnedChildId,
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

    if (!isCompleteable(todo)) {
      return undefined // Future tasks cannot be completed yet
    }

    const now = new Date().toISOString()
    const today = todayISO()
    const nextChildId = todo.recurrence ? generateTaskId() : undefined

    const completedTodo: Todo = {
      ...todo,
      status: 'COMPLETED',
      completedAt: now,
      updatedAt: now,
      spawnedChildId: nextChildId,
    }

    const nextTodos = all.map((t) => (t.id === id ? completedTodo : t))

    // If it's a recurring task, schedule the next occurrence relative to today
    if (todo.recurrence && nextChildId) {
      const nextTimeframe = computeNextTimeframe(
        todo.startDate || todo.dueDate,
        todo.endDate || todo.dueDate,
        todo.recurrence,
        today,
      )
      if (nextTimeframe) {
        const { startDate: nextStartDate, endDate: nextEndDate } = nextTimeframe
        const nextRecurringTodo: Todo = {
          id: nextChildId,
          title: todo.title,
          description: todo.description,
          status: 'TODO',
          priority: todo.priority,
          startDate: nextStartDate,
          startTime: todo.startTime,
          endDate: nextEndDate,
          endTime: todo.endTime,
          isAllDay: todo.isAllDay,
          link: todo.link,
          dueDate: nextEndDate,
          dueTime: todo.endTime || todo.dueTime,
          tags: todo.tags ?? [],
          recurrence: todo.recurrence,
          recurringParentId: todo.recurringParentId ?? todo.id,
          spawnedFromId: todo.id,
          createdAt: now,
          updatedAt: now,
        }
        nextTodos.push(nextRecurringTodo)
      }
    }

    await saveAll(nextTodos)
    return completedTodo
  },

  async restore(id: string): Promise<Todo | undefined> {
    const all = await getAll()
    const todo = all.find((t) => t.id === id)
    if (!todo) return undefined

    const now = new Date().toISOString()
    const restoredTodo: Todo = {
      ...todo,
      status: 'TODO',
      completedAt: undefined,
      updatedAt: now,
      spawnedChildId: undefined,
    }

    // Filter out any uncompleted (TODO) occurrence that was spawned by this task
    const nextTodos = all
      .filter((t) => {
        if (t.spawnedFromId === id && t.status === 'TODO') return false
        if (todo.spawnedChildId && t.id === todo.spawnedChildId && t.status === 'TODO') return false
        return true
      })
      .map((t) => (t.id === id ? restoredTodo : t))

    await saveAll(nextTodos)
    return restoredTodo
  },
}
