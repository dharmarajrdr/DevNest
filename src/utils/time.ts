/**
 * Timestamp-based elapsed/remaining math for the Stopwatch and Timer.
 * Never accumulate by counting setInterval ticks — ticks can drift or be
 * throttled by the browser. Instead store an epoch `startedAt` plus banked
 * `accumulatedMs`, and always derive the current value from `Date.now()`.
 * That also means state survives a fresh page load (a new tab is a new
 * React tree) as long as it's persisted — see the stopwatch/timer stores.
 */

export function elapsedMs(startedAt: number | null, accumulatedMs: number): number {
  if (startedAt === null) return accumulatedMs
  return accumulatedMs + (Date.now() - startedAt)
}

export function formatStopwatch(ms: number): string {
  const totalCentis = Math.floor(ms / 10)
  const centis = totalCentis % 100
  const totalSeconds = Math.floor(ms / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centis)}`
    : `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`
}

export function formatCountdown(ms: number): string {
  const clamped = Math.max(0, ms)
  const totalSeconds = Math.ceil(clamped / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

/** A short, synthesized tone — no audio asset to bundle or fetch. */
export function playChime(): void {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  } catch {
    // Web Audio unavailable — sound is a nice-to-have, never block on it.
  }
}
