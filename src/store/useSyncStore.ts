import { create } from 'zustand'
import type { GoogleProfile, SyncStatus } from '@/types'
import { GoogleAuthService } from '@/services/auth/GoogleAuthService'
import { SyncEngine } from '@/services/sync/SyncEngine'
import { StorageService } from '@/services/storage/StorageService'

const TOKEN_KEY = 'devtab.googleToken'
const PROFILE_KEY = 'devtab.googleProfile'

interface SyncStore {
  profile: GoogleProfile | null
  status: SyncStatus
  lastSyncedAt: string | null
  error: string | null
  hydrate: () => Promise<void>
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  syncNow: () => Promise<void>
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  profile: null,
  status: 'signed-out',
  lastSyncedAt: null,
  error: null,

  hydrate: async () => {
    const [profile, lastSyncedAt] = await Promise.all([
      StorageService.get<GoogleProfile>(PROFILE_KEY, 'sync'),
      SyncEngine.getLastSyncedAt(),
    ])
    set({ profile: profile ?? null, status: profile ? 'idle' : 'signed-out', lastSyncedAt })
  },

  signIn: async () => {
    set({ status: 'syncing', error: null })
    try {
      const token = await GoogleAuthService.getToken(true)
      const profile = await GoogleAuthService.getProfile(token)
      await StorageService.set(PROFILE_KEY, profile, 'sync')
      await StorageService.set(TOKEN_KEY, token)
      set({ profile, status: 'idle' })
      await get().syncNow()
    } catch (e) {
      // Mirrors the spec's required copy exactly: no raw error, no stack.
      set({ status: 'error', error: 'Unable to sign in. Please try again.' })
      console.error('Google sign-in failed:', e)
    }
  },

  signOut: async () => {
    const token = await StorageService.get<string>(TOKEN_KEY)
    await GoogleAuthService.signOut(token ?? null)
    await StorageService.remove(TOKEN_KEY)
    await StorageService.remove(PROFILE_KEY, 'sync')
    set({ profile: null, status: 'signed-out', lastSyncedAt: null, error: null })
  },

  syncNow: async () => {
    if (!get().profile) return
    set({ status: 'syncing', error: null })
    if (!navigator.onLine) {
      set({ status: 'offline', error: 'Your changes are saved locally and we\u2019ll retry when you\u2019re online.' })
      return
    }
    try {
      const token = await GoogleAuthService.getToken(false)
      const result = await SyncEngine.syncNow(token)
      set({ status: 'synced', lastSyncedAt: result.syncedAt, error: null })
    } catch (e) {
      set({ status: 'error', error: 'Sync failed. Your changes are saved locally and will retry.' })
      console.error('Sync failed:', e)
    }
  },
}))
