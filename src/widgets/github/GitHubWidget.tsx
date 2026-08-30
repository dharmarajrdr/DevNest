import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CircleDot,
  ExternalLink,
  Flame,
  GitCommitHorizontal,
  Github,
  GitPullRequest,
  RefreshCw,
  Settings,
  User,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { IconButton } from '@/components/ui/IconButton'
import { ContributionGraph } from '@/components/ui/ContributionGraph'
import { GitHubService } from '@/services/github/GitHubService'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { GitHubProfileData } from '@/types'

export function GitHubWidget() {
  const { settings, update } = useSettingsStore()
  const [githubData, setGithubData] = useState<GitHubProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Configuration modal state
  const [configOpen, setConfigOpen] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')

  const githubUser = settings.integrations?.githubUsername || ''

  useEffect(() => {
    // Try loading cached data first
    GitHubService.getCachedData().then((cached) => {
      if (cached) setGithubData(cached)
    })
  }, [])

  useEffect(() => {
    if (githubUser) {
      loadGitHub(githubUser, false)
    }
  }, [githubUser])

  async function loadGitHub(username: string, forceRefresh = false) {
    try {
      setLoading(true)
      setError(null)
      const data = await GitHubService.fetchUserData(username, forceRefresh)
      setGithubData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data.')
    } finally {
      setLoading(false)
    }
  }

  function handleOpenConfig() {
    setUsernameInput(githubUser)
    setConfigOpen(true)
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault()
    const cleanUser = usernameInput.trim()
    const updated = {
      ...settings.integrations,
      githubUsername: cleanUser,
    }
    await update({ integrations: updated })
    setConfigOpen(false)

    if (cleanUser) {
      loadGitHub(cleanUser, true)
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Github size={16} className="text-text-primary" />
          <CardTitle>GitHub Activity</CardTitle>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
            label="Refresh GitHub data"
            onClick={() => {
              if (githubUser) loadGitHub(githubUser, true)
            }}
          />
          <IconButton
            icon={<Settings size={14} />}
            label="Configure GitHub account"
            onClick={handleOpenConfig}
          />
        </div>
      </CardHeader>

      <div className="flex flex-1 flex-col justify-between p-4 pt-1 gap-3 overflow-hidden">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            <AlertCircle size={14} className="shrink-0" />
            <span className="truncate flex-1">{error}</span>
            <button
              onClick={() => githubUser && loadGitHub(githubUser, true)}
              className="text-[11px] font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {!githubUser ? (
          /* Empty / Prompt to connect state */
          <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-text-secondary mb-3">
              <Github size={24} />
            </div>
            <h4 className="text-xs font-semibold text-text-primary">Connect your GitHub</h4>
            <p className="text-[11px] text-text-secondary mt-1 max-w-xs leading-relaxed">
              Show your 12-month contribution heatmap, commits, PRs, and active daily streak.
            </p>
            <Button size="sm" onClick={handleOpenConfig} className="mt-3">
              Connect Account
            </Button>
          </div>
        ) : (
          <>
            {/* User Profile Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {githubData?.avatarUrl ? (
                  <img
                    src={githubData.avatarUrl}
                    alt={githubData.username}
                    className="h-8 w-8 rounded-full border border-border shrink-0"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-text-secondary shrink-0">
                    <User size={16} />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-text-primary truncate">
                      {githubData?.name || githubUser}
                    </span>
                    <a
                      href={`https://github.com/${githubUser}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-accent"
                      title="Open GitHub Profile"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <span className="text-[10px] text-text-secondary block truncate">
                    @{githubUser} • {githubData?.publicRepos ?? 0} repos • {githubData?.followers ?? 0} followers
                  </span>
                </div>
              </div>

              {/* Streak Badge */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 text-[11px] py-1 px-2.5">
                  <Flame size={13} className="text-emerald-400 fill-emerald-400" />
                  <span className="font-bold">{githubData?.currentStreak ?? 0}</span>
                  <span>day streak</span>
                </Badge>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-lg border border-border bg-surface-elevated/40 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-text-secondary">
                  <GitCommitHorizontal size={11} />
                  <span>Commits</span>
                </div>
                <span className="block text-xs font-bold text-text-primary mt-0.5">
                  {githubData?.commits ?? 0}
                </span>
              </div>
              <div className="rounded-lg border border-border bg-surface-elevated/40 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-text-secondary">
                  <GitPullRequest size={11} />
                  <span>PRs</span>
                </div>
                <span className="block text-xs font-bold text-text-primary mt-0.5">
                  {githubData?.pullRequests ?? 0}
                </span>
              </div>
              <div className="rounded-lg border border-border bg-surface-elevated/40 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-text-secondary">
                  <CircleDot size={11} />
                  <span>Issues</span>
                </div>
                <span className="block text-xs font-bold text-text-primary mt-0.5">
                  {githubData?.issues ?? 0}
                </span>
              </div>
              <div className="rounded-lg border border-border bg-surface-elevated/40 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400">
                  <Flame size={11} />
                  <span>Total</span>
                </div>
                <span className="block text-xs font-bold text-text-primary mt-0.5">
                  {githubData?.totalContributions ?? 0}
                </span>
              </div>
            </div>

            {/* Responsive 12-Month Contribution Heatmap */}
            <div className="w-full flex-1 flex flex-col justify-center min-h-[110px]">
              <ContributionGraph
                days={githubData?.contributions || []}
                theme="github"
                weeksToShow={52}
              />
            </div>
          </>
        )}
      </div>

      {/* Inline Configuration Modal */}
      <Modal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        title="Configure GitHub Account"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label
              htmlFor="cfg-github"
              className="mb-1 block text-xs font-semibold text-text-primary flex items-center gap-1.5"
            >
              <Github size={13} /> GitHub Username
            </label>
            <input
              id="cfg-github"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="e.g. torvalds, octocat..."
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
              autoFocus
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
