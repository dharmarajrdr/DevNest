import { create } from 'zustand'
import type { LearnTopic } from '@/types'
import { ToLearnRepository } from '@/services/storage/repositories/ToLearnRepository'

interface ToLearnState {
  topics: LearnTopic[]
  loading: boolean
  load: () => Promise<void>
  create: (draft: Omit<LearnTopic, 'id' | 'createdAt'>) => Promise<LearnTopic>
  update: (id: string, patch: Partial<Omit<LearnTopic, 'id' | 'createdAt'>>) => Promise<void>
  toggleComplete: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useToLearnStore = create<ToLearnState>((set) => ({
  topics: [],
  loading: true,

  load: async () => {
    set({ loading: true })
    const topics = await ToLearnRepository.getAll()
    set({ topics, loading: false })
  },

  create: async (draft) => {
    const created = await ToLearnRepository.create(draft)
    const topics = await ToLearnRepository.getAll()
    set({ topics })
    return created
  },

  update: async (id, patch) => {
    await ToLearnRepository.update(id, patch)
    const topics = await ToLearnRepository.getAll()
    set({ topics })
  },

  toggleComplete: async (id) => {
    await ToLearnRepository.toggleComplete(id)
    const topics = await ToLearnRepository.getAll()
    set({ topics })
  },

  remove: async (id) => {
    await ToLearnRepository.remove(id)
    const topics = await ToLearnRepository.getAll()
    set({ topics })
  },
}))

