import type { LeetCodeProfileData, LeetCodeSubmissionDay } from '@/types'
import { StorageService } from '@/services/storage/StorageService'

const LEETCODE_CACHE_KEY = 'devtab.leetcodeData'

export function parseSubmissionCalendar(
  rawCalendar: string | Record<string, number> | undefined,
): LeetCodeSubmissionDay[] {
  let calendarObj: Record<string, number> = {}

  if (typeof rawCalendar === 'string') {
    try {
      calendarObj = JSON.parse(rawCalendar)
    } catch {
      calendarObj = {}
    }
  } else if (typeof rawCalendar === 'object' && rawCalendar !== null) {
    calendarObj = rawCalendar
  }

  // Create lookup map of "YYYY-MM-DD" -> count
  const map = new Map<string, number>()
  for (const [timestampSec, count] of Object.entries(calendarObj)) {
    const ts = parseInt(timestampSec, 10) * 1000
    if (!isNaN(ts)) {
      const d = new Date(ts).toISOString().slice(0, 10)
      map.set(d, (map.get(d) || 0) + count)
    }
  }

  // Generate continuous past 365 days
  const now = new Date()
  const days: LeetCodeSubmissionDay[] = []

  for (let i = 365; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const count = map.get(dateStr) || 0

    let level: 0 | 1 | 2 | 3 | 4 = 0
    if (count >= 10) level = 4
    else if (count >= 5) level = 3
    else if (count >= 2) level = 2
    else if (count >= 1) level = 1

    days.push({
      date: dateStr,
      count,
      level,
    })
  }

  return days
}

export function calculateLeetCodeStreak(submissions: LeetCodeSubmissionDay[]): {
  currentStreak: number
  longestStreak: number
} {
  if (!submissions || submissions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  const sorted = [...submissions].sort((a, b) => a.date.localeCompare(b.date))
  let longest = 0
  let tempStreak = 0

  for (const day of sorted) {
    if (day.count > 0) {
      tempStreak++
      if (tempStreak > longest) longest = tempStreak
    } else {
      tempStreak = 0
    }
  }

  const dateMap = new Map<string, number>()
  for (const day of sorted) {
    dateMap.set(day.date, day.count)
  }

  let curr = 0
  const checkDate = new Date()

  // Check if today has submissions
  const todayStr = checkDate.toISOString().slice(0, 10)
  const todayCount = dateMap.get(todayStr) ?? 0

  if (todayCount > 0) {
    curr++
    checkDate.setDate(checkDate.getDate() - 1)
  } else {
    // If today is 0, check starting from yesterday
    checkDate.setDate(checkDate.getDate() - 1)
  }

  while (true) {
    const dStr = checkDate.toISOString().slice(0, 10)
    const count = dateMap.get(dStr) ?? 0
    if (count > 0) {
      curr++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return {
    currentStreak: curr,
    longestStreak: Math.max(longest, curr),
  }
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export const LeetCodeService = {
  async getCachedData(): Promise<LeetCodeProfileData | null> {
    return (await StorageService.get<LeetCodeProfileData>(LEETCODE_CACHE_KEY)) ?? null
  },

  async fetchUserData(username: string, forceRefresh = false): Promise<LeetCodeProfileData> {
    if (!username.trim()) {
      throw new Error('Please provide a LeetCode username.')
    }

    const cleanUsername = username.trim()

    if (!forceRefresh) {
      const cached = await this.getCachedData()
      if (cached && cached.username.toLowerCase() === cleanUsername.toLowerCase() && cached.lastFetched) {
        const age = Date.now() - new Date(cached.lastFetched).getTime()
        if (age < CACHE_TTL_MS) {
          return cached
        }
      }
    }

    let rawData: Record<string, any> | null = null
    let lastError: Error | null = null

    // Endpoint 1: leetcode-stats-api
    try {
      const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${cleanUsername}`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.status !== 'error' && data.message !== 'user does not exist') {
          rawData = data
        } else if (data?.message === 'user does not exist') {
          throw new Error(`LeetCode user "${cleanUsername}" not found.`)
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('not found')) throw err
      lastError = err instanceof Error ? err : new Error(String(err))
    }

    // Endpoint 2: alfa-leetcode-api
    if (!rawData) {
      try {
        const res = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${cleanUsername}`)
        if (res.ok) {
          const data = await res.json()
          if (data && !data.errors) {
            rawData = {
              ranking: data.ranking || 0,
              totalSolved: data.totalSolved || (data.easySolved || 0) + (data.mediumSolved || 0) + (data.hardSolved || 0),
              easySolved: data.easySolved || 0,
              mediumSolved: data.mediumSolved || 0,
              hardSolved: data.hardSolved || 0,
              acceptanceRate: data.acceptanceRate || 0,
              submissionCalendar: data.submissionCalendar,
            }
          }
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
      }
    }

    // Endpoint 3: leetcode-api-faisalshohag
    if (!rawData) {
      try {
        const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${cleanUsername}`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.totalSolved !== undefined) {
            rawData = {
              ranking: data.ranking || 0,
              totalSolved: data.totalSolved || 0,
              easySolved: data.easySolved || 0,
              mediumSolved: data.mediumSolved || 0,
              hardSolved: data.hardSolved || 0,
              acceptanceRate: data.acceptanceRate || 0,
              submissionCalendar: data.submissionCalendar,
            }
          }
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
      }
    }

    if (!rawData) {
      // Check if we have cached data to return gracefully
      const cached = await this.getCachedData()
      if (cached && cached.username.toLowerCase() === cleanUsername.toLowerCase()) {
        return cached
      }
      throw new Error(
        lastError?.message || `Unable to reach LeetCode API for "${cleanUsername}". Please check the username or try again shortly.`,
      )
    }

    const submissions = parseSubmissionCalendar(rawData.submissionCalendar)
    const { currentStreak, longestStreak } = calculateLeetCodeStreak(submissions)

    const profile: LeetCodeProfileData = {
      username: cleanUsername,
      ranking: Number(rawData.ranking) || 0,
      totalSolved: Number(rawData.totalSolved) || 0,
      easySolved: Number(rawData.easySolved) || 0,
      mediumSolved: Number(rawData.mediumSolved) || 0,
      hardSolved: Number(rawData.hardSolved) || 0,
      acceptanceRate: Number(rawData.acceptanceRate) || 0,
      currentStreak,
      longestStreak,
      submissions,
      lastFetched: new Date().toISOString(),
    }

    await StorageService.set(LEETCODE_CACHE_KEY, profile)
    return profile
  },
}
