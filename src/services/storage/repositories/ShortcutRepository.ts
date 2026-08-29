import { StorageService } from '../StorageService'
import type { Shortcut, ShortcutDraft } from '@/types'
import { generateId } from '@/utils/id'

const KEY = 'devtab.shortcuts'

async function getAll(): Promise<Shortcut[]> {
  const all = (await StorageService.get<Shortcut[]>(KEY)) ?? []
  return [...all].sort((a, b) => a.order - b.order)
}

async function saveAll(shortcuts: Shortcut[]): Promise<void> {
  await StorageService.set(KEY, shortcuts)
}

export const ShortcutRepository = {
  getAll,

  async create(draft: ShortcutDraft): Promise<Shortcut> {
    const all = await getAll()
    const shortcut: Shortcut = {
      id: generateId(),
      title: draft.title,
      url: draft.url,
      description: draft.description,
      category: draft.category ?? 'Custom',
      order: all.length,
      createdAt: new Date().toISOString(),
    }
    await saveAll([...all, shortcut])
    return shortcut
  },

  async update(id: string, patch: Partial<Shortcut>): Promise<Shortcut | undefined> {
    const all = await getAll()
    let updated: Shortcut | undefined
    const next = all.map((s) => {
      if (s.id !== id) return s
      updated = { ...s, ...patch }
      return updated
    })
    await saveAll(next)
    return updated
  },

  async remove(id: string): Promise<void> {
    const all = await getAll()
    await saveAll(all.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })))
  },

  async reorder(id: string, direction: 'up' | 'down'): Promise<void> {
    const all = await getAll()
    const index = all.findIndex((s) => s.id === id)
    const swapWith = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || swapWith < 0 || swapWith >= all.length) return
    ;[all[index], all[swapWith]] = [all[swapWith], all[index]]
    await saveAll(all.map((s, i) => ({ ...s, order: i })))
  },
}
