import { create } from 'zustand'
import { DEFAULT_POMODORO_SETTINGS, type PomodoroSettings, type PomodoroState } from '@/types'
import { PomodoroRepository, INITIAL_POMODORO_STATE } from '@/services/storage/repositories/PomodoroRepository'
import { ProductivityRepository } from '@/services/storage/repositories/ProductivityRepository'
import { PomodoroAlarmService } from '@/services/alarms/CountdownAlarmService'
import { nextPomodoroState } from '@/services/pomodoro/transition'
import { elapsedMs } from '@/utils/time'

interface PomodoroStore {
  state: PomodoroState
  settings: PomodoroSettings
  loading: boolean
  load: () => Promise<void>
  start: () => Promise<void>
  pause: () => Promise<void>
  skip: () => Promise<void>
  reset: () => Promise<void>
  updateSettings: (patch: Partial<PomodoroSettings>) => Promise<void>
  markFinishedLocally: () => void
}

async function persist(next: PomodoroState, set: (s: Partial<PomodoroStore>) => void) {
  set({ state: next })
  await PomodoroRepository.save(next)
}

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  state: INITIAL_POMODORO_STATE,
  settings: DEFAULT_POMODORO_SETTINGS,
  loading: true,

  load: async () => {
    set({ loading: true })
    const [state, settings] = await Promise.all([PomodoroRepository.get(), PomodoroRepository.getSettings()])
    set({ state, settings, loading: false })
  },

  start: async () => {
    const { state } = get()
    if (state.timer.status === 'running') return
    const remaining = state.timer.durationMs - state.timer.accumulatedMs
    if (remaining <= 0) return
    await PomodoroAlarmService.schedule(Date.now() + remaining)
    await persist({ ...state, timer: { ...state.timer, status: 'running', startedAt: Date.now() } }, set)
  },

  pause: async () => {
    const { state } = get()
    if (state.timer.status !== 'running') return
    await PomodoroAlarmService.cancel()
    await persist(
      {
        ...state,
        timer: {
          ...state.timer,
          status: 'paused',
          accumulatedMs: elapsedMs(state.timer.startedAt, state.timer.accumulatedMs),
          startedAt: null,
        },
      },
      set,
    )
  },

  skip: async () => {
    await PomodoroAlarmService.cancel()
    const { state, settings } = get()
    const completingFocus = state.mode === 'focus'
    await persist(nextPomodoroState(state, settings), set)
    // Manual skip never goes through the background alarm handler (there's
    // no alarm to fire), so this is the only place a skipped-through focus
    // phase gets counted for the Productivity widget.
    if (completingFocus) await ProductivityRepository.logFocusSession(settings.focusMinutes)
  },

  reset: async () => {
    await PomodoroAlarmService.cancel()
    const { settings } = get()
    await persist(
      { mode: 'focus', completedFocusSessions: 0, timer: { status: 'idle', durationMs: settings.focusMinutes * 60_000, startedAt: null, accumulatedMs: 0 } },
      set,
    )
  },

  updateSettings: async (patch) => {
    const settings = { ...get().settings, ...patch }
    await PomodoroRepository.saveSettings(settings)
    set({ settings })
    // If idle, immediately reflect a changed duration for the current mode.
    const { state } = get()
    if (state.timer.status === 'idle') {
      const minutes = state.mode === 'focus' ? settings.focusMinutes : settings.breakMinutes
      await persist({ ...state, timer: { ...state.timer, durationMs: minutes * 60_000 } }, set)
    }
  },

  markFinishedLocally: () => {
    const { state, settings } = get()
    if (state.timer.status !== 'running') return
    set({ state: nextPomodoroState(state, settings) })
  },
}))
