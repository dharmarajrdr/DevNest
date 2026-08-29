import { create } from 'zustand'
import { IDLE_TIMER, type TimerState } from '@/types'
import { TimerRepository } from '@/services/storage/repositories/TimerRepository'
import { TimerAlarmService } from '@/services/alarms/CountdownAlarmService'
import { elapsedMs } from '@/utils/time'

export const PRESET_MINUTES = [5, 10, 15, 25, 30, 45, 60]

interface TimerStore {
  state: TimerState
  loading: boolean
  load: () => Promise<void>
  setDuration: (minutes: number) => Promise<void>
  start: () => Promise<void>
  pause: () => Promise<void>
  reset: () => Promise<void>
  /** Called by the widget's ticker when the countdown hits zero, so the UI
   *  updates immediately rather than waiting for the next storage read. */
  markFinishedLocally: () => void
}

async function persist(next: TimerState, set: (s: Partial<TimerStore>) => void) {
  set({ state: next })
  await TimerRepository.save(next)
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  state: IDLE_TIMER,
  loading: true,

  load: async () => {
    set({ loading: true })
    const state = await TimerRepository.get()
    set({ state, loading: false })
  },

  setDuration: async (minutes) => {
    const state: TimerState = { status: 'idle', durationMs: minutes * 60_000, startedAt: null, accumulatedMs: 0 }
    await TimerAlarmService.cancel()
    await persist(state, set)
  },

  start: async () => {
    const { state } = get()
    if (state.status === 'running') return
    const remaining = state.durationMs - state.accumulatedMs
    if (remaining <= 0) return
    const next: TimerState = { ...state, status: 'running', startedAt: Date.now() }
    await TimerAlarmService.schedule(Date.now() + remaining)
    await persist(next, set)
  },

  pause: async () => {
    const { state } = get()
    if (state.status !== 'running') return
    await TimerAlarmService.cancel()
    await persist(
      { ...state, status: 'paused', accumulatedMs: elapsedMs(state.startedAt, state.accumulatedMs), startedAt: null },
      set,
    )
  },

  reset: async () => {
    await TimerAlarmService.cancel()
    await persist({ ...IDLE_TIMER, durationMs: get().state.durationMs }, set)
  },

  markFinishedLocally: () => {
    const { state } = get()
    if (state.status !== 'running') return
    set({ state: { ...state, status: 'finished', accumulatedMs: state.durationMs, startedAt: null } })
  },
}))
