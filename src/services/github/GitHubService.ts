import type { GitHubActivitySummary } from '@/types'

/**
 * Placeholder for the MVP, per spec: no GitHub login required yet. This is
 * the seam a real integration replaces — swap `getActivity`'s body for an
 * authenticated fetch against the GitHub REST/GraphQL API (events,
 * pulls, issues endpoints) and nothing in GitHubWidget needs to change,
 * since it only depends on this function's return shape.
 */
export const GitHubService = {
  isConnected(): boolean {
    return false // becomes a real chrome.identity / OAuth check once wired up
  },

  async getActivity(): Promise<GitHubActivitySummary> {
    // Deliberately static, not randomized — mock data should look like a
    // believable snapshot, not flicker on every render.
    return { username: 'you', commits: 12, pullRequests: 3, issues: 2 }
  },
}
