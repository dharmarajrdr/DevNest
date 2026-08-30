import { useEffect } from 'react'
import { RefreshCw, Cloud, CheckCircle2, AlertCircle, LogOut, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useSyncStore } from '@/store/useSyncStore'

function formatLastSynced(iso: string | null): string {
  if (!iso) return 'Never'
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function SyncSection() {
  const { profile, status, lastSyncedAt, error, hydrate, signIn, signOut, syncNow } = useSyncStore()

  useEffect(() => {
    hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-text-primary">Google Drive Cloud Sync</h4>
        <p className="text-xs text-text-secondary">
          Sync your tasks, shortcuts, snippets, notes, and settings securely to your private Google Drive app storage.
        </p>
      </div>

      {!profile ? (
        <div className="rounded-lg border border-border bg-surface-elevated/40 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Cloud size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="text-xs font-semibold text-text-primary">Not connected</h5>
              <p className="mt-1 text-xs text-text-secondary">
                Connect your Google account to automatically backup and sync your workspace across devices.
              </p>
              <div className="mt-3">
                <Button size="sm" onClick={() => signIn()} disabled={status === 'syncing'}>
                  <LogIn size={13} />
                  {status === 'syncing' ? 'Signing in…' : 'Sign in with Google'}
                </Button>
              </div>
              {status === 'error' && error && (
                <p className="mt-2 flex items-center gap-1 text-xs text-danger">
                  <AlertCircle size={13} /> {error}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border border-border bg-surface-elevated/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile.pictureUrl ? (
                <img
                  src={profile.pictureUrl}
                  alt={profile.name}
                  className="h-9 w-9 rounded-full border border-border object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                  {profile.name?.slice(0, 1).toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-text-primary">{profile.name}</p>
                <p className="truncate text-[11px] text-text-secondary">{profile.email}</p>
              </div>
            </div>

            <Badge
              className={
                status === 'error'
                  ? 'bg-danger/10 text-danger border border-danger/30'
                  : status === 'syncing'
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'bg-success/10 text-success border border-success/30'
              }
            >
              {status === 'syncing' ? (
                <span className="flex items-center gap-1">
                  <RefreshCw size={10} className="animate-spin" /> Syncing
                </span>
              ) : status === 'error' ? (
                <span className="flex items-center gap-1">
                  <AlertCircle size={10} /> Error
                </span>
              ) : (
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle2 size={10} /> Connected
                </span>
              )}
            </Badge>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] text-text-secondary">
            <span>Last synced: {formatLastSynced(lastSyncedAt)}</span>
            <span
              className={
                status === 'error'
                  ? 'text-danger'
                  : status === 'syncing'
                    ? 'text-accent'
                    : 'text-success'
              }
            >
              {status === 'syncing'
                ? 'Syncing changes…'
                : status === 'error'
                  ? 'Sync issue encountered'
                  : status === 'offline'
                    ? 'Offline'
                    : 'Up to date'}
            </span>
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => syncNow()}
              disabled={status === 'syncing'}
            >
              <RefreshCw size={12} className={status === 'syncing' ? 'animate-spin' : ''} />
              Sync now
            </Button>
            <Button size="sm" variant="ghost" onClick={() => signOut()}>
              <LogOut size={12} />
              Sign out
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
