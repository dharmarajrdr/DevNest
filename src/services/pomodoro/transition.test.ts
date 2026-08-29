import { describe, it, expect } from 'vitest'
import { nextPomodoroState } from './transition'
import type { PomodoroSettings, PomodoroState } from '@/types'

const settings: PomodoroSettings = { focusMinutes: 25, breakMinutes: 5 }

function state(overrides: Partial<PomodoroState> = {}): PomodoroState {
  return {
    mode: 'focus',
    completedFocusSessions: 0,
    timer: { status: 'running', durationMs: 25 * 60_000, startedAt: Date.now(), accumulatedMs: 0 },
    ...overrides,
  }
}

describe('nextPomodoroState', () => {
  it('switches focus to break and increments the session count', () => {
    const next = nextPomodoroState(state({ mode: 'focus', completedFocusSessions: 2 }), settings)
    expect(next.mode).toBe('break')
    expect(next.completedFocusSessions).toBe(3)
    expect(next.timer.durationMs).toBe(5 * 60_000)
  })

  it('switches break to focus without incrementing the session count', () => {
    const next = nextPomodoroState(state({ mode: 'break', completedFocusSessions: 3 }), settings)
    expect(next.mode).toBe('focus')
    expect(next.completedFocusSessions).toBe(3)
    expect(next.timer.durationMs).toBe(25 * 60_000)
  })

  it('always resets the new phase timer to idle with zero elapsed', () => {
    const next = nextPomodoroState(state(), settings)
    expect(next.timer.status).toBe('idle')
    expect(next.timer.accumulatedMs).toBe(0)
    expect(next.timer.startedAt).toBeNull()
  })

  it('respects custom durations from settings', () => {
    const customSettings: PomodoroSettings = { focusMinutes: 50, breakMinutes: 10 }
    const next = nextPomodoroState(state({ mode: 'focus' }), customSettings)
    expect(next.timer.durationMs).toBe(10 * 60_000)
  })
})
