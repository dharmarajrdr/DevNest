import { useEffect, useState } from 'react'

/**
 * Forces a re-render every `intervalMs` while `running` is true. The
 * displayed value itself always comes from timestamp math (see utils/time),
 * this hook only decides when to recompute it — it never counts ticks as
 * the source of truth.
 */
export function useTicker(running: boolean, intervalMs = 50): number {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setTick((t) => t + 1), intervalMs)
    return () => window.clearInterval(id)
  }, [running, intervalMs])
  return Date.now()
}
