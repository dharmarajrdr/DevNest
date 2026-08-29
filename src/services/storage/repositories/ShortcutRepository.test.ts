import { describe, it, expect, beforeEach } from 'vitest'
import { installChromeMock } from '@/test/chromeMock'
import { ShortcutRepository } from './ShortcutRepository'

beforeEach(() => {
  installChromeMock()
})

describe('ShortcutRepository', () => {
  it('assigns incrementing order to new shortcuts', async () => {
    const a = await ShortcutRepository.create({ title: 'A', url: 'https://a.com' })
    const b = await ShortcutRepository.create({ title: 'B', url: 'https://b.com' })
    expect(a.order).toBe(0)
    expect(b.order).toBe(1)
  })

  it('getAll returns shortcuts sorted by order', async () => {
    await ShortcutRepository.create({ title: 'First', url: 'https://a.com' })
    await ShortcutRepository.create({ title: 'Second', url: 'https://b.com' })
    const all = await ShortcutRepository.getAll()
    expect(all.map((s) => s.title)).toEqual(['First', 'Second'])
  })

  it('reorder swaps two adjacent shortcuts', async () => {
    const a = await ShortcutRepository.create({ title: 'A', url: 'https://a.com' })
    await ShortcutRepository.create({ title: 'B', url: 'https://b.com' })
    await ShortcutRepository.reorder(a.id, 'down')
    const all = await ShortcutRepository.getAll()
    expect(all.map((s) => s.title)).toEqual(['B', 'A'])
  })

  it('reorder is a no-op at the boundary', async () => {
    const a = await ShortcutRepository.create({ title: 'Only', url: 'https://a.com' })
    await ShortcutRepository.reorder(a.id, 'up')
    const all = await ShortcutRepository.getAll()
    expect(all.map((s) => s.title)).toEqual(['Only'])
  })

  it('remove() re-normalizes order for the remaining shortcuts', async () => {
    const a = await ShortcutRepository.create({ title: 'A', url: 'https://a.com' })
    await ShortcutRepository.create({ title: 'B', url: 'https://b.com' })
    const c = await ShortcutRepository.create({ title: 'C', url: 'https://c.com' })
    await ShortcutRepository.remove(a.id)
    const all = await ShortcutRepository.getAll()
    expect(all.map((s) => s.order)).toEqual([0, 1])
    expect(all.find((s) => s.id === c.id)?.order).toBe(1)
  })

  it('update() bumps updatedAt', async () => {
    const a = await ShortcutRepository.create({ title: 'A', url: 'https://a.com' })
    const before = a.updatedAt
    await new Promise((r) => setTimeout(r, 2))
    const updated = await ShortcutRepository.update(a.id, { title: 'Renamed' })
    expect(updated?.title).toBe('Renamed')
    expect(updated?.updatedAt).not.toBe(before)
  })
})
