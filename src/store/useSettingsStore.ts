import { create } from 'zustand'
import { DEFAULT_SETTINGS, type Settings } from '@/types'
import { SettingsRepository } from '@/services/storage/repositories/SettingsRepository'

interface SettingsState {
  settings: Settings
  loading: boolean
  load: () => Promise<void>
  update: (patch: Partial<Settings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loading: true,

  load: async () => {
    set({ loading: true })
    const settings = await SettingsRepository.get()
    set({ settings, loading: false })
  },

  update: async (patch) => {
    const settings = await SettingsRepository.update(patch)
    set({ settings })
  },
}))
