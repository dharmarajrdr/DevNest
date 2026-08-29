import type { SyncPayload } from '@/types'

const FILE_NAME = 'devtab-sync.json'
const FILES_URL = 'https://www.googleapis.com/drive/v3/files'
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'

/**
 * Reads/writes exactly one JSON file in the signed-in user's Drive
 * `appDataFolder` — a space that's hidden from the user's normal Drive
 * view and invisible to any app other than this one. That's what makes
 * `drive.appdata` an appropriately narrow scope: this extension can never
 * see or touch the rest of the user's Drive.
 */
export const DriveSyncService = {
  async findFileId(token: string): Promise<string | null> {
    const url = `${FILES_URL}?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id)`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error(`Drive lookup failed (${res.status})`)
    const data = await res.json()
    return data.files?.[0]?.id ?? null
  },

  async download(token: string, fileId: string): Promise<SyncPayload> {
    const res = await fetch(`${FILES_URL}/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Drive download failed (${res.status})`)
    return res.json()
  },

  async upload(token: string, payload: SyncPayload, existingFileId: string | null): Promise<string> {
    const metadata = existingFileId
      ? { name: FILE_NAME }
      : { name: FILE_NAME, parents: ['appDataFolder'] }

    const boundary = 'devtab-sync-boundary'
    const body =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(payload)}\r\n` +
      `--${boundary}--`

    const url = existingFileId
      ? `${UPLOAD_URL}/${existingFileId}?uploadType=multipart`
      : `${UPLOAD_URL}?uploadType=multipart`

    const res = await fetch(url, {
      method: existingFileId ? 'PATCH' : 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    })
    if (!res.ok) throw new Error(`Drive upload failed (${res.status})`)
    const data = await res.json()
    return data.id
  },
}
