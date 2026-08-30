import type {
  FocusSessionLogEntry,
  LearnTopic,
  Note,
  PomodoroSettings,
  Settings,
  Shortcut,
  Snippet,
  TechBlog,
  Todo,
  WatchLaterItem,
  WidgetConfig,
} from '@/types'
import { DEFAULT_SETTINGS, DEFAULT_POMODORO_SETTINGS } from '@/types'
import { TodoRepository } from './repositories/TodoRepository'
import { ShortcutRepository } from './repositories/ShortcutRepository'
import { NoteRepository } from './repositories/NoteRepository'
import { SnippetRepository } from './repositories/SnippetRepository'
import { SettingsRepository } from './repositories/SettingsRepository'
import { DEFAULT_LAYOUT, WidgetRepository } from './repositories/WidgetRepository'
import { PomodoroRepository } from './repositories/PomodoroRepository'
import { ProductivityRepository } from './repositories/ProductivityRepository'
import { ToLearnRepository, DEFAULT_LEARN_TOPICS } from './repositories/ToLearnRepository'
import { WatchLaterRepository, DEFAULT_WATCH_LATER } from './repositories/WatchLaterRepository'
import { TechBlogRepository, DEFAULT_TECH_BLOGS } from './repositories/TechBlogRepository'
import { StorageService } from './StorageService'
import { TaskAlarmService } from '@/services/alarms/TaskAlarmService'
import { useTodoStore } from '@/store/useTodoStore'
import { useShortcutStore } from '@/store/useShortcutStore'
import { useNoteStore } from '@/store/useNoteStore'
import { useSnippetStore } from '@/store/useSnippetStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useWidgetStore } from '@/store/useWidgetStore'
import { usePomodoroStore } from '@/store/usePomodoroStore'
import { useToLearnStore } from '@/store/useToLearnStore'
import { useWatchLaterStore } from '@/store/useWatchLaterStore'
import { useTechBlogStore } from '@/store/useTechBlogStore'

export interface ExportOptions {
  exportData?: boolean
  exportLayout?: boolean
}

export interface BackupPayload {
  version: string
  exportedAt: string
  exportScope?: ('data' | 'layout')[]
  todos?: Todo[]
  shortcuts?: Shortcut[]
  notes?: Note[]
  snippets?: Snippet[]
  learnTopics?: LearnTopic[]
  watchLater?: WatchLaterItem[]
  techBlogs?: TechBlog[]
  settings?: Settings
  widgetLayout?: WidgetConfig[]
  pomodoroSettings?: PomodoroSettings
  focusSessionLog?: FocusSessionLogEntry[]
}

export interface BackupSummary {
  todosCount: number
  shortcutsCount: number
  notesCount: number
  snippetsCount: number
  learnTopicsCount?: number
  watchLaterCount?: number
  techBlogsCount?: number
  focusSessionsCount: number
}

async function reloadAllStores(): Promise<void> {
  await Promise.all([
    useTodoStore.getState().load(),
    useShortcutStore.getState().load(),
    useNoteStore.getState().load(),
    useSnippetStore.getState().load(),
    useSettingsStore.getState().load(),
    useWidgetStore.getState().load(),
    usePomodoroStore.getState().load(),
    useToLearnStore.getState().load(),
    useWatchLaterStore.getState().load(),
    useTechBlogStore.getState().load(),
  ])
}

export const BackupService = {
  async getStorageSummary(): Promise<BackupSummary> {
    const [todos, shortcuts, notes, snippets, learnTopics, watchLater, techBlogs, focusLog] = await Promise.all([
      TodoRepository.getAll(),
      ShortcutRepository.getAll(),
      NoteRepository.getAll(),
      SnippetRepository.getAll(),
      ToLearnRepository.getAll(),
      WatchLaterRepository.getAll(),
      TechBlogRepository.getAll(),
      ProductivityRepository.getAll(),
    ])

    return {
      todosCount: todos.length,
      shortcutsCount: shortcuts.length,
      notesCount: notes.length,
      snippetsCount: snippets.length,
      learnTopicsCount: learnTopics.length,
      watchLaterCount: watchLater.length,
      techBlogsCount: techBlogs.length,
      focusSessionsCount: focusLog.length,
    }
  },

  async exportBackup(options: ExportOptions = { exportData: true, exportLayout: true }): Promise<BackupPayload> {
    const includeData = options.exportData !== false
    const includeLayout = options.exportLayout !== false

    const scope: ('data' | 'layout')[] = []
    if (includeData) scope.push('data')
    if (includeLayout) scope.push('layout')

    const payload: BackupPayload = {
      version: '0.4.0',
      exportedAt: new Date().toISOString(),
      exportScope: scope,
    }

    if (includeData) {
      const [todos, shortcuts, notes, snippets, learnTopics, watchLater, techBlogs, settings, pomodoroSettings, focusLog] =
        await Promise.all([
          TodoRepository.getAll(),
          ShortcutRepository.getAll(),
          NoteRepository.getAll(),
          SnippetRepository.getAll(),
          ToLearnRepository.getAll(),
          WatchLaterRepository.getAll(),
          TechBlogRepository.getAll(),
          SettingsRepository.get(),
          PomodoroRepository.getSettings(),
          ProductivityRepository.getAll(),
        ])

      payload.todos = todos
      payload.shortcuts = shortcuts
      payload.notes = notes
      payload.snippets = snippets
      payload.learnTopics = learnTopics
      payload.watchLater = watchLater
      payload.techBlogs = techBlogs
      payload.settings = settings
      payload.pomodoroSettings = pomodoroSettings
      payload.focusSessionLog = focusLog
    }

    if (includeLayout) {
      const widgetLayout = await WidgetRepository.getLayout()
      payload.widgetLayout = widgetLayout
    }

    return payload
  },

  async downloadBackupFile(options: ExportOptions = { exportData: true, exportLayout: true }): Promise<void> {
    const backup = await this.exportBackup(options)
    const jsonStr = JSON.stringify(backup, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`

    let prefix = 'devnest-backup'
    if (options.exportData && !options.exportLayout) prefix = 'devnest-data-backup'
    else if (!options.exportData && options.exportLayout) prefix = 'devnest-layout-backup'

    const filename = `${prefix}-${dateStr}-${timeStr}.json`

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  async importBackup(
    jsonString: string,
  ): Promise<{ success: boolean; error?: string; summary?: BackupSummary }> {
    try {
      let parsed: unknown
      try {
        parsed = JSON.parse(jsonString)
      } catch {
        return { success: false, error: 'Invalid JSON file. Please provide a valid JSON backup.' }
      }

      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Unrecognized backup structure.' }
      }

      // Support direct payload or nested data wrapper
      const obj = (parsed as { data?: BackupPayload }).data || (parsed as BackupPayload)

      // Validate at least one recognizable field
      const hasRecognizedKey =
        'todos' in obj ||
        'shortcuts' in obj ||
        'notes' in obj ||
        'snippets' in obj ||
        'learnTopics' in obj ||
        'watchLater' in obj ||
        'techBlogs' in obj ||
        'settings' in obj ||
        'widgetLayout' in obj

      if (!hasRecognizedKey) {
        return {
          success: false,
          error: 'Backup file does not contain valid DevNest data collections.',
        }
      }

      const tasks: Promise<unknown>[] = []

      if (Array.isArray(obj.todos)) {
        tasks.push(TodoRepository.replaceAll(obj.todos))
      }
      if (Array.isArray(obj.shortcuts)) {
        tasks.push(ShortcutRepository.replaceAll(obj.shortcuts))
      }
      if (Array.isArray(obj.notes)) {
        tasks.push(NoteRepository.replaceAll(obj.notes))
      }
      if (Array.isArray(obj.snippets)) {
        tasks.push(SnippetRepository.replaceAll(obj.snippets))
      }
      if (Array.isArray(obj.learnTopics)) {
        tasks.push(ToLearnRepository.replaceAll(obj.learnTopics))
      }
      if (Array.isArray(obj.watchLater)) {
        tasks.push(WatchLaterRepository.replaceAll(obj.watchLater))
      }
      if (Array.isArray(obj.techBlogs)) {
        tasks.push(TechBlogRepository.replaceAll(obj.techBlogs))
      }
      if (obj.settings && typeof obj.settings === 'object') {
        tasks.push(SettingsRepository.update(obj.settings))
        if (obj.settings.accentColor && typeof document !== 'undefined' && document.documentElement) {
          document.documentElement.style.setProperty('--accent', obj.settings.accentColor)
        }
      }
      if (Array.isArray(obj.widgetLayout)) {
        tasks.push(WidgetRepository.saveLayout(obj.widgetLayout))
      }
      if (obj.pomodoroSettings && typeof obj.pomodoroSettings === 'object') {
        tasks.push(PomodoroRepository.saveSettings(obj.pomodoroSettings))
      }
      if (Array.isArray(obj.focusSessionLog)) {
        tasks.push(StorageService.set('devtab.focusSessionLog', obj.focusSessionLog))
      }

      await Promise.all(tasks)

      // Reschedule alarms for restored active todos
      if (Array.isArray(obj.todos) && obj.settings?.notifications) {
        for (const todo of obj.todos) {
          await TaskAlarmService.schedule(todo, obj.settings.notifications)
        }
      }

      await reloadAllStores()

      const summary: BackupSummary = {
        todosCount: Array.isArray(obj.todos) ? obj.todos.length : 0,
        shortcutsCount: Array.isArray(obj.shortcuts) ? obj.shortcuts.length : 0,
        notesCount: Array.isArray(obj.notes) ? obj.notes.length : 0,
        snippetsCount: Array.isArray(obj.snippets) ? obj.snippets.length : 0,
        learnTopicsCount: Array.isArray(obj.learnTopics) ? obj.learnTopics.length : 0,
        watchLaterCount: Array.isArray(obj.watchLater) ? obj.watchLater.length : 0,
        techBlogsCount: Array.isArray(obj.techBlogs) ? obj.techBlogs.length : 0,
        focusSessionsCount: Array.isArray(obj.focusSessionLog) ? obj.focusSessionLog.length : 0,
      }

      return { success: true, summary }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'An error occurred during import.',
      }
    }
  },

  async clearAllData(): Promise<void> {
    await Promise.all([
      StorageService.clear('local'),
      StorageService.clear('sync'),
    ])

    // Restore clean default configurations
    await Promise.all([
      SettingsRepository.update(DEFAULT_SETTINGS),
      WidgetRepository.saveLayout(DEFAULT_LAYOUT),
      PomodoroRepository.saveSettings(DEFAULT_POMODORO_SETTINGS),
      ToLearnRepository.replaceAll(DEFAULT_LEARN_TOPICS),
      WatchLaterRepository.replaceAll(DEFAULT_WATCH_LATER),
      TechBlogRepository.replaceAll(DEFAULT_TECH_BLOGS),
    ])

    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.style.setProperty('--accent', DEFAULT_SETTINGS.accentColor)
    }

    await reloadAllStores()
  },
}
