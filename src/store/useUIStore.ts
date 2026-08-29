import { create } from 'zustand'

/** Cross-widget UI signals that don't belong to any single domain store —
 *  e.g. the "N" shortcut needs to open the Todo widget's form modal from
 *  outside that widget's own local state. */
interface UIStore {
  taskFormOpen: boolean
  setTaskFormOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  taskFormOpen: false,
  setTaskFormOpen: (open) => set({ taskFormOpen: open }),
}))
