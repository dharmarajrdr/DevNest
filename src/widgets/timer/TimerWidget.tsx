import { useEffect, useState } from 'react'
import { Play, Pause, RotateCcw, Maximize2, AlarmClock } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Button } from '@/components/ui/Button'
import { FullScreenTimeOverlay } from '@/components/ui/FullScreenTimeOverlay'
import { useTimerStore, PRESET_MINUTES } from '@/store/useTimerStore'
import { useTicker } from '@/widgets/stopwatch/useTicker'
import { elapsedMs, formatCountdown, playChime } from '@/utils/time'
import { cn } from '@/utils/cn'
import { useSettingsStore } from '@/store/useSettingsStore'

export function TimerWidget() {
  const { state, loading, load, setDuration, start, pause, reset, markFinishedLocally } = useTimerStore()
  const { settings } = useSettingsStore()
  const [fullScreenOpen, setFullScreenOpen] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useTicker(state.status === 'running', 250)

  const remaining = state.durationMs - elapsedMs(state.startedAt, state.accumulatedMs)
  const isRunning = state.status === 'running'
  const isFinished = state.status === 'finished'

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
    <>
      <Card className="flex h-full flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlarmClock size={16} className="text-accent" />
            <CardTitle>Timer</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              icon={<Maximize2 size={14} />}
              label="Full-screen mode"
              onClick={() => setFullScreenOpen(true)}
            />
            <IconButton icon={<RotateCcw size={14} />} label="Reset timer" onClick={() => reset()} />
          </div>
        </CardHeader>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
          <div className="relative flex items-center justify-center">
            {isRunning && (
              <span className="absolute -inset-2 rounded-xl bg-accent/10 blur-sm animate-pulse" />
            )}
            <span
              className={cn(
                'font-mono text-3xl font-semibold tabular-nums transition-all relative',
                isFinished ? 'text-accent animate-bounce' : 'text-text-primary',
                isRunning && 'scale-105',
              )}
            >
              {isFinished ? "Time's up!" : formatCountdown(remaining)}
            </span>
          </div>

          {state.status === 'idle' && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {PRESET_MINUTES.map((m) => (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className={cn(
                    'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                    currentMinutes === m
                      ? 'bg-accent/15 text-accent font-bold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated',
                  )}
                >
                  {m}m
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {isRunning ? (
              <IconButton
                icon={<Pause size={16} />}
                label="Pause"
                onClick={() => pause()}
                className="border border-border bg-surface-elevated hover:bg-surface"
              />
            ) : (
              <IconButton
                icon={<Play size={16} />}
                label="Start"
                onClick={() => start()}
                disabled={isFinished}
                className="border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-30"
              />
            )}
          </div>
        </div>
      </Card>

      {/* Full-Screen Distraction Free Mode */}
      <FullScreenTimeOverlay
        open={fullScreenOpen}
        onClose={() => setFullScreenOpen(false)}
        title="Countdown Timer"
        icon={AlarmClock}
      >
        <div className="flex flex-col items-center justify-center gap-8 w-full max-w-2xl">
          {/* Main Large Countdown Display */}
          <div className="relative flex items-center justify-center">
            {isRunning && (
              <div className="absolute -inset-8 rounded-full bg-accent/15 blur-2xl animate-pulse" />
            )}
            <span
              className={cn(
                'font-mono text-7xl sm:text-8xl md:text-9xl font-bold tabular-nums tracking-tight relative drop-shadow-sm',
                isFinished ? 'text-accent animate-bounce' : 'text-text-primary',
              )}
            >
              {isFinished ? "Time's Up!" : formatCountdown(remaining)}
            </span>
          </div>

          {/* Presets in Full Screen */}
          {state.status === 'idle' && (
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {PRESET_MINUTES.map((m) => (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className={cn(
                    'rounded-xl px-4 py-2 text-sm font-semibold transition-all border shadow-sm',
                    currentMinutes === m
                      ? 'bg-accent text-white border-accent shadow-accent/30 scale-105'
                      : 'border-border bg-surface-elevated/70 text-text-secondary hover:text-text-primary hover:bg-surface-elevated',
                  )}
                >
                  {m} min
                </button>
              ))}
            </div>
          )}

          {/* Controls Bar in Full Screen */}
          <div className="flex items-center gap-4">
            {isRunning ? (
              <Button
                size="lg"
                variant="secondary"
                onClick={() => pause()}
                className="h-14 px-8 text-base font-semibold shadow-lg hover:scale-105 transition-transform"
              >
                <Pause size={20} /> Pause
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => start()}
                disabled={isFinished}
                className="h-14 px-8 text-base font-semibold shadow-lg shadow-accent/25 hover:scale-105 transition-transform disabled:opacity-40"
              >
                <Play size={20} /> Start
              </Button>
            )}

            <Button
              size="lg"
              variant="ghost"
              onClick={() => reset()}
              className="h-14 px-6 text-base text-text-secondary hover:text-text-primary"
            >
              <RotateCcw size={18} /> Reset
            </Button>
          </div>
        </div>
      </FullScreenTimeOverlay>
    </>
  )
}
