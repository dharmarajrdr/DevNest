import { useState } from 'react'
import { CheckCircle2, Code2, ExternalLink, Github, Key, Save, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/store/useSettingsStore'

export function IntegrationsSection() {
  const { settings, update } = useSettingsStore()
  const [githubUser, setGithubUser] = useState(settings.integrations?.githubUsername || '')
  const [githubToken, setGithubToken] = useState(settings.integrations?.githubToken || '')
  const [leetcodeUser, setLeetcodeUser] = useState(settings.integrations?.leetcodeUsername || '')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await update({
        integrations: {
          githubUsername: githubUser.trim(),
          githubToken: githubToken.trim(),
          leetcodeUsername: leetcodeUser.trim(),
        },
      })
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Developer Account Integrations</h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Connect your GitHub and LeetCode profiles to show your live streak and contribution graph.
        </p>
      </div>

      {/* GitHub Account Card */}
      <div className="rounded-lg border border-border bg-surface-elevated/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <Github size={16} />
            <span>GitHub Profile</span>
          </div>
          {settings.integrations?.githubUsername && (
            <a
              href={`https://github.com/${settings.integrations.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-accent hover:underline flex items-center gap-1"
            >
              View profile <ExternalLink size={10} />
            </a>
          )}
        </div>

        <div className="space-y-2.5">
          <div>
            <label htmlFor="settings-gh-user" className="mb-1 block text-xs text-text-secondary">
              GitHub Username
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                <User size={13} />
              </div>
              <input
                id="settings-gh-user"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                placeholder="e.g. torvalds, octocat"
                className="w-full rounded-lg border border-border bg-bg pl-8 pr-3 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="settings-gh-token" className="mb-1 block text-xs text-text-secondary">
              Personal Access Token (Optional — for private contributions & higher API rate limits)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                <Key size={13} />
              </div>
              <input
                id="settings-gh-token"
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-lg border border-border bg-bg pl-8 pr-3 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* LeetCode Account Card */}
      <div className="rounded-lg border border-border bg-surface-elevated/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
            <Code2 size={16} />
            <span>LeetCode Profile</span>
          </div>
          {settings.integrations?.leetcodeUsername && (
            <a
              href={`https://leetcode.com/u/${settings.integrations.leetcodeUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-amber-500 hover:underline flex items-center gap-1"
            >
              View profile <ExternalLink size={10} />
            </a>
          )}
        </div>

        <div>
          <label htmlFor="settings-lc-user" className="mb-1 block text-xs text-text-secondary">
            LeetCode Username
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
              <User size={13} />
            </div>
            <input
              id="settings-lc-user"
              value={leetcodeUser}
              onChange={(e) => setLeetcodeUser(e.target.value)}
              placeholder="e.g. neetcode, your-username"
              className="w-full rounded-lg border border-border bg-bg pl-8 pr-3 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Submit / Feedback */}
      <div className="flex items-center justify-between pt-1">
        <div>
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-success font-medium animate-fadeIn">
              <CheckCircle2 size={14} /> Integrations saved successfully!
            </span>
          )}
        </div>
        <Button type="submit" disabled={saving}>
          <Save size={14} /> Save Integrations
        </Button>
      </div>
    </form>
  )
}

