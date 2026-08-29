import { StorageService } from '../StorageService'
import type { FocusSessionLogEntry } from '@/types'
import { generateId } from '@/utils/id'

const KEY = 'devtab.focusSessionLog'
const MAX_ENTRIES = 500 // a rolling log, not a full history — plenty for streaks/weekly stats

export const ProductivityRepository = {
  async getAll(): Promise<FocusSessionLogEntry[]> {
    return (await StorageService.get<FocusSessionLogEntry[]>(KEY)) ?? []
  },

  async logFocusSession(minutes: number): Promise<void> {
    const all = await this.getAll()
    const entry: FocusSessionLogEntry = { id: generateId(), minutes, completedAt: new Date().toISOString() }
    await StorageService.set(KEY, [entry, ...all].slice(0, MAX_ENTRIES))
  },
}
