import type { SyncPayload } from '@/types'
import { TodoRepository } from '@/services/storage/repositories/TodoRepository'
import { ShortcutRepository } from '@/services/storage/repositories/ShortcutRepository'
import { NoteRepository } from '@/services/storage/repositories/NoteRepository'
import { SnippetRepository } from '@/services/storage/repositories/SnippetRepository'
import { SettingsRepository } from '@/services/storage/repositories/SettingsRepository'
import { WidgetRepository } from '@/services/storage/repositories/WidgetRepository'
import { PomodoroRepository } from '@/services/storage/repositories/PomodoroRepository'
import { StorageService } from '@/services/storage/StorageService'
import { DriveSyncService } from './DriveSyncService'

const LAST_SYNCED_KEY = 'devtab.lastSyncedAt'

interface HasIdAndUpdatedAt {
  id: string
  updatedAt: string
}

/** Last-write-wins per record, keyed by id — not a CRDT, deliberately: a
 *  single-user tool syncing across at most a couple of devices doesn't
 *  need one, and one would cost real complexity for no real benefit here. */
function mergeById<T extends HasIdAndUpdatedAt>(local: T[], remote: T[]): T[] {
  const merged = new Map<string, T>()
  for (const item of remote) merged.set(item.id, item)
  for (const item of local) {
    const existing = merged.get(item.id)
    if (!existing || item.updatedAt >= existing.updatedAt) merged.set(item.id, item)
  }
  return [...merged.values()]
}

export const SyncEngine = {
  async getLastSyncedAt(): Promise<string | null> {
    return (await StorageService.get<string>(LAST_SYNCED_KEY, 'sync')) ?? null
  },

  /**
   * Pulls the remote blob (if any), merges it with local data, writes the
   * merged result back to every local repository, then pushes it to
   * Drive. Collections merge per-record; the singleton config objects
   * (settings/layout/pomodoro settings) merge as a whole — remote wins
   * only if it was pushed by another device after this device's last
   * successful sync, otherwise local wins. That's coarser than per-field
   * merging, and documented as such rather than pretending it's not.
   */
  async syncNow(token: string): Promise<SyncPayload> {
    const fileId = await DriveSyncService.findFileId(token)
    const remote = fileId ? await DriveSyncService.download(token, fileId) : null

    const [todos, shortcuts, notes, snippets, settings, widgetLayout, pomodoroSettings, lastSyncedAt] =
      await Promise.all([
        TodoRepository.getAll(),
        ShortcutRepository.getAll(),
        NoteRepository.getAll(),
        SnippetRepository.getAll(),
        SettingsRepository.get(),
        WidgetRepository.getLayout(),
        PomodoroRepository.getSettings(),
        this.getLastSyncedAt(),
      ])

    const remoteConfigIsNewer = !!remote && (!lastSyncedAt || remote.syncedAt > lastSyncedAt)

    const merged: SyncPayload = {
      todos: mergeById(todos, remote?.todos ?? []),
      shortcuts: mergeById(shortcuts, remote?.shortcuts ?? []),
      notes: mergeById(notes, remote?.notes ?? []),
      snippets: mergeById(snippets, remote?.snippets ?? []),
      settings: remoteConfigIsNewer && remote ? remote.settings : settings,
      widgetLayout: remoteConfigIsNewer && remote ? remote.widgetLayout : widgetLayout,
      pomodoroSettings: remoteConfigIsNewer && remote ? remote.pomodoroSettings : pomodoroSettings,
      syncedAt: new Date().toISOString(),
    }

    await Promise.all([
      TodoRepository.replaceAll(merged.todos),
      ShortcutRepository.replaceAll(merged.shortcuts),
      NoteRepository.replaceAll(merged.notes),
      SnippetRepository.replaceAll(merged.snippets),
      SettingsRepository.update(merged.settings),
      WidgetRepository.saveLayout(merged.widgetLayout),
      PomodoroRepository.saveSettings(merged.pomodoroSettings),
    ])

    await DriveSyncService.upload(token, merged, fileId)
    await StorageService.set(LAST_SYNCED_KEY, merged.syncedAt, 'sync')

    return merged
  },
}
