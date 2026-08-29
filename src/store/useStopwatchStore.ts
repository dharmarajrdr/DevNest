import { create } from 'zustand'
import { IDLE_STOPWATCH, type StopwatchState } from '@/types'
import { StopwatchRepository } from '@/services/storage/repositories/StopwatchRepository'
import { generateId } from '@/utils/id'
import { elapsedMs } from '@/utils/time'

interface StopwatchStore {
  state: StopwatchState
  loading: boolean
  load: () => Promise<void>
  start: () => Promise<void>
  pause: () => Promise<void>
  reset: () => Promise<void>
  lap: () => Promise<void>
}

async function persist(next: StopwatchState, set: (s: Partial<StopwatchStore>) => void) {
  set({ state: next })
  await StopwatchRepository.save(next)
}

export const useStopwatchStore = create<StopwatchStore>((set, get) => ({
  state: IDLE_STOPWATCH,
  loading: true,

  load: async () => {
    set({ loading: true })
    const state = await StopwatchRepository.get()
    set({ state, loading: false })
  },

  start: async () => {
    const { state } = get()
    if (state.status === 'running') return
    await persist({ ...state, status: 'running', startedAt: Date.now() }, set)
  },

  pause: async () => {
    const { state } = get()
    if (state.status !== 'running') return
    await persist(
      {
        ...state,
        status: 'paused',
        accumulatedMs: elapsedMs(state.startedAt, state.accumulatedMs),
        startedAt: null,
      },
      set,
    )
  },

  reset: async () => {
    await persist(IDLE_STOPWATCH, set)
  },

  lap: async () => {
    const { state } = get()
    if (state.status !== 'running') return
    const lap = { id: generateId(), elapsedMs: elapsedMs(state.startedAt, state.accumulatedMs), createdAt: new Date().toISOString() }
    await persist({ ...state, laps: [lap, ...state.laps].slice(0, 20) }, set)
  },
}))
