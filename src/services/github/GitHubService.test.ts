import { describe, it, expect, beforeEach } from 'vitest'
import { installChromeMock } from '@/test/chromeMock'
import { calculateStreaks } from './GitHubService'
import type { GitHubContributionDay } from '@/types'

beforeEach(() => {
  installChromeMock()
})

describe('GitHubService calculateStreaks', () => {
  it('calculates streaks correctly for continuous daily contributions', () => {
    const today = new Date()
    const contributions: GitHubContributionDay[] = []

    for (let i = 10; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      contributions.push({
        date: d.toISOString().slice(0, 10),
        count: i === 5 ? 0 : 3, // Break streak at 5 days ago
        level: i === 5 ? 0 : 2,
      })
    }

    const { currentStreak, longestStreak, totalContributions } = calculateStreaks(contributions)
    // 0, 1, 2, 3, 4 days ago had contributions -> current streak = 5 (including today if count > 0)
    expect(currentStreak).toBe(5)
    expect(longestStreak).toBe(5)
    expect(totalContributions).toBe(30)
  })

  it('returns 0 streaks when all days have 0 contributions', () => {
    const contributions: GitHubContributionDay[] = [
      { date: '2026-08-28', count: 0, level: 0 },
      { date: '2026-08-29', count: 0, level: 0 },
      { date: '2026-08-30', count: 0, level: 0 },
    ]
    const { currentStreak, longestStreak } = calculateStreaks(contributions)
    expect(currentStreak).toBe(0)
    expect(longestStreak).toBe(0)
  })

  it('handles empty contribution array gracefully', () => {
    const { currentStreak, longestStreak, totalContributions } = calculateStreaks([])
    expect(currentStreak).toBe(0)
    expect(longestStreak).toBe(0)
    expect(totalContributions).toBe(0)
  })
})
