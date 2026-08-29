import { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSyncStore } from '@/store/useSyncStore'

function formatLastSynced(iso: string | null): string {
  if (!iso) return 'Never'
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function SyncSection() {
  const { profile, status, lastSyncedAt, error, hydrate, signIn, signOut, syncNow } = useSyncStore()

  useEffect(() => {
    hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase text-text-secondary">Sync</h3>

      {!profile ? (
        <div>
          <p className="mb-2 text-xs text-text-secondary">
            Sign in with Google to sync tasks, shortcuts, notes, snippets, and settings to your
            Drive — nothing is visible in your normal Drive, and no other app can read it.
          </p>
          <Button size="sm" onClick={() => signIn()} disabled={status === 'syncing'}>
            {status === 'syncing' ? 'Signing in…' : 'Sign in with Google'}
          </Button>
          {status === 'error' && error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {profile.pictureUrl && (
              <img src={profile.pictureUrl} alt="" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm text-text-primary">{profile.name}</p>
              <p className="truncate text-[11px] text-text-secondary">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-text-secondary">
            <span>Last synced: {formatLastSynced(lastSyncedAt)}</span>
            <span
              className={
                status === 'error' ? 'text-danger' : status === 'syncing' ? 'text-accent' : 'text-success'
              }
            >
              {status === 'syncing' ? 'Syncing…' : status === 'error' ? 'Sync issue' : status === 'offline' ? 'Offline' : 'Up to date'}
            </span>
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="mt-1 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => syncNow()} disabled={status === 'syncing'}>
              <RefreshCw size={12} className={status === 'syncing' ? 'animate-spin' : ''} />
              Sync now
            </Button>
            <Button size="sm" variant="ghost" onClick={() => signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
