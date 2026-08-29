import { StorageService } from '../StorageService'
import { DEFAULT_SETTINGS, type Settings } from '@/types'

// Settings are small and benefit from following the user across machines,
// so they live in chrome.storage.sync (well under its 8KB/item quota) —
// unlike todos/shortcuts, which stay local until account sync exists.
const KEY = 'devtab.settings'

export const SettingsRepository = {
  async get(): Promise<Settings> {
    const stored = await StorageService.get<Settings>(KEY, 'sync')
    return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS
  },

  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.get()
    const next = { ...current, ...patch }
    await StorageService.set(KEY, next, 'sync')
    return next
  },
}
