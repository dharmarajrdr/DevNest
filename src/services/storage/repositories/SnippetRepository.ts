import { StorageService } from '../StorageService'
import type { Snippet, SnippetDraft } from '@/types'
import { generateId } from '@/utils/id'

const KEY = 'devtab.snippets'

async function getAll(): Promise<Snippet[]> {
  return (await StorageService.get<Snippet[]>(KEY)) ?? []
}
async function saveAll(snippets: Snippet[]): Promise<void> {
  await StorageService.set(KEY, snippets)
}

export const SnippetRepository = {
  getAll,

  async create(draft: SnippetDraft): Promise<Snippet> {
    const now = new Date().toISOString()
    const snippet: Snippet = {
      id: generateId(),
      title: draft.title,
      code: draft.code,
      category: draft.category ?? 'Custom',
      favorite: false,
      createdAt: now,
      updatedAt: now,
    }
    await saveAll([...(await getAll()), snippet])
    return snippet
  },

  async update(id: string, patch: Partial<Snippet>): Promise<void> {
    const all = await getAll()
    await saveAll(all.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s)))
  },

  async remove(id: string): Promise<void> {
    await saveAll((await getAll()).filter((s) => s.id !== id))
  },

  async toggleFavorite(id: string): Promise<void> {
    const all = await getAll()
    const target = all.find((s) => s.id === id)
    if (!target) return
    await this.update(id, { favorite: !target.favorite })
  },
}
