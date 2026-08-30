import { useEffect, useState } from 'react'
import { Flag, Play, Pause, RotateCcw, Maximize2, Timer } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Button } from '@/components/ui/Button'
import { FullScreenTimeOverlay } from '@/components/ui/FullScreenTimeOverlay'
import { useStopwatchStore } from '@/store/useStopwatchStore'
import { useTicker } from './useTicker'
import { elapsedMs, formatStopwatch } from '@/utils/time'
import { cn } from '@/utils/cn'

export function StopwatchWidget() {
  const { state, loading, load, start, pause, reset, lap } = useStopwatchStore()
  const [fullScreenOpen, setFullScreenOpen] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useTicker(state.status === 'running')

  if (loading) return <div className="h-full animate-pulse rounded-card bg-surface" />

  const ms = elapsedMs(state.startedAt, state.accumulatedMs)
  const isRunning = state.status === 'running'

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle>Stopwatch</CardTitle>
          <div className="flex items-center gap-1">
            <IconButton
              icon={<Maximize2 size={14} />}
              label="Full-screen mode"
              onClick={() => setFullScreenOpen(true)}
            />
            <IconButton
              icon={<RotateCcw size={14} />}
              label="Reset stopwatch"
              onClick={() => reset()}
            />
          </div>
        </CardHeader>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
          <div className="relative flex items-center justify-center">
            {isRunning && (
              <span className="absolute -inset-2 rounded-xl bg-accent/10 blur-sm animate-pulse" />
            )}
            <span
              className={cn(
                'font-mono text-3xl font-semibold tabular-nums text-text-primary transition-all relative',
                isRunning && 'scale-105',
              )}
            >
              {formatStopwatch(ms)}
            </span>
          </div>

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
                className="border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
              />
            )}
            <IconButton
              icon={<Flag size={16} />}
              label="Lap"
              onClick={() => lap()}
              disabled={!isRunning}
              className="border border-border disabled:opacity-30 hover:bg-surface-elevated"
            />
          </div>
        </div>

        {state.laps.length > 0 && (
          <div className="max-h-20 overflow-y-auto border-t border-border px-4 py-2">
            {state.laps.map((l, i) => (
              <div key={l.id} className="flex justify-between py-0.5 text-[11px] text-text-secondary">
                <span>Lap {state.laps.length - i}</span>
                <span className="font-mono tabular-nums">{formatStopwatch(l.elapsedMs)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Full-Screen Distraction Free Mode */}
      <FullScreenTimeOverlay
        open={fullScreenOpen}
        onClose={() => setFullScreenOpen(false)}
        title="Stopwatch"
        icon={Timer}
      >
        <div className="flex flex-col items-center justify-center gap-8 w-full max-w-2xl">
          {/* Main Large Stopwatch Counter */}
          <div className="relative flex items-center justify-center">
            {isRunning && (
              <div className="absolute -inset-8 rounded-full bg-accent/15 blur-2xl animate-pulse" />
            )}
            <span className="font-mono text-7xl sm:text-8xl md:text-9xl font-bold tabular-nums text-text-primary tracking-tight relative drop-shadow-sm">
              {formatStopwatch(ms)}
            </span>
          </div>

          {/* Controls Bar */}
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
                className="h-14 px-8 text-base font-semibold shadow-lg shadow-accent/25 hover:scale-105 transition-transform"
              >
                <Play size={20} /> Start
              </Button>
            )}

            <Button
              size="lg"
              variant="secondary"
              onClick={() => lap()}
              disabled={!isRunning}
              className="h-14 px-7 text-base font-semibold shadow-md disabled:opacity-40"
            >
              <Flag size={18} /> Lap
            </Button>

            <Button
              size="lg"
              variant="ghost"
              onClick={() => reset()}
              className="h-14 px-6 text-base text-text-secondary hover:text-text-primary"
            >
              <RotateCcw size={18} /> Reset
            </Button>
          </div>

          {/* Laps List in Full Screen */}
          {state.laps.length > 0 && (
            <div className="w-full max-w-md max-h-48 overflow-y-auto rounded-xl border border-border bg-surface-elevated/60 p-4 backdrop-blur-md shadow-inner divide-y divide-border/40 text-xs">
              {state.laps.map((l, i) => (
                <div key={l.id} className="flex justify-between py-2 first:pt-0 last:pb-0 text-text-secondary">
                  <span className="font-medium text-text-primary">Lap {state.laps.length - i}</span>
                  <span className="font-mono tabular-nums font-semibold">{formatStopwatch(l.elapsedMs)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </FullScreenTimeOverlay>
    </>
  )
}
