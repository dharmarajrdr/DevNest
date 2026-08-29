import { create } from 'zustand'
import type { WidgetConfig } from '@/types'
import { WidgetRepository } from '@/services/storage/repositories/WidgetRepository'

interface WidgetState {
  layout: WidgetConfig[]
  loading: boolean
  load: () => Promise<void>
  toggleVisible: (id: string) => Promise<void>
  resetLayout: () => Promise<void>
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  layout: [],
  loading: true,

  load: async () => {
    set({ loading: true })
    const layout = await WidgetRepository.getLayout()
    set({ layout, loading: false })
  },

  toggleVisible: async (id) => {
    const next = get().layout.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    await WidgetRepository.saveLayout(next)
    set({ layout: next })
  },

  resetLayout: async () => {
    const layout = await WidgetRepository.resetLayout()
    set({ layout })
  },
}))
