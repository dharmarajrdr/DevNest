import { StorageService } from '../StorageService'
import type { WatchLaterItem } from '@/types'

const KEY = 'devtab.watchLater'

export function parseYouTubeUrl(url: string): {
  valid: boolean
  videoId?: string
  playlistId?: string
  type?: 'video' | 'playlist'
  cleanUrl?: string
} {
  const trimmed = url.trim()
  if (!trimmed) return { valid: false }

  // Check playlist
  const playlistMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i)
  const isDirectPlaylist = trimmed.includes('youtube.com/playlist')

  // Check video ID (standard, youtu.be, shorts, embed)
  const videoMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i,
  )

  if (isDirectPlaylist && playlistMatch) {
    return {
      valid: true,
      playlistId: playlistMatch[1],
      type: 'playlist',
      cleanUrl: `https://www.youtube.com/playlist?list=${playlistMatch[1]}`,
    }
  }

  if (videoMatch) {
    const videoId = videoMatch[1]
    const cleanUrl = playlistMatch
      ? `https://www.youtube.com/watch?v=${videoId}&list=${playlistMatch[1]}`
      : `https://www.youtube.com/watch?v=${videoId}`
    return {
      valid: true,
      videoId,
      playlistId: playlistMatch ? playlistMatch[1] : undefined,
      type: playlistMatch && !trimmed.includes('watch?v=') ? 'playlist' : 'video',
      cleanUrl,
    }
  }

  return { valid: false }
}

export async function fetchYouTubeInfo(url: string): Promise<{ title: string; thumbnailUrl: string; type: 'video' | 'playlist' }> {
  const parsed = parseYouTubeUrl(url)
  if (!parsed.valid) {
    throw new Error('Please enter a valid YouTube video or playlist URL.')
  }

  let title = parsed.type === 'playlist' ? 'YouTube Playlist' : 'YouTube Video'
  let thumbnailUrl = parsed.videoId
    ? `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`
    : 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=480&auto=format&fit=crop&q=60'

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(parsed.cleanUrl || url)}&format=json`
    const res = await fetch(oembedUrl)
    if (res.ok) {
      const data = await res.json()
      if (data.title) title = data.title
      if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url
    }
  } catch {
    // If oembed fetch fails (e.g. offline/network), fall back to default thumbnail and generic title
  }

  return {
    title,
    thumbnailUrl,
    type: parsed.type || 'video',
  }
}

export const DEFAULT_WATCH_LATER: WatchLaterItem[] = [
  {
    id: 'yt-docker-1',
    url: 'https://www.youtube.com/watch?v=pg19Z8LL06w',
    title: 'Docker Tutorial for Beginners [Full Course]',
    thumbnailUrl: 'https://img.youtube.com/vi/pg19Z8LL06w/hqdefault.jpg',
    type: 'video',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'yt-k8s-1',
    url: 'https://www.youtube.com/watch?v=X48VuDVv0do',
    title: 'Kubernetes Course - Full Course for Beginners',
    thumbnailUrl: 'https://img.youtube.com/vi/X48VuDVv0do/hqdefault.jpg',
    type: 'video',
    completed: false,
    createdAt: new Date().toISOString(),
  },
]

export const WatchLaterRepository = {
  async getAll(): Promise<WatchLaterItem[]> {
    const items = await StorageService.get<WatchLaterItem[]>(KEY)
    if (!items) {
      await StorageService.set(KEY, DEFAULT_WATCH_LATER)
      return DEFAULT_WATCH_LATER
    }
    return items
  },

  async addByUrl(rawUrl: string): Promise<WatchLaterItem> {
    const parsed = parseYouTubeUrl(rawUrl)
    if (!parsed.valid) {
      throw new Error('Please enter a valid YouTube video or playlist link (e.g., https://youtube.com/watch?v=... or https://youtu.be/...).')
    }

    const { title, thumbnailUrl, type } = await fetchYouTubeInfo(rawUrl)
    const current = await this.getAll()

    // Check if already in list
    const existing = current.find(
      (item) => item.url.toLowerCase() === (parsed.cleanUrl || rawUrl).toLowerCase(),
    )
    if (existing) {
      throw new Error('This video or playlist is already in your Watch Later list.')
    }

    const newItem: WatchLaterItem = {
      id: `yt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: parsed.cleanUrl || rawUrl,
      title,
      thumbnailUrl,
      type,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    const updated = [newItem, ...current]
    await StorageService.set(KEY, updated)
    return newItem
  },

  async toggleComplete(id: string): Promise<WatchLaterItem | null> {
    const current = await this.getAll()
    let updatedItem: WatchLaterItem | null = null
    const updated = current.map((item) => {
      if (item.id === id) {
        const nextCompleted = !item.completed
        updatedItem = {
          ...item,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        }
        return updatedItem
      }
      return item
    })
    await StorageService.set(KEY, updated)
    return updatedItem
  },

  async remove(id: string): Promise<void> {
    const current = await this.getAll()
    const updated = current.filter((item) => item.id !== id)
    await StorageService.set(KEY, updated)
  },

  async replaceAll(items: WatchLaterItem[]): Promise<void> {
    await StorageService.set(KEY, items)
  },
}

