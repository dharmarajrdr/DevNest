import { useEffect } from 'react'
import { Play, Pause, SkipForward, RotateCcw, Settings2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { usePomodoroStore } from '@/store/usePomodoroStore'
import { useTicker } from '@/widgets/stopwatch/useTicker'
import { elapsedMs, formatCountdown, playChime } from '@/utils/time'
import { useSettingsStore } from '@/store/useSettingsStore'
import { cn } from '@/utils/cn'
import { useState } from 'react'

export function PomodoroWidget() {
  const { state, settings, loading, load, start, pause, skip, reset, updateSettings, markFinishedLocally } =
    usePomodoroStore()
  const { settings: appSettings } = useSettingsStore()
  const [editingSettings, setEditingSettings] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useTicker(state.timer.status === 'running', 250)

  const remaining = state.timer.durationMs - elapsedMs(state.timer.startedAt, state.timer.accumulatedMs)

  useEffect(() => {
    if (state.timer.status === 'running' && remaining <= 0) {
      markFinishedLocally()
      if (appSettings.notifications.enabled) playChime()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, state.timer.status])

  if (loading) return <div className="h-full animate-pulse rounded-card bg-surface" />

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Pomodoro</CardTitle>
        <div className="flex gap-1">
          <IconButton icon={<Settings2 size={14} />} label="Pomodoro settings" onClick={() => setEditingSettings((v) => !v)} />
          <IconButton icon={<RotateCcw size={14} />} label="Reset pomodoro" onClick={() => reset()} />
        </div>
      </CardHeader>

      {editingSettings ? (
        <div className="flex flex-1 flex-col justify-center gap-3 px-5">
          <label className="flex items-center justify-between text-xs text-text-secondary">
            Focus minutes
            <input
              type="number"
              min={1}
              max={90}
              value={settings.focusMinutes}
              onChange={(e) => updateSettings({ focusMinutes: Number(e.target.value) || 1 })}
              className="w-16 rounded-md border border-border bg-bg px-2 py-1 text-right text-text-primary"
            />
          </label>
          <label className="flex items-center justify-between text-xs text-text-secondary">
            Break minutes
            <input
              type="number"
              min={1}
              max={30}
              value={settings.breakMinutes}
              onChange={(e) => updateSettings({ breakMinutes: Number(e.target.value) || 1 })}
              className="w-16 rounded-md border border-border bg-bg px-2 py-1 text-right text-text-primary"
            />
          </label>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              state.mode === 'focus' ? 'bg-accent/15 text-accent' : 'bg-success/15 text-success',
            )}
          >
            {state.mode === 'focus' ? 'Focus' : 'Break'}
          </span>
          <span className="font-mono text-3xl font-semibold tabular-nums text-text-primary">
            {formatCountdown(remaining)}
          </span>
          <div className="flex gap-2">
            {state.timer.status === 'running' ? (
              <IconButton icon={<Pause size={16} />} label="Pause" onClick={() => pause()} className="border border-border" />
            ) : (
              <IconButton icon={<Play size={16} />} label="Start" onClick={() => start()} className="border border-accent/40 text-accent" />
            )}
            <IconButton icon={<SkipForward size={16} />} label="Skip to next phase" onClick={() => skip()} className="border border-border" />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(state.completedFocusSessions, 8) }).map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-accent" />
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
