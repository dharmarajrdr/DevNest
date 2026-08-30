import { describe, it, expect, beforeEach } from 'vitest'
import { installChromeMock } from '@/test/chromeMock'
import { ToLearnRepository } from './ToLearnRepository'

beforeEach(() => {
  installChromeMock()
})

describe('ToLearnRepository', () => {
  it('loads default learning topics on initial start', async () => {
    const topics = await ToLearnRepository.getAll()
    expect(topics.length).toBeGreaterThan(0)
    expect(topics.some((t) => t.title === 'Docker')).toBe(true)
    expect(topics.some((t) => t.title === 'Kubernetes')).toBe(true)
  })

  it('creates new learning topics with level and status', async () => {
    const newTopic = await ToLearnRepository.create({
      title: 'Grafana',
      category: 'Monitoring',
      level: 'INTERMEDIATE',
      status: 'TO_LEARN',
      resourceLink: 'https://grafana.com/docs/',
    })

    expect(newTopic.id).toBeTruthy()
    expect(newTopic.title).toBe('Grafana')
    expect(newTopic.status).toBe('TO_LEARN')

    const all = await ToLearnRepository.getAll()
    expect(all.some((t) => t.id === newTopic.id)).toBe(true)
  })

  it('toggles completion status and records completedAt', async () => {
    const topic = await ToLearnRepository.create({
      title: 'Rust',
      level: 'ADVANCED',
      status: 'TO_LEARN',
    })

    const completed = await ToLearnRepository.toggleComplete(topic.id)
    expect(completed?.status).toBe('COMPLETED')
    expect(completed?.completedAt).toBeTruthy()

    const toggledBack = await ToLearnRepository.toggleComplete(topic.id)
    expect(toggledBack?.status).toBe('IN_PROGRESS')
  })

  it('removes learning topics', async () => {
    const topic = await ToLearnRepository.create({
      title: 'Temporary Skill',
      level: 'BEGINNER',
      status: 'TO_LEARN',
    })

    await ToLearnRepository.remove(topic.id)
    const all = await ToLearnRepository.getAll()
    expect(all.some((t) => t.id === topic.id)).toBe(false)
  })
})

