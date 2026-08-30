import { create } from 'zustand'
import type { Todo, TodoDraft } from '@/types'
import { TodoRepository } from '@/services/storage/repositories/TodoRepository'
import { TaskAlarmService } from '@/services/alarms/TaskAlarmService'
import { useSettingsStore } from './useSettingsStore'

interface TodoState {
  todos: Todo[]
  loading: boolean
  load: () => Promise<void>
  create: (draft: TodoDraft) => Promise<void>
  update: (id: string, patch: Partial<Todo>) => Promise<void>
  remove: (id: string) => Promise<void>
  complete: (id: string) => Promise<void>
  restore: (id: string) => Promise<void>
}

async function resync(id: string, get: () => TodoState) {
  const todo = get().todos.find((t) => t.id === id)
  if (todo) await TaskAlarmService.schedule(todo, useSettingsStore.getState().settings.notifications)
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: true,

  load: async () => {
    set({ loading: true })
    const todos = await TodoRepository.getAll()
    set({ todos, loading: false })
  },

  create: async (draft) => {
    const todo = await TodoRepository.create(draft)
    set((s) => ({ todos: [...s.todos, todo] }))
    await TaskAlarmService.schedule(todo, useSettingsStore.getState().settings.notifications)
  },

  update: async (id, patch) => {
    const updated = await TodoRepository.update(id, patch)
    if (!updated) return
    set((s) => ({ todos: s.todos.map((t) => (t.id === id ? updated : t)) }))
    await resync(id, get)
  },

  remove: async (id) => {
    await TodoRepository.remove(id)
    await TaskAlarmService.cancel(id)
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }))
  },

  complete: async (id) => {
    const updated = await TodoRepository.complete(id)
    if (!updated) return
    await TaskAlarmService.cancel(id)
    const todos = await TodoRepository.getAll()
    set({ todos })
    const notifs = useSettingsStore.getState().settings.notifications
    for (const t of todos) {
      if (t.status !== 'COMPLETED') await TaskAlarmService.schedule(t, notifs)
    }
  },

  restore: async (id) => {
    const updated = await TodoRepository.restore(id)
    if (!updated) return
    const todos = await TodoRepository.getAll()
    set({ todos })
    await resync(id, get)
  },
}))
