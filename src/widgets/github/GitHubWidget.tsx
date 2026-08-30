import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CircleDot,
  Code2,
  ExternalLink,
  Flame,
  GitCommitHorizontal,
  Github,
  GitPullRequest,
  Key,
  RefreshCw,
  Settings,
  Trophy,
  User,
  UserPlus,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { IconButton } from '@/components/ui/IconButton'
import { ContributionGraph } from '@/components/ui/ContributionGraph'
import { GitHubService } from '@/services/github/GitHubService'
import { LeetCodeService } from '@/services/leetcode/LeetCodeService'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { GitHubProfileData, LeetCodeProfileData } from '@/types'
import { cn } from '@/utils/cn'

type PlatformTab = 'github' | 'leetcode'

export function GitHubWidget() {
  const { settings, update } = useSettingsStore()
  const [activeTab, setActiveTab] = useState<PlatformTab>('github')
  const [githubData, setGithubData] = useState<GitHubProfileData | null>(null)
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Configuration modal state
  const [configOpen, setConfigOpen] = useState(false)
  const [ghUsernameInput, setGhUsernameInput] = useState('')
  const [ghTokenInput, setGhTokenInput] = useState('')
  const [lcUsernameInput, setLcUsernameInput] = useState('')

  const githubUser = settings.integrations?.githubUsername || ''
  const githubToken = settings.integrations?.githubToken || ''
  const leetcodeUser = settings.integrations?.leetcodeUsername || ''

  useEffect(() => {
    // Try loading cached data first
    GitHubService.getCachedData().then((cached) => {
      if (cached) setGithubData(cached)
    })
    LeetCodeService.getCachedData().then((cached) => {
      if (cached) setLeetcodeData(cached)
    })
  }, [])

  useEffect(() => {
    if (activeTab === 'github' && githubUser) {
      loadGitHub(githubUser, githubToken)
    } else if (activeTab === 'leetcode' && leetcodeUser) {
      loadLeetCode(leetcodeUser)
    }
  }, [activeTab, githubUser, githubToken, leetcodeUser])

  async function loadGitHub(username: string, token?: string) {
    try {
      setLoading(true)
      setError(null)
      const data = await GitHubService.fetchUserData(username, token)
      setGithubData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data.')
    } finally {
      setLoading(false)
    }
  }

  async function loadLeetCode(username: string) {
    try {
      setLoading(true)
      setError(null)
      const data = await LeetCodeService.fetchUserData(username)
      setLeetcodeData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch LeetCode data.')
    } finally {
      setLoading(false)
    }
  }

  function handleOpenConfig() {
    setGhUsernameInput(githubUser)
    setGhTokenInput(githubToken)
    setLcUsernameInput(leetcodeUser)
    setConfigOpen(true)
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault()
    const updated = {
      ...settings.integrations,
      githubUsername: ghUsernameInput.trim(),
      githubToken: ghTokenInput.trim(),
      leetcodeUsername: lcUsernameInput.trim(),
    }
    await update({ integrations: updated })
    setConfigOpen(false)

    if (ghUsernameInput.trim()) {
      loadGitHub(ghUsernameInput.trim(), ghTokenInput.trim())
    }
    if (lcUsernameInput.trim()) {
      loadLeetCode(lcUsernameInput.trim())
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle>Coding Activity</CardTitle>
          <div className="flex rounded-md border border-border bg-surface-elevated/40 p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('github')}
              className={cn(
                'flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium transition-colors',
                activeTab === 'github'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              <Github size={12} /> GitHub
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leetcode')}
              className={cn(
                'flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium transition-colors',
                activeTab === 'leetcode'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              <Code2 size={12} /> LeetCode
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            icon={<RefreshCw size={14} className={cn(loading && 'animate-spin')} />}
            label="Refresh data"
            onClick={() => {
              if (activeTab === 'github' && githubUser) loadGitHub(githubUser, githubToken)
              if (activeTab === 'leetcode' && leetcodeUser) loadLeetCode(leetcodeUser)
            }}
          />
          <IconButton
            icon={<Settings size={14} />}
            label="Configure accounts"
            onClick={handleOpenConfig}
          />
        </div>
      </CardHeader>

      <div className="flex-1 overflow-y-auto px-4 pb-3">
        {/* Error Alert */}
        {error && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 p-2.5 text-xs text-danger">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleOpenConfig}
              className="text-[11px] font-semibold underline hover:text-danger/80"
            >
              Configure
            </button>
          </div>
        )}

        {/* ── GITHUB TAB ── */}
        {activeTab === 'github' && (
          <>
            {!githubUser ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated border border-border">
                  <Github size={24} className="text-text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Connect GitHub</h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Track your daily commits, streaks, and contribution graph.
                  </p>
                </div>
                <Button size="sm" onClick={handleOpenConfig}>
                  <UserPlus size={14} /> Connect Username
                </Button>
              </div>
            ) : githubData ? (
              <div className="space-y-3">
                {/* Profile Header & Stats */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2.5">
                    {githubData.avatarUrl ? (
                      <img
                        src={githubData.avatarUrl}
                        alt=""
                        className="h-8 w-8 rounded-full border border-border"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-text-secondary">
                        <User size={16} />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-text-primary">
                          {githubData.name || githubData.username}
                        </span>
                        <a
                          href={`https://github.com/${githubData.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-text-secondary hover:text-accent flex items-center gap-0.5"
                        >
                          @{githubData.username} <ExternalLink size={10} />
                        </a>
                      </div>
                      <p className="text-[10px] text-text-secondary">
                        {githubData.publicRepos} repos · {githubData.followers} followers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs font-semibold flex items-center gap-1">
                      <Flame size={13} className="fill-amber-500/20" />
                      {githubData.currentStreak} day streak
                    </Badge>
                    <span className="text-[11px] font-semibold text-text-secondary">
                      {githubData.totalContributions} contributions
                    </span>
                  </div>
                </div>

                {/* Commit / PR / Issue mini pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-border bg-surface-elevated/40 py-1.5">
                    <span className="block font-bold text-text-primary flex items-center justify-center gap-1">
                      <GitCommitHorizontal size={13} className="text-emerald-400" />
                      {githubData.commits}
                    </span>
                    <span className="text-[10px] text-text-secondary">Recent Commits</span>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-elevated/40 py-1.5">
                    <span className="block font-bold text-text-primary flex items-center justify-center gap-1">
                      <GitPullRequest size={13} className="text-blue-400" />
                      {githubData.pullRequests}
                    </span>
                    <span className="text-[10px] text-text-secondary">Pull Requests</span>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-elevated/40 py-1.5">
                    <span className="block font-bold text-text-primary flex items-center justify-center gap-1">
                      <CircleDot size={13} className="text-purple-400" />
                      {githubData.issues}
                    </span>
                    <span className="text-[10px] text-text-secondary">Issues</span>
                  </div>
                </div>

                {/* Contribution Heatmap */}
                <div className="rounded-lg border border-border bg-surface-elevated/30 p-2.5">
                  <ContributionGraph
                    days={githubData.contributions}
                    theme="github"
                    weeksToShow={22}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="h-10 animate-pulse rounded-lg bg-surface-elevated" />
                <div className="h-28 animate-pulse rounded-lg bg-surface-elevated" />
              </div>
            )}
          </>
        )}

        {/* ── LEETCODE TAB ── */}
        {activeTab === 'leetcode' && (
          <>
            {!leetcodeUser ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated border border-border">
                  <Code2 size={24} className="text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">Connect LeetCode</h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Track your solved problems, streaks, and submission heatmap.
                  </p>
                </div>
                <Button size="sm" onClick={handleOpenConfig}>
                  <UserPlus size={14} /> Connect Username
                </Button>
              </div>
            ) : leetcodeData ? (
              <div className="space-y-3">
                {/* Profile Header & Stats */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-500 font-bold text-xs border border-amber-500/30">
                      LC
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-text-primary">
                          {leetcodeData.username}
                        </span>
                        <a
                          href={`https://leetcode.com/u/${leetcodeData.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-text-secondary hover:text-amber-500 flex items-center gap-0.5"
                        >
                          Profile <ExternalLink size={10} />
                        </a>
                      </div>
                      <p className="text-[10px] text-text-secondary flex items-center gap-1">
                        <Trophy size={11} className="text-amber-400" />
                        Rank #{leetcodeData.ranking.toLocaleString()} · {leetcodeData.acceptanceRate}% accept
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs font-semibold flex items-center gap-1">
                      <Flame size={13} className="fill-amber-500/20" />
                      {leetcodeData.currentStreak} day streak
                    </Badge>
                    <span className="text-[11px] font-semibold text-text-secondary">
                      {leetcodeData.totalSolved} solved
                    </span>
                  </div>
                </div>

                {/* Problem Difficulty Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 py-1.5">
                    <span className="block font-bold text-emerald-400">
                      {leetcodeData.easySolved}
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-medium">Easy</span>
                  </div>
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 py-1.5">
                    <span className="block font-bold text-amber-400">
                      {leetcodeData.mediumSolved}
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-medium">Medium</span>
                  </div>
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 py-1.5">
                    <span className="block font-bold text-rose-400">
                      {leetcodeData.hardSolved}
                    </span>
                    <span className="text-[10px] text-rose-400/80 font-medium">Hard</span>
                  </div>
                </div>

                {/* Submission Heatmap */}
                <div className="rounded-lg border border-border bg-surface-elevated/30 p-2.5">
                  <ContributionGraph
                    days={leetcodeData.submissions}
                    theme="leetcode"
                    weeksToShow={22}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="h-10 animate-pulse rounded-lg bg-surface-elevated" />
                <div className="h-28 animate-pulse rounded-lg bg-surface-elevated" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Account Configuration Modal */}
      <Modal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        title="Developer Account Integrations"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveConfig} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="cfg-github"
              className="mb-1 block text-xs font-semibold text-text-primary flex items-center gap-1.5"
            >
              <Github size={13} /> GitHub Username
            </label>
            <input
              id="cfg-github"
              value={ghUsernameInput}
              onChange={(e) => setGhUsernameInput(e.target.value)}
              placeholder="e.g. torvalds, dharmarajrdr..."
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
            />
          </div>

          <div>
            <label
              htmlFor="cfg-github-token"
              className="mb-1 block text-xs font-semibold text-text-primary flex items-center gap-1.5"
            >
              <Key size={13} /> GitHub Token (Optional for higher rate limits / private repos)
            </label>
            <input
              id="cfg-github-token"
              type="password"
              value={ghTokenInput}
              onChange={(e) => setGhTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
            />
          </div>

          <div>
            <label
              htmlFor="cfg-leetcode"
              className="mb-1 block text-xs font-semibold text-text-primary flex items-center gap-1.5"
            >
              <Code2 size={13} className="text-amber-500" /> LeetCode Username
            </label>
            <input
              id="cfg-leetcode"
              value={lcUsernameInput}
              onChange={(e) => setLcUsernameInput(e.target.value)}
              placeholder="e.g. neetcode, your-leetcode-handle..."
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setConfigOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save & Connect</Button>
          </div>
        </form>
      </Modal>
    </Card>
  )
}
