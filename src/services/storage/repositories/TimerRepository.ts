import { StorageService } from '../StorageService'
import { IDLE_TIMER, type TimerState } from '@/types'

const KEY = 'devtab.timer'

export const TimerRepository = {
  async get(): Promise<TimerState> {
    return (await StorageService.get<TimerState>(KEY)) ?? IDLE_TIMER
  },
  async save(state: TimerState): Promise<void> {
    await StorageService.set(KEY, state)
  },
}
