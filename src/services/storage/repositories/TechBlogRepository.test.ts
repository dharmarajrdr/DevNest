import { describe, it, expect, beforeEach } from 'vitest'
import { installChromeMock } from '@/test/chromeMock'
import { TechBlogRepository } from './TechBlogRepository'

beforeEach(() => {
  installChromeMock()
})

describe('TechBlogRepository', () => {
  it('loads default tech blogs on initial start', async () => {
    const blogs = await TechBlogRepository.getAll()
    expect(blogs.length).toBeGreaterThan(0)
    expect(blogs.some((b) => b.name.includes('Uber'))).toBe(true)
    expect(blogs.some((b) => b.name.includes('Netflix'))).toBe(true)
  })

  it('creates new tech blog with auto formatted URL and favicon', async () => {
    const blog = await TechBlogRepository.create({
      name: 'OpenAI Research',
      url: 'openai.com/research',
      category: 'AI',
      description: 'Research updates and milestones.',
    })

    expect(blog.id).toBeTruthy()
    expect(blog.name).toBe('OpenAI Research')
    expect(blog.url).toBe('https://openai.com/research')
    expect(blog.iconUrl).toContain('google.com/s2/favicons')

    const all = await TechBlogRepository.getAll()
    expect(all.some((b) => b.id === blog.id)).toBe(true)
  })

  it('updates existing tech blog', async () => {
    const blog = await TechBlogRepository.create({
      name: 'Airbnb Tech',
      url: 'medium.com/airbnb-engineering',
    })

    const updated = await TechBlogRepository.update(blog.id, {
      name: 'Airbnb Engineering',
    })

    expect(updated?.name).toBe('Airbnb Engineering')
  })

  it('removes tech blog', async () => {
    const blog = await TechBlogRepository.create({
      name: 'Temporary Blog',
      url: 'https://example.com/blog',
    })

    await TechBlogRepository.remove(blog.id)
    const all = await TechBlogRepository.getAll()
    expect(all.some((b) => b.id === blog.id)).toBe(false)
  })

  it('returns blogs sorted in alphabetical order by name', async () => {
    const blogs = await TechBlogRepository.getAll()
    const names = blogs.map((b) => b.name)
    const sorted = [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    expect(names).toEqual(sorted)
  })
})

