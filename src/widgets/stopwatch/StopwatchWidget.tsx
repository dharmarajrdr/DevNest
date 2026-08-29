import { useEffect } from 'react'
import { Flag, Play, Pause, RotateCcw } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { useStopwatchStore } from '@/store/useStopwatchStore'
import { useTicker } from './useTicker'
import { elapsedMs, formatStopwatch } from '@/utils/time'

export function StopwatchWidget() {
  const { state, loading, load, start, pause, reset, lap } = useStopwatchStore()

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useTicker(state.status === 'running')

  if (loading) return <div className="h-full animate-pulse rounded-card bg-surface" />

  const ms = elapsedMs(state.startedAt, state.accumulatedMs)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Stopwatch</CardTitle>
        <IconButton icon={<RotateCcw size={14} />} label="Reset stopwatch" onClick={() => reset()} />
      </CardHeader>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
        <span className="font-mono text-3xl font-semibold tabular-nums text-text-primary">
          {formatStopwatch(ms)}
        </span>
        <div className="flex gap-2">
          {state.status === 'running' ? (
            <IconButton
              icon={<Pause size={16} />}
              label="Pause"
              onClick={() => pause()}
              className="border border-border"
            />
          ) : (
            <IconButton
              icon={<Play size={16} />}
              label="Start"
              onClick={() => start()}
              className="border border-accent/40 text-accent"
            />
          )}
          <IconButton
            icon={<Flag size={16} />}
            label="Lap"
            onClick={() => lap()}
            disabled={state.status !== 'running'}
            className="border border-border disabled:opacity-30"
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
  )
}
