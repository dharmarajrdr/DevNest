import { describe, it, expect } from 'vitest'
import { elapsedMs, formatCountdown, formatStopwatch } from './time'

describe('elapsedMs', () => {
  it('returns accumulatedMs when not running (startedAt is null)', () => {
    expect(elapsedMs(null, 5000)).toBe(5000)
  })
  it('adds time since startedAt to accumulatedMs when running', () => {
    const startedAt = Date.now() - 2000
    const result = elapsedMs(startedAt, 1000)
    // ~3000ms, allow a little slack for test execution time
    expect(result).toBeGreaterThanOrEqual(3000)
    expect(result).toBeLessThan(3100)
  })
})

describe('formatStopwatch', () => {
  it('formats under a minute as mm:ss.cc', () => {
    expect(formatStopwatch(5250)).toBe('00:05.25')
  })
  it('formats over an hour with an hours segment', () => {
    expect(formatStopwatch(60 * 60 * 1000 + 1000)).toBe('01:00:01.00')
  })
  it('formats zero', () => {
    expect(formatStopwatch(0)).toBe('00:00.00')
  })
})

describe('formatCountdown', () => {
  it('rounds up to the next full second', () => {
    expect(formatCountdown(59_500)).toBe('01:00')
  })
  it('clamps negative remaining time to zero', () => {
    expect(formatCountdown(-500)).toBe('00:00')
  })
  it('formats over an hour with an hours segment', () => {
    expect(formatCountdown(90 * 60 * 1000)).toBe('01:30:00')
  })
})
