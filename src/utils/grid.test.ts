import { describe, it, expect } from 'vitest'
import { clamp, overlapsAny, rectsOverlap } from './grid'
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
