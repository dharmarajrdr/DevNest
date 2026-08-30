import { describe, it, expect } from 'vitest'
import { clamp, overlapsAny, rectsOverlap, resolveCollisions } from './grid'
import type { WidgetConfig } from '@/types'

function tile(id: string, x: number, y: number, w: number, h: number): WidgetConfig {
  return { id, type: 'CLOCK', x, y, w, h, visible: true, minimized: false }
}

describe('rectsOverlap', () => {
  it('detects overlapping rectangles', () => {
    expect(rectsOverlap({ x: 0, y: 0, w: 4, h: 2 }, { x: 2, y: 0, w: 4, h: 2 })).toBe(true)
  })
  it('detects adjacent (touching, not overlapping) rectangles as non-overlapping', () => {
    expect(rectsOverlap({ x: 0, y: 0, w: 4, h: 2 }, { x: 4, y: 0, w: 4, h: 2 })).toBe(false)
  })
  it('detects fully separate rectangles as non-overlapping', () => {
    expect(rectsOverlap({ x: 0, y: 0, w: 2, h: 2 }, { x: 8, y: 8, w: 2, h: 2 })).toBe(false)
  })
})

describe('overlapsAny', () => {
  const layout = [tile('a', 0, 0, 4, 2), tile('b', 4, 0, 4, 2)]

  it('ignores the widget checking against itself', () => {
    expect(overlapsAny({ x: 0, y: 0, w: 4, h: 2 }, 'a', layout)).toBe(false)
  })
  it('ignores hidden widgets', () => {
    const withHidden = [...layout, { ...tile('d', 0, 0, 4, 2), visible: false }]
    expect(overlapsAny({ x: 0, y: 0, w: 4, h: 2 }, 'a', withHidden)).toBe(false)
  })
  it('detects a real overlap against another visible widget', () => {
    expect(overlapsAny({ x: 4, y: 0, w: 4, h: 2 }, 'a', layout)).toBe(true)
  })
})

describe('clamp', () => {
  it('passes through an in-range value', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })
  it('clamps below the minimum', () => {
    expect(clamp(-3, 0, 10)).toBe(0)
  })
  it('clamps above the maximum', () => {
    expect(clamp(20, 0, 10)).toBe(10)
  })
})

describe('resolveCollisions', () => {
  it('pushes colliding widget down when moved widget lands on its position', () => {
    const layout = [tile('a', 0, 0, 4, 2), tile('b', 0, 2, 4, 2)]
    // Move 'b' to (0, 0) overlapping 'a'
    const next = resolveCollisions('b', { x: 0, y: 0, w: 4, h: 2 }, layout)
    const b = next.find((w) => w.id === 'b')
    const a = next.find((w) => w.id === 'a')
    expect(b?.x).toBe(0)
    expect(b?.y).toBe(0)
    expect(a?.y).toBe(2) // 'a' was pushed down below 'b'
  })

  it('cascades collisions down multiple overlapping widgets', () => {
    const layout = [
      tile('a', 0, 0, 4, 2),
      tile('b', 0, 2, 4, 2),
      tile('c', 0, 4, 4, 2),
    ]
    // Move new widget 'd' to (0, 0)
    const withD = [...layout, tile('d', 0, 10, 4, 2)]
    const next = resolveCollisions('d', { x: 0, y: 0, w: 4, h: 2 }, withD)
    const d = next.find((w) => w.id === 'd')
    const a = next.find((w) => w.id === 'a')
    const b = next.find((w) => w.id === 'b')
    const c = next.find((w) => w.id === 'c')

    expect(d?.y).toBe(0)
    expect(a?.y).toBe(2)
    expect(b?.y).toBe(4)
    expect(c?.y).toBe(6)
  })
})
