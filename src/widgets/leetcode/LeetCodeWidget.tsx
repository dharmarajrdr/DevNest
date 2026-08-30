import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Code2,
  ExternalLink,
  Flame,
  RefreshCw,
  Settings,
  Trophy,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { IconButton } from '@/components/ui/IconButton'
import { ContributionGraph } from '@/components/ui/ContributionGraph'
import { LeetCodeService } from '@/services/leetcode/LeetCodeService'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { LeetCodeProfileData } from '@/types'

export function LeetCodeWidget() {
  const { settings, update } = useSettingsStore()
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Configuration modal state
  const [configOpen, setConfigOpen] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')

  const leetcodeUser = settings.integrations?.leetcodeUsername || ''

  useEffect(() => {
    // Try loading cached data first
    LeetCodeService.getCachedData().then((cached) => {
      if (cached) setLeetcodeData(cached)
    })
  }, [])

  useEffect(() => {
    if (leetcodeUser) {
      loadLeetCode(leetcodeUser, false)
    }
  }, [leetcodeUser])

  async function loadLeetCode(username: string, forceRefresh = false) {
    try {
      setLoading(true)
      setError(null)
      const data = await LeetCodeService.fetchUserData(username, forceRefresh)
      setLeetcodeData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch LeetCode data.')
    } finally {
      setLoading(false)
    }
  }

  function handleOpenConfig() {
    setUsernameInput(leetcodeUser)
    setConfigOpen(true)
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault()
    const cleanUser = usernameInput.trim()
    const updated = {
      ...settings.integrations,
      leetcodeUsername: cleanUser,
    }
    await update({ integrations: updated })
    setConfigOpen(false)

    if (cleanUser) {
      loadLeetCode(cleanUser, true)
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-amber-500" />
          <CardTitle>LeetCode Activity</CardTitle>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
            label="Refresh LeetCode data"
            onClick={() => {
              if (leetcodeUser) loadLeetCode(leetcodeUser, true)
            }}
          />
          <IconButton
            icon={<Settings size={14} />}
            label="Configure LeetCode account"
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
              onClick={() => leetcodeUser && loadLeetCode(leetcodeUser, true)}
              className="text-[11px] font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {!leetcodeUser ? (
          /* Empty / Prompt to connect state */
          <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-amber-500 mb-3">
              <Code2 size={24} />
            </div>
            <h4 className="text-xs font-semibold text-text-primary">Connect your LeetCode</h4>
            <p className="text-[11px] text-text-secondary mt-1 max-w-xs leading-relaxed">
              Show your 12-month problem submission heatmap, Easy/Medium/Hard breakdown, and streak.
            </p>
            <Button size="sm" onClick={handleOpenConfig} className="mt-3 bg-amber-600 hover:bg-amber-500 text-white">
              Connect Account
            </Button>
          </div>
        ) : (
          <>
            {/* User Profile Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 shrink-0 font-bold text-xs border border-amber-500/20">
                  <Code2 size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-text-primary truncate">
                      {leetcodeUser}
                    </span>
                    <a
                      href={`https://leetcode.com/u/${leetcodeUser}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-amber-500"
                      title="Open LeetCode Profile"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <span className="text-[10px] text-text-secondary block truncate">
                    Global Rank: #{leetcodeData?.ranking ? leetcodeData.ranking.toLocaleString() : 'N/A'} • {leetcodeData?.acceptanceRate ?? 0}% acceptance
                  </span>
                </div>
              </div>

              {/* Streak Badge */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 text-[11px] py-1 px-2.5">
                  <Flame size={13} className="text-amber-400 fill-amber-400" />
                  <span className="font-bold">{leetcodeData?.currentStreak ?? 0}</span>
                  <span>day streak</span>
                </Badge>
              </div>
            </div>

            {/* Quick Metrics Bar (Easy, Medium, Hard, Total) */}
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-lg border border-border bg-surface-elevated/40 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Easy</span>
                </div>
                <span className="block text-xs font-bold text-text-primary mt-0.5">
                  {leetcodeData?.easySolved ?? 0}
                </span>
              </div>
              <div className="rounded-lg border border-border bg-surface-elevated/40 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Medium</span>
                </div>
                <span className="block text-xs font-bold text-text-primary mt-0.5">
                  {leetcodeData?.mediumSolved ?? 0}
                </span>
              </div>
              <div className="rounded-lg border border-border bg-surface-elevated/40 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-rose-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span>Hard</span>
                </div>
                <span className="block text-xs font-bold text-text-primary mt-0.5">
                  {leetcodeData?.hardSolved ?? 0}
                </span>
              </div>
              <div className="rounded-lg border border-border bg-surface-elevated/40 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400">
                  <Trophy size={11} />
                  <span>Total</span>
                </div>
                <span className="block text-xs font-bold text-text-primary mt-0.5">
                  {leetcodeData?.totalSolved ?? 0}
                </span>
              </div>
            </div>

            {/* Responsive 12-Month Submission Heatmap */}
            <div className="w-full flex-1 flex flex-col justify-center min-h-[110px]">
              <ContributionGraph
                days={leetcodeData?.submissions || []}
                theme="leetcode"
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
        title="Configure LeetCode Account"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label
              htmlFor="cfg-leetcode"
              className="mb-1 block text-xs font-semibold text-text-primary flex items-center gap-1.5"
            >
              <Code2 size={13} className="text-amber-500" /> LeetCode Username
            </label>
            <input
              id="cfg-leetcode"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="e.g. neetcode, your-leetcode-handle..."
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setConfigOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white">
              Save & Connect
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  )
}

