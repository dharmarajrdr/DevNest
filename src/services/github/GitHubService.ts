import type { GitHubActivitySummary, GitHubContributionDay, GitHubProfileData } from '@/types'
import { StorageService } from '@/services/storage/StorageService'

const GITHUB_CACHE_KEY = 'devtab.githubData'

export function calculateStreaks(contributions: GitHubContributionDay[]): {
  currentStreak: number
  longestStreak: number
  totalContributions: number
} {
  if (!contributions || contributions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalContributions: 0 }
  }

  // Sort ascending by date
  const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date))

  let total = 0
  let longest = 0
  let tempStreak = 0

  for (const day of sorted) {
    total += day.count
    if (day.count > 0) {
      tempStreak++
      if (tempStreak > longest) longest = tempStreak
    } else {
      tempStreak = 0
    }
  }

  // Current streak: look backwards from today/yesterday
  const dateMap = new Map<string, number>()
  for (const day of sorted) {
    dateMap.set(day.date, day.count)
  }

  let curr = 0
  const checkDate = new Date()

  // Check if today has contributions
  const todayStr = checkDate.toISOString().slice(0, 10)
  const todayCount = dateMap.get(todayStr) ?? 0

  if (todayCount > 0) {
    curr++
    checkDate.setDate(checkDate.getDate() - 1)
  } else {
    // If today is 0, check from yesterday
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
    totalContributions: total,
  }
}

export const GitHubService = {
  async getCachedData(): Promise<GitHubProfileData | null> {
    return (await StorageService.get<GitHubProfileData>(GITHUB_CACHE_KEY)) ?? null
  },

  async fetchUserData(username: string, token?: string): Promise<GitHubProfileData> {
    if (!username.trim()) {
      throw new Error('Please provide a GitHub username.')
    }

    const cleanUsername = username.trim().toLowerCase()
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    }
    if (token && token.trim()) {
      headers.Authorization = `Bearer ${token.trim()}`
    }

    // 1. Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${cleanUsername}`, { headers })
    if (!userRes.ok) {
      if (userRes.status === 404) {
        throw new Error(`GitHub user "${cleanUsername}" not found.`)
      }
      if (userRes.status === 403) {
        throw new Error('GitHub API rate limit exceeded. You can add a GitHub Personal Access Token in Settings.')
      }
      throw new Error(`GitHub API error: ${userRes.statusText}`)
    }

    const userData = await userRes.json()

    // 2. Fetch events for recent commit/pr/issue counts
    let commits = 0
    let pullRequests = 0
    let issues = 0

    try {
      const eventsRes = await fetch(`https://api.github.com/users/${cleanUsername}/events?per_page=100`, { headers })
      if (eventsRes.ok) {
        const events = await eventsRes.json()
        if (Array.isArray(events)) {
          for (const ev of events) {
            if (ev.type === 'PushEvent') {
              commits += ev.payload?.commits?.length || 1
            } else if (ev.type === 'PullRequestEvent') {
              pullRequests++
            } else if (ev.type === 'IssuesEvent') {
              issues++
            }
          }
        }
      }
    } catch {
      // Non-fatal if events API fails
    }

    // 3. Fetch contribution calendar from public contributions API
    let contributions: GitHubContributionDay[] = []
    let totalContribsFromApi = 0

    try {
      const contribRes = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${cleanUsername}?y=last`,
      )
      if (contribRes.ok) {
        const contribData = await contribRes.json()
        if (contribData.contributions && Array.isArray(contribData.contributions)) {
          contributions = contribData.contributions.map((c: { date: string; count: number; level: number }) => ({
            date: c.date,
            count: Number(c.count) || 0,
            level: (Math.min(4, Math.max(0, Number(c.level) || 0))) as 0 | 1 | 2 | 3 | 4,
          }))
          totalContribsFromApi = Number(contribData.total?.lastYear) || 0
        }
      }
    } catch {
      // If third-party contributions mirror is unavailable, generate from past year dates
    }

    // Fallback if contributions array is empty
    if (contributions.length === 0) {
      const now = new Date()
      for (let i = 365; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        contributions.push({
          date: d.toISOString().slice(0, 10),
          count: 0,
          level: 0,
        })
      }
    }

    const { currentStreak, longestStreak, totalContributions } = calculateStreaks(contributions)

    const profile: GitHubProfileData = {
      username: cleanUsername,
      name: userData.name || cleanUsername,
      avatarUrl: userData.avatar_url,
      bio: userData.bio || '',
      publicRepos: userData.public_repos || 0,
      followers: userData.followers || 0,
      totalContributions: totalContribsFromApi || totalContributions,
      currentStreak,
      longestStreak,
      contributions,
      commits,
      pullRequests,
      issues,
      lastFetched: new Date().toISOString(),
    }

    await StorageService.set(GITHUB_CACHE_KEY, profile)
    return profile
  },

  async getActivity(): Promise<GitHubActivitySummary> {
    const cached = await this.getCachedData()
    if (cached) {
      return {
        username: cached.username,
        commits: cached.commits,
        pullRequests: cached.pullRequests,
        issues: cached.issues,
      }
    }
    return { username: 'you', commits: 0, pullRequests: 0, issues: 0 }
  },
}
