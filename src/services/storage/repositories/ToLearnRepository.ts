import { StorageService } from '../StorageService'
import type { LearnTopic } from '@/types'

const KEY = 'devtab.learnTopics'

export const DEFAULT_LEARN_TOPICS: LearnTopic[] = [
  {
    id: 'topic-docker',
    title: 'Docker',
    category: 'DevOps & Containers',
    level: 'BEGINNER',
    status: 'IN_PROGRESS',
    notes: 'Containers, Dockerfile, multi-stage builds, docker-compose.',
    resourceLink: 'https://docs.docker.com/',
    icon: '🐳',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'topic-k8s',
    title: 'Kubernetes',
    category: 'DevOps & Cloud',
    level: 'INTERMEDIATE',
    status: 'TO_LEARN',
    notes: 'Pods, Deployments, Services, Ingress, Helm charts.',
    resourceLink: 'https://kubernetes.io/docs/',
    icon: '☸️',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'topic-grafana',
    title: 'Grafana',
    category: 'Observability & Metrics',
    level: 'INTERMEDIATE',
    status: 'TO_LEARN',
    notes: 'Prometheus metrics, dashboard panels, alerting rules.',
    resourceLink: 'https://grafana.com/docs/',
    icon: '📊',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'topic-typescript',
    title: 'TypeScript',
    category: 'Programming',
    level: 'ADVANCED',
    status: 'COMPLETED',
    notes: 'Generics, conditional types, mapped types, utility types.',
    resourceLink: 'https://www.typescriptlang.org/docs/',
    icon: '🔷',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'topic-rust',
    title: 'Rust',
    category: 'Systems Programming',
    level: 'ADVANCED',
    status: 'TO_LEARN',
    notes: 'Ownership, borrowing, lifetimes, async/await, concurrency.',
    resourceLink: 'https://www.rust-lang.org/learn',
    icon: '🦀',
    createdAt: new Date().toISOString(),
  },
]

export const ToLearnRepository = {
  async getAll(): Promise<LearnTopic[]> {
    const topics = await StorageService.get<LearnTopic[]>(KEY)
    if (!topics) {
      await StorageService.set(KEY, DEFAULT_LEARN_TOPICS)
      return DEFAULT_LEARN_TOPICS
    }
    return topics
  },

  async create(draft: Omit<LearnTopic, 'id' | 'createdAt'>): Promise<LearnTopic> {
    const current = await this.getAll()
    const newTopic: LearnTopic = {
      ...draft,
      id: `learn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    }
    const updated = [newTopic, ...current]
    await StorageService.set(KEY, updated)
    return newTopic
  },

  async update(id: string, patch: Partial<Omit<LearnTopic, 'id' | 'createdAt'>>): Promise<LearnTopic | null> {
    const current = await this.getAll()
    let updatedTopic: LearnTopic | null = null
    const updated = current.map((t) => {
      if (t.id === id) {
        updatedTopic = {
          ...t,
          ...patch,
          completedAt:
            patch.status === 'COMPLETED' && t.status !== 'COMPLETED'
              ? new Date().toISOString()
              : patch.status && patch.status !== 'COMPLETED'
                ? undefined
                : t.completedAt,
        }
        return updatedTopic
      }
      return t
    })
    await StorageService.set(KEY, updated)
    return updatedTopic
  },

  async toggleComplete(id: string): Promise<LearnTopic | null> {
    const current = await this.getAll()
    const existing = current.find((t) => t.id === id)
    if (!existing) return null

    const newStatus = existing.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
    return this.update(id, { status: newStatus })
  },

  async remove(id: string): Promise<void> {
    const current = await this.getAll()
    const updated = current.filter((t) => t.id !== id)
    await StorageService.set(KEY, updated)
  },

  async replaceAll(topics: LearnTopic[]): Promise<void> {
    await StorageService.set(KEY, topics)
  },
}

