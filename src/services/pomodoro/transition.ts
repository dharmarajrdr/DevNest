import type { PomodoroSettings, PomodoroState } from '@/types'

/**
 * Pure phase-transition logic, deliberately kept out of the store so the
 * background service worker (which has no React/zustand context) can call
 * the exact same function when a phase's alarm fires with the tab closed.
 * One implementation, used from two contexts — not two copies to drift.
 */
export function nextPomodoroState(current: PomodoroState, settings: PomodoroSettings): PomodoroState {
  const completingFocus = current.mode === 'focus'
  const nextMode = completingFocus ? 'break' : 'focus'
  const nextMinutes = nextMode === 'focus' ? settings.focusMinutes : settings.breakMinutes
  return {
    mode: nextMode,
    completedFocusSessions: current.completedFocusSessions + (completingFocus ? 1 : 0),
    timer: { status: 'idle', durationMs: nextMinutes * 60_000, startedAt: null, accumulatedMs: 0 },
  }
}
