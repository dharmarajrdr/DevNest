import { StorageService } from '../StorageService'
import { DEFAULT_POMODORO_SETTINGS, IDLE_TIMER, type PomodoroSettings, type PomodoroState } from '@/types'

const KEY = 'devtab.pomodoro'
const SETTINGS_KEY = 'devtab.pomodoroSettings'

export const INITIAL_POMODORO_STATE: PomodoroState = {
  mode: 'focus',
  completedFocusSessions: 0,
  timer: { ...IDLE_TIMER, durationMs: DEFAULT_POMODORO_SETTINGS.focusMinutes * 60_000 },
}

export const PomodoroRepository = {
  async get(): Promise<PomodoroState> {
    return (await StorageService.get<PomodoroState>(KEY)) ?? INITIAL_POMODORO_STATE
  },
  async save(state: PomodoroState): Promise<void> {
    await StorageService.set(KEY, state)
  },
  async getSettings(): Promise<PomodoroSettings> {
    return (await StorageService.get<PomodoroSettings>(SETTINGS_KEY, 'sync')) ?? DEFAULT_POMODORO_SETTINGS
  },
  async saveSettings(settings: PomodoroSettings): Promise<void> {
    await StorageService.set(SETTINGS_KEY, settings, 'sync')
  },
}
