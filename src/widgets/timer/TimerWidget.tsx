import { useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { useTimerStore, PRESET_MINUTES } from '@/store/useTimerStore'
import { useTicker } from '@/widgets/stopwatch/useTicker'
import { elapsedMs, formatCountdown, playChime } from '@/utils/time'
import { cn } from '@/utils/cn'
import { useSettingsStore } from '@/store/useSettingsStore'

export function TimerWidget() {
  const { state, loading, load, setDuration, start, pause, reset, markFinishedLocally } = useTimerStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useTicker(state.status === 'running', 250)

  const remaining = state.durationMs - elapsedMs(state.startedAt, state.accumulatedMs)

  // Notice the countdown crossing zero while this widget happens to be
  // mounted, so the UI flips to "finished" immediately rather than waiting
  // on the next storage read from the background worker's alarm write.
  useEffect(() => {
    if (state.status === 'running' && remaining <= 0) {
      markFinishedLocally()
      if (settings.notifications.enabled) playChime()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, state.status])

  if (loading) return <div className="h-full animate-pulse rounded-card bg-surface" />

  const currentMinutes = Math.round(state.durationMs / 60_000)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Timer</CardTitle>
        <IconButton icon={<RotateCcw size={14} />} label="Reset timer" onClick={() => reset()} />
      </CardHeader>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
        <span
          className={cn(
            'font-mono text-3xl font-semibold tabular-nums',
            state.status === 'finished' ? 'text-accent' : 'text-text-primary',
          )}
        >
          {state.status === 'finished' ? "Time's up" : formatCountdown(remaining)}
        </span>

        {state.status === 'idle' && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {PRESET_MINUTES.map((m) => (
              <button
                key={m}
                onClick={() => setDuration(m)}
                className={cn(
                  'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                  currentMinutes === m
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {m}m
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {state.status === 'running' ? (
            <IconButton icon={<Pause size={16} />} label="Pause" onClick={() => pause()} className="border border-border" />
          ) : (
            <IconButton
              icon={<Play size={16} />}
              label="Start"
              onClick={() => start()}
              disabled={state.status === 'finished'}
              className="border border-accent/40 text-accent disabled:opacity-30"
            />
          )}
        </div>
      </div>
    </Card>
  )
}
