import { create } from 'zustand'
import type { WidgetConfig } from '@/types'
import { WidgetRepository } from '@/services/storage/repositories/WidgetRepository'
import { overlapsAny, type Rect } from '@/utils/grid'

interface WidgetState {
  layout: WidgetConfig[]
  loading: boolean
  customizing: boolean
  load: () => Promise<void>
  toggleVisible: (id: string) => Promise<void>
  resetLayout: () => Promise<void>
  toggleCustomizing: () => void
  /** Commits a new position/size for one widget, rejecting the change (and
   *  leaving the stored layout untouched) if it would overlap another
   *  visible widget — the grid doesn't push widgets out of the way, so an
   *  invalid drop is simply refused rather than left overlapping. */
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
    if (overlapsAny(rect, id, get().layout)) return false
    const next = get().layout.map((w) => (w.id === id ? { ...w, ...rect } : w))
    set({ layout: next })
    await WidgetRepository.saveLayout(next)
    return true
  },
}))
