/**
 * The only module in the app allowed to touch chrome.storage directly.
 * Everything else (repositories, stores) goes through this. Swapping the
 * persistence backend later (e.g. adding a Drive-synced layer) means
 * changing this file, not every call site.
 */

export type StorageArea = 'local' | 'sync'

function area(a: StorageArea): chrome.storage.StorageArea {
  return a === 'sync' ? chrome.storage.sync : chrome.storage.local
}

export const StorageService = {
  async get<T>(key: string, area_: StorageArea = 'local'): Promise<T | undefined> {
    const result = await area(area_).get(key)
    return result[key] as T | undefined
  },

  async set<T>(key: string, value: T, area_: StorageArea = 'local'): Promise<void> {
    await area(area_).set({ [key]: value })
  },

  async remove(key: string, area_: StorageArea = 'local'): Promise<void> {
    await area(area_).remove(key)
  },

  async clear(area_: StorageArea = 'local'): Promise<void> {
    await area(area_).clear()
  },

  /** Fires on any change to the given key, in either storage area. */
  onChange<T>(key: string, callback: (newValue: T | undefined) => void): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      _areaName: string,
    ) => {
      if (changes[key]) callback(changes[key].newValue as T | undefined)
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  },
}
