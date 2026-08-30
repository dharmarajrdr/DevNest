import { create } from 'zustand'
import { TechBlogRepository } from '@/services/storage/repositories/TechBlogRepository'
import type { TechBlog, TechBlogDraft } from '@/types'

interface TechBlogState {
  blogs: TechBlog[]
  loading: boolean
  load: () => Promise<void>
  create: (draft: TechBlogDraft) => Promise<TechBlog>
  update: (id: string, patch: Partial<TechBlogDraft>) => Promise<TechBlog | null>
  remove: (id: string) => Promise<void>
}

export const useTechBlogStore = create<TechBlogState>((set) => ({
  blogs: [],
  loading: true,

  load: async () => {
    set({ loading: true })
    const blogs = await TechBlogRepository.getAll()
    set({ blogs, loading: false })
  },

  create: async (draft) => {
    const created = await TechBlogRepository.create(draft)
    set((s) => ({ blogs: [created, ...s.blogs] }))
    return created
  },

  update: async (id, patch) => {
    const updated = await TechBlogRepository.update(id, patch)
    if (updated) {
      set((s) => ({
        blogs: s.blogs.map((b) => (b.id === id ? updated : b)),
      }))
    }
    return updated
  },

  remove: async (id) => {
    await TechBlogRepository.remove(id)
    set((s) => ({ blogs: s.blogs.filter((b) => b.id !== id) }))
  },
}))

