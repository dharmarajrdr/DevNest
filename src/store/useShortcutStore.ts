import { create } from 'zustand'
import type { Shortcut, ShortcutDraft } from '@/types'
import { ShortcutRepository } from '@/services/storage/repositories/ShortcutRepository'

interface ShortcutState {
  shortcuts: Shortcut[]
  loading: boolean
  load: () => Promise<void>
  create: (draft: ShortcutDraft) => Promise<void>
  update: (id: string, patch: Partial<Shortcut>) => Promise<void>
  remove: (id: string) => Promise<void>
  reorder: (id: string, direction: 'up' | 'down') => Promise<void>
}

export const useShortcutStore = create<ShortcutState>((set) => ({
  shortcuts: [],
  loading: true,

  load: async () => {
    set({ loading: true })
    const shortcuts = await ShortcutRepository.getAll()
    set({ shortcuts, loading: false })
  },

  create: async (draft) => {
    await ShortcutRepository.create(draft)
    set({ shortcuts: await ShortcutRepository.getAll() })
  },

  update: async (id, patch) => {
    await ShortcutRepository.update(id, patch)
    set({ shortcuts: await ShortcutRepository.getAll() })
  },

  remove: async (id) => {
    await ShortcutRepository.remove(id)
    set({ shortcuts: await ShortcutRepository.getAll() })
  },

  reorder: async (id, direction) => {
    await ShortcutRepository.reorder(id, direction)
    set({ shortcuts: await ShortcutRepository.getAll() })
  },
}))
