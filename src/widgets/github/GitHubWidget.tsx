import { useEffect, useState } from 'react'
import { Github, GitCommitHorizontal, GitPullRequest, CircleDot } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GitHubService } from '@/services/github/GitHubService'
import type { GitHubActivitySummary } from '@/types'

export function GitHubWidget() {
  const [activity, setActivity] = useState<GitHubActivitySummary | null>(null)

  useEffect(() => {
    GitHubService.getActivity().then(setActivity)
  }, [])

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>GitHub Activity</CardTitle>
        <Badge>Mock data</Badge>
      </CardHeader>

      {!activity ? (
        <div className="flex-1 animate-pulse px-5 pb-4">
          <div className="h-16 rounded-lg bg-surface-elevated" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-4 px-5 pb-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="flex items-center justify-center gap-1 text-lg font-semibold text-text-primary">
                <GitCommitHorizontal size={14} className="text-accent" />
                {activity.commits}
              </p>
              <p className="text-[10px] text-text-secondary">Commits</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-lg font-semibold text-text-primary">
                <GitPullRequest size={14} className="text-accent-secondary" />
                {activity.pullRequests}
              </p>
              <p className="text-[10px] text-text-secondary">Pull requests</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-lg font-semibold text-text-primary">
                <CircleDot size={14} className="text-warning" />
                {activity.issues}
              </p>
              <p className="text-[10px] text-text-secondary">Issues</p>
            </div>
          </div>
          <button
            disabled
            className="flex items-center justify-center gap-1.5 self-center rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-text-secondary opacity-60"
          >
            <Github size={12} /> Connect GitHub (coming soon)
          </button>
        </div>
      )}
    </Card>
  )
}
