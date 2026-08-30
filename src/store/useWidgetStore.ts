import { create } from 'zustand'
import type { WidgetConfig } from '@/types'
import { WidgetRepository } from '@/services/storage/repositories/WidgetRepository'
import { resolveCollisions, type Rect } from '@/utils/grid'

interface WidgetState {
  layout: WidgetConfig[]
  loading: boolean
  customizing: boolean
  load: () => Promise<void>
  toggleVisible: (id: string) => Promise<void>
  resetLayout: () => Promise<void>
  toggleCustomizing: () => void
  /** Commits a new position/size for one widget, moving colliding widgets
   *  aside to make room for the newly positioned widget. */
  updateWidgetRect: (id: string, rect: Rect) => Promise<boolean>
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  layout: [],
  loading: true,
  customizing: false,

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

  toggleCustomizing: () => set((s) => ({ customizing: !s.customizing })),

  updateWidgetRect: async (id, rect) => {
    const next = resolveCollisions(id, rect, get().layout)
    set({ layout: next })
    await WidgetRepository.saveLayout(next)
    return true
  },
}))
