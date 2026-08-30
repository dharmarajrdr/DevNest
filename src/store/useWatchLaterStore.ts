import { create } from 'zustand'
import type { WatchLaterItem } from '@/types'
import { WatchLaterRepository } from '@/services/storage/repositories/WatchLaterRepository'

interface WatchLaterState {
  items: WatchLaterItem[]
  loading: boolean
  load: () => Promise<void>
  addByUrl: (url: string) => Promise<WatchLaterItem>
  toggleComplete: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useWatchLaterStore = create<WatchLaterState>((set) => ({
  items: [],
  loading: true,

  load: async () => {
    set({ loading: true })
    const items = await WatchLaterRepository.getAll()
    set({ items, loading: false })
  },

  addByUrl: async (url) => {
    const created = await WatchLaterRepository.addByUrl(url)
    const items = await WatchLaterRepository.getAll()
    set({ items })
    return created
  },

  toggleComplete: async (id) => {
    await WatchLaterRepository.toggleComplete(id)
    const items = await WatchLaterRepository.getAll()
    set({ items })
  },

  remove: async (id) => {
    await WatchLaterRepository.remove(id)
    const items = await WatchLaterRepository.getAll()
    set({ items })
  },
}))

