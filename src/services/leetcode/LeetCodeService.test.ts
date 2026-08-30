import { describe, it, expect } from 'vitest'
import { calculateLeetCodeStreak, parseSubmissionCalendar } from './LeetCodeService'

describe('LeetCodeService parseSubmissionCalendar', () => {
  it('parses JSON string timestamp calendar accurately', () => {
    const todaySec = Math.floor(Date.now() / 1000)
    const mockCalendar = JSON.stringify({
      [todaySec]: 3,
      [todaySec - 86400]: 5,
    })

    const days = parseSubmissionCalendar(mockCalendar)
    expect(days).toHaveLength(366)

    const todayStr = new Date().toISOString().slice(0, 10)
    const todayEntry = days.find((d) => d.date === todayStr)
    expect(todayEntry).toBeDefined()
    expect(todayEntry?.count).toBe(3)
    expect(todayEntry?.level).toBe(2)
  })

  it('handles invalid or empty raw calendar input', () => {
    const days = parseSubmissionCalendar('invalid-json')
    expect(days).toHaveLength(366)
    expect(days.every((d) => d.count === 0)).toBe(true)
  })
})

describe('LeetCodeService calculateLeetCodeStreak', () => {
  it('calculates current and longest streaks', () => {
    const today = new Date()
    const submissions = []

    for (let i = 20; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      // 0..3: count 2 (streak 4), 4: count 0, 5..12: count 3 (streak 8)
      let count = 0
      if (i <= 3) count = 2
      else if (i === 4) count = 0
      else if (i <= 12) count = 3

      submissions.push({
        date: d.toISOString().slice(0, 10),
        count,
        level: (count > 0 ? 2 : 0) as 0 | 1 | 2 | 3 | 4,
      })
    }

    const { currentStreak, longestStreak } = calculateLeetCodeStreak(submissions)
    expect(currentStreak).toBe(4)
    expect(longestStreak).toBe(8)
  })
})

