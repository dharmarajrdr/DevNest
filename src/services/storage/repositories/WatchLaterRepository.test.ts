import { describe, it, expect, beforeEach } from 'vitest'
import { installChromeMock } from '@/test/chromeMock'
import { WatchLaterRepository, parseYouTubeUrl } from './WatchLaterRepository'

beforeEach(() => {
  installChromeMock()
})

describe('parseYouTubeUrl', () => {
  it('identifies standard youtube video URLs', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(res.valid).toBe(true)
    expect(res.videoId).toBe('dQw4w9WgXcQ')
    expect(res.type).toBe('video')
  })

  it('identifies youtu.be short URLs', () => {
    const res = parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')
    expect(res.valid).toBe(true)
    expect(res.videoId).toBe('dQw4w9WgXcQ')
    expect(res.type).toBe('video')
  })

  it('identifies youtube shorts URLs', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')
    expect(res.valid).toBe(true)
    expect(res.videoId).toBe('dQw4w9WgXcQ')
  })

  it('identifies youtube playlist URLs', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/playlist?list=PLr6-SnbS9E8_e-PZ8sPqQ5k7YnI_T2K3D')
    expect(res.valid).toBe(true)
    expect(res.playlistId).toBe('PLr6-SnbS9E8_e-PZ8sPqQ5k7YnI_T2K3D')
    expect(res.type).toBe('playlist')
  })

  it('rejects invalid or non-YouTube URLs', () => {
    expect(parseYouTubeUrl('https://vimeo.com/12345').valid).toBe(false)
    expect(parseYouTubeUrl('https://google.com').valid).toBe(false)
    expect(parseYouTubeUrl('random-text').valid).toBe(false)
  })
})

describe('WatchLaterRepository', () => {
  it('adds valid YouTube videos', async () => {
    const item = await WatchLaterRepository.addByUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(item.id).toBeTruthy()
    expect(item.completed).toBe(false)
    expect(item.thumbnailUrl).toContain('dQw4w9WgXcQ')

    const all = await WatchLaterRepository.getAll()
    expect(all.some((i) => i.id === item.id)).toBe(true)
  })

  it('throws error for invalid links', async () => {
    await expect(WatchLaterRepository.addByUrl('https://not-youtube.com')).rejects.toThrow(
      /valid YouTube/i,
    )
  })

  it('toggles completion status', async () => {
    const item = await WatchLaterRepository.addByUrl('https://youtu.be/dQw4w9WgXcQ')
    const completed = await WatchLaterRepository.toggleComplete(item.id)
    expect(completed?.completed).toBe(true)
    expect(completed?.completedAt).toBeTruthy()

    const uncompleted = await WatchLaterRepository.toggleComplete(item.id)
    expect(uncompleted?.completed).toBe(false)
  })

  it('removes video from list', async () => {
    const item = await WatchLaterRepository.addByUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    await WatchLaterRepository.remove(item.id)
    const all = await WatchLaterRepository.getAll()
    expect(all.some((i) => i.id === item.id)).toBe(false)
  })
})

