import { StorageService } from '../StorageService'
import type { WidgetConfig } from '@/types'

const KEY = 'devtab.widgetLayout'

export const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: 'clock', type: 'CLOCK', x: 0, y: 0, w: 12, h: 2, visible: true, minimized: false },
  { id: 'todo', type: 'TODO', x: 0, y: 2, w: 7, h: 6, visible: true, minimized: false },
  { id: 'shortcuts', type: 'SHORTCUTS', x: 7, y: 2, w: 5, h: 6, visible: true, minimized: false },
  { id: 'stopwatch', type: 'STOPWATCH', x: 0, y: 8, w: 4, h: 4, visible: true, minimized: false },
  { id: 'timer', type: 'TIMER', x: 4, y: 8, w: 4, h: 4, visible: true, minimized: false },
  { id: 'pomodoro', type: 'POMODORO', x: 8, y: 8, w: 4, h: 4, visible: true, minimized: false },
  { id: 'devtools', type: 'DEV_TOOLS', x: 0, y: 12, w: 4, h: 4, visible: true, minimized: false },
  { id: 'snippets', type: 'SNIPPETS', x: 4, y: 12, w: 4, h: 5, visible: true, minimized: false },
  { id: 'notes', type: 'NOTES', x: 8, y: 12, w: 4, h: 5, visible: true, minimized: false },
  { id: 'productivity', type: 'PRODUCTIVITY', x: 0, y: 17, w: 12, h: 5, visible: true, minimized: false },
  { id: 'github', type: 'GITHUB', x: 0, y: 22, w: 6, h: 6, visible: true, minimized: false },
  { id: 'leetcode', type: 'LEETCODE', x: 6, y: 22, w: 6, h: 6, visible: true, minimized: false },
]

export const WidgetRepository = {
  /**
   * Returns the saved layout, additively merged with any widget types that
   * exist in DEFAULT_LAYOUT but aren't in the saved layout yet — e.g. an
   * install saved before Stopwatch/Timer/Pomodoro/Dev Tools/Snippets/Notes
   * existed still had a valid, non-empty layout, so the old "empty →
   * default, otherwise use as-is" rule would silently hide every widget
   * shipped after that save. New widget types are appended and persisted
   * once; the user's existing positions and visibility choices for
   * everything else are left untouched.
   */
  async getLayout(): Promise<WidgetConfig[]> {
    const stored = await StorageService.get<WidgetConfig[]>(KEY, 'sync')
    if (!stored || stored.length === 0) return DEFAULT_LAYOUT

    const knownTypes = new Set(stored.map((w) => w.type))
    const missing = DEFAULT_LAYOUT.filter((w) => !knownTypes.has(w.type))
    if (missing.length === 0) return stored

    const merged = [...stored, ...missing]
    await StorageService.set(KEY, merged, 'sync')
    return merged
  },

  async saveLayout(layout: WidgetConfig[]): Promise<void> {
    await StorageService.set(KEY, layout, 'sync')
  },

  async resetLayout(): Promise<WidgetConfig[]> {
    await StorageService.set(KEY, DEFAULT_LAYOUT, 'sync')
    return DEFAULT_LAYOUT
  },
}
