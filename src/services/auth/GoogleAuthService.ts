import type { GoogleProfile } from '@/types'

/**
 * Thin wrapper over chrome.identity — the only module that touches it
 * directly. Requires a real OAuth Client ID in manifest.config.ts (see
 * README §9); until one is set, getToken() rejects with Chrome's own
 * "bad client id" error, which callers surface as a normal sign-in
 * failure rather than a crash.
 */
export const GoogleAuthService = {
  async getToken(interactive: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive }, (token) => {
        if (chrome.runtime.lastError || !token) {
          reject(new Error(chrome.runtime.lastError?.message ?? 'No token returned'))
          return
        }
        resolve(token)
      })
    })
  },

  async getProfile(token: string): Promise<GoogleProfile> {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Failed to fetch profile (${res.status})`)
    const data = await res.json()
    return { email: data.email, name: data.name ?? data.email, pictureUrl: data.picture }
  },

  async signOut(token: string | null): Promise<void> {
    if (token) {
      await new Promise<void>((resolve) => chrome.identity.removeCachedAuthToken({ token }, () => resolve()))
      // Also revoke server-side so a future sign-in shows the consent
      // screen again rather than silently reusing the old grant.
      await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`).catch(() => {})
    }
  },
}
