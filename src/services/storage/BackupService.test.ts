import { describe, it, expect, beforeEach } from 'vitest'
import { installChromeMock } from '@/test/chromeMock'
import { BackupService } from './BackupService'
import { TodoRepository } from './repositories/TodoRepository'
import { ShortcutRepository } from './repositories/ShortcutRepository'
import { NoteRepository } from './repositories/NoteRepository'
import { SnippetRepository } from './repositories/SnippetRepository'
import { SettingsRepository } from './repositories/SettingsRepository'

beforeEach(() => {
  installChromeMock()
})

describe('BackupService', () => {
  it('exports valid JSON backup containing all repositories', async () => {
    await TodoRepository.create({ title: 'Task 1' })
    await ShortcutRepository.create({ title: 'AI Link', url: 'https://chatgpt.com', category: 'AI Tools' })
    await NoteRepository.create({ title: 'My Note', content: 'Hello world' })
    await SnippetRepository.create({ title: 'Snippet 1', code: 'console.log(1)', category: 'JavaScript' })

    const backup = await BackupService.exportBackup()
    expect(backup.version).toBe('0.4.0')
    expect(backup.exportedAt).toBeTruthy()
    expect(backup.todos).toHaveLength(1)
    expect(backup.shortcuts).toHaveLength(1)
    expect(backup.notes).toHaveLength(1)
    expect(backup.snippets).toHaveLength(1)
    expect(backup.settings).toBeDefined()
    expect(backup.widgetLayout).toBeDefined()
  })

  it('supports selective export (data-only and layout-only)', async () => {
    await TodoRepository.create({ title: 'Task Data' })

    const dataOnly = await BackupService.exportBackup({ exportData: true, exportLayout: false })
    expect(dataOnly.todos).toHaveLength(1)
    expect(dataOnly.widgetLayout).toBeUndefined()
    expect(dataOnly.exportScope).toEqual(['data'])

    const layoutOnly = await BackupService.exportBackup({ exportData: false, exportLayout: true })
    expect(layoutOnly.todos).toBeUndefined()
    expect(layoutOnly.widgetLayout).toBeDefined()
    expect(layoutOnly.exportScope).toEqual(['layout'])
  })

  it('imports backup and restores complete state', async () => {
    const payload = {
      version: '0.4.0',
      exportedAt: new Date().toISOString(),
      todos: [
        {
          id: 'imported-todo-1',
          title: 'Imported Task',
          status: 'TODO' as const,
          priority: 'HIGH' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ['imported'],
        },
      ],
      shortcuts: [
        {
          id: 'imported-sc-1',
          title: 'Imported Link',
          url: 'https://example.com',
          category: 'Readings' as const,
          order: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      notes: [],
      snippets: [],
      settings: {
        accentColor: '#10b981',
        clock: { use24Hour: true, showSeconds: true, showDate: true },
        notifications: { enabled: true, notifyAtDueTime: true, notifyMinutesBefore: 5 as const },
        background: { enabled: false, imageUrl: null, opacity: 0.8, blurPx: 0, overlayIntensity: 0.4 },
      },
      widgetLayout: [],
      pomodoroSettings: {
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        sessionsBeforeLongBreak: 4,
        autoStartBreaks: false,
        autoStartFocus: false,
        soundEnabled: true,
      },
    }

    const result = await BackupService.importBackup(JSON.stringify(payload))
    expect(result.success).toBe(true)
    expect(result.summary?.todosCount).toBe(1)
    expect(result.summary?.shortcutsCount).toBe(1)

    const allTodos = await TodoRepository.getAll()
    expect(allTodos).toHaveLength(1)
    expect(allTodos[0].title).toBe('Imported Task')

    const allShortcuts = await ShortcutRepository.getAll()
    expect(allShortcuts).toHaveLength(1)
    expect(allShortcuts[0].title).toBe('Imported Link')

    const settings = await SettingsRepository.get()
    expect(settings.accentColor).toBe('#10b981')
    expect(settings.clock.use24Hour).toBe(true)
  })

  it('rejects malformed or invalid JSON', async () => {
    const res1 = await BackupService.importBackup('not-a-json')
    expect(res1.success).toBe(false)
    expect(res1.error).toContain('Invalid JSON')

    const res2 = await BackupService.importBackup(JSON.stringify({ random: 'data' }))
    expect(res2.success).toBe(false)
    expect(res2.error).toContain('does not contain valid DevNest data')
  })

  it('clearAllData wipes storage and resets to default configuration', async () => {
    await TodoRepository.create({ title: 'Task to be erased' })
    await ShortcutRepository.create({ title: 'Link to be erased', url: 'https://test.com' })

    await BackupService.clearAllData()

    const todos = await TodoRepository.getAll()
    expect(todos).toHaveLength(0)

    const shortcuts = await ShortcutRepository.getAll()
    expect(shortcuts).toHaveLength(0)

    const settings = await SettingsRepository.get()
    expect(settings).toBeDefined()
  })
})
