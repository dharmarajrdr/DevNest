import { create } from 'zustand'
import type { Snippet, SnippetDraft } from '@/types'
import { SnippetRepository } from '@/services/storage/repositories/SnippetRepository'

interface SnippetStore {
  snippets: Snippet[]
  loading: boolean
  load: () => Promise<void>
  create: (draft: SnippetDraft) => Promise<void>
  update: (id: string, patch: Partial<Snippet>) => Promise<void>
  remove: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
}

export const useSnippetStore = create<SnippetStore>((set) => ({
  snippets: [],
  loading: true,

  load: async () => {
    set({ loading: true })
    set({ snippets: await SnippetRepository.getAll(), loading: false })
  },
  create: async (draft) => {
    await SnippetRepository.create(draft)
    set({ snippets: await SnippetRepository.getAll() })
  },
  update: async (id, patch) => {
    await SnippetRepository.update(id, patch)
    set({ snippets: await SnippetRepository.getAll() })
  },
  remove: async (id) => {
    await SnippetRepository.remove(id)
    set({ snippets: await SnippetRepository.getAll() })
  },
  toggleFavorite: async (id) => {
    await SnippetRepository.toggleFavorite(id)
    set({ snippets: await SnippetRepository.getAll() })
  },
}))
