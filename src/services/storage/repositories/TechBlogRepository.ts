import { StorageService } from '../StorageService'
import type { TechBlog, TechBlogDraft } from '@/types'

const KEY = 'devtab.techBlogs'

export const DEFAULT_TECH_BLOGS: TechBlog[] = []

export function getFaviconUrl(url: string): string {
  try {
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?sz=128&domain=${host}`
  } catch {
    return ''
  }
}

export const TechBlogRepository = {
  async getAll(): Promise<TechBlog[]> {
    const blogs = await StorageService.get<TechBlog[]>(KEY)
    if (!blogs || blogs.length === 0) {
      await StorageService.set(KEY, DEFAULT_TECH_BLOGS)
      return DEFAULT_TECH_BLOGS
    }
    return [...blogs].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    )
  },

  async create(draft: TechBlogDraft): Promise<TechBlog> {
    const blogs = await this.getAll()
    const id = `blog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    let formattedUrl = draft.url.trim()
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`
    }

    const newBlog: TechBlog = {
      id,
      name: draft.name.trim(),
      url: formattedUrl,
      description: draft.description?.trim() || undefined,
      category: draft.category?.trim() || 'General Engineering',
      iconUrl: draft.iconUrl || getFaviconUrl(formattedUrl),
      createdAt: new Date().toISOString(),
    }

    const updated = [newBlog, ...blogs]
    await StorageService.set(KEY, updated)
    return newBlog
  },

  async update(id: string, patch: Partial<TechBlogDraft>): Promise<TechBlog | null> {
    const blogs = await this.getAll()
    const idx = blogs.findIndex((b) => b.id === id)
    if (idx === -1) return null

    let formattedUrl = patch.url ? patch.url.trim() : undefined
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`
    }

    const updatedBlog: TechBlog = {
      ...blogs[idx],
      ...patch,
      url: formattedUrl || blogs[idx].url,
      iconUrl: formattedUrl ? getFaviconUrl(formattedUrl) : blogs[idx].iconUrl,
    }

    blogs[idx] = updatedBlog
    await StorageService.set(KEY, blogs)
    return updatedBlog
  },

  async remove(id: string): Promise<void> {
    const blogs = await this.getAll()
    const updated = blogs.filter((b) => b.id !== id)
    await StorageService.set(KEY, updated)
  },

  async replaceAll(blogs: TechBlog[]): Promise<void> {
    await StorageService.set(KEY, blogs)
  },

  async clear(): Promise<void> {
    await StorageService.remove(KEY)
  },
}
