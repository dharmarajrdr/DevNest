import { StorageService } from '../StorageService'
import type { WidgetConfig } from '@/types'

const KEY = 'devtab.widgetLayout'

export const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: 'clock', type: 'CLOCK', x: 0, y: 0, w: 12, h: 2, visible: true, minimized: false },
  { id: 'todo', type: 'TODO', x: 0, y: 2, w: 7, h: 6, visible: true, minimized: false },
  { id: 'shortcuts', type: 'SHORTCUTS', x: 7, y: 2, w: 5, h: 6, visible: true, minimized: false },
]

export const WidgetRepository = {
  async getLayout(): Promise<WidgetConfig[]> {
    const stored = await StorageService.get<WidgetConfig[]>(KEY, 'sync')
    return stored && stored.length > 0 ? stored : DEFAULT_LAYOUT
  },

  async saveLayout(layout: WidgetConfig[]): Promise<void> {
    await StorageService.set(KEY, layout, 'sync')
  },

  async resetLayout(): Promise<WidgetConfig[]> {
    await StorageService.set(KEY, DEFAULT_LAYOUT, 'sync')
    return DEFAULT_LAYOUT
  },
}
