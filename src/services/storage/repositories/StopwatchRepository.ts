import { StorageService } from '../StorageService'
import { IDLE_STOPWATCH, type StopwatchState } from '@/types'

// Local, not sync — laps can grow larger than a sync-quota item comfortably
// allows, and there's no real value in a stopwatch following you across
// machines mid-run.
const KEY = 'devtab.stopwatch'

export const StopwatchRepository = {
  async get(): Promise<StopwatchState> {
    return (await StorageService.get<StopwatchState>(KEY)) ?? IDLE_STOPWATCH
  },
  async save(state: StopwatchState): Promise<void> {
    await StorageService.set(KEY, state)
  },
}
