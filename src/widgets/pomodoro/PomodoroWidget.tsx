import { useEffect, useState } from 'react'
import { Play, Pause, SkipForward, RotateCcw, Settings2, Maximize2, Coffee } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Button } from '@/components/ui/Button'
import { FullScreenTimeOverlay } from '@/components/ui/FullScreenTimeOverlay'
import { usePomodoroStore } from '@/store/usePomodoroStore'
import { useTicker } from '@/widgets/stopwatch/useTicker'
import { elapsedMs, formatCountdown, playChime } from '@/utils/time'
import { useSettingsStore } from '@/store/useSettingsStore'
import { cn } from '@/utils/cn'

export function PomodoroWidget() {
  const { state, settings, loading, load, start, pause, skip, reset, updateSettings, markFinishedLocally } =
    usePomodoroStore()
  const { settings: appSettings } = useSettingsStore()
  const [editingSettings, setEditingSettings] = useState(false)
  const [fullScreenOpen, setFullScreenOpen] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useTicker(state.timer.status === 'running', 250)

  const remaining = state.timer.durationMs - elapsedMs(state.timer.startedAt, state.timer.accumulatedMs)
  const isRunning = state.timer.status === 'running'

  // Calculate percentage of session completed
  const totalDuration = state.timer.durationMs || 1
  const elapsed = Math.max(0, totalDuration - remaining)
  const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))

  useEffect(() => {
    if (state.timer.status === 'running' && remaining <= 0) {
      markFinishedLocally()
      if (appSettings.notifications.enabled) playChime()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, state.timer.status])

  if (loading) return <div className="h-full animate-pulse rounded-card bg-surface" />

  const isFocus = state.mode === 'focus'

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Coffee size={16} className="text-accent" />
            <CardTitle>Pomodoro</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              icon={<Maximize2 size={14} />}
              label="Full-screen mode"
              onClick={() => setFullScreenOpen(true)}
            />
            <IconButton
              icon={<Settings2 size={14} />}
              label="Pomodoro settings"
              onClick={() => setEditingSettings((v) => !v)}
            />
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
          <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-4">
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                isFocus ? 'bg-accent/15 text-accent border border-accent/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
              )}
            >
              {isFocus ? 'Focus Session' : 'Break'}
            </span>

            {/* Countdown Display with Glow */}
            <div className="relative flex items-center justify-center">
              {isRunning && (
                <span
                  className={cn(
                    'absolute -inset-2 rounded-xl blur-sm animate-pulse',
                    isFocus ? 'bg-accent/10' : 'bg-emerald-500/10',
                  )}
                />
              )}
              <span
                className={cn(
                  'font-mono text-3xl font-semibold tabular-nums text-text-primary transition-all relative',
                  isRunning && 'scale-105',
                )}
              >
                {formatCountdown(remaining)}
              </span>
            </div>

            {/* Visual Session Progress Bar */}
            <div className="w-full max-w-[180px] h-1.5 bg-surface-elevated rounded-full overflow-hidden border border-border/40">
              <div
                style={{ width: `${progressPercent}%` }}
                className={cn(
                  'h-full rounded-full transition-all duration-300 ease-out',
                  isFocus ? 'bg-accent shadow-sm shadow-accent/50' : 'bg-emerald-400 shadow-sm shadow-emerald-400/50',
                )}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 pt-1">
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
                  className={cn(
                    'border',
                    isFocus
                      ? 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
                      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
                  )}
                />
              )}
              <IconButton
                icon={<SkipForward size={16} />}
                label="Skip to next phase"
                onClick={() => skip()}
                className="border border-border hover:bg-surface-elevated"
              />
            </div>

            {/* Completed sessions indicator dots */}
            <div className="flex gap-1 pt-0.5">
              {Array.from({ length: Math.min(state.completedFocusSessions, 8) }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-accent animate-fadeIn"
                  title={`Session ${i + 1} completed`}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Full-Screen Distraction Free Mode */}
      <FullScreenTimeOverlay
        open={fullScreenOpen}
        onClose={() => setFullScreenOpen(false)}
        title="Pomodoro Focus"
        icon={Coffee}
        iconColor={isFocus ? 'text-accent' : 'text-emerald-400'}
      >
        <div className="flex flex-col items-center justify-center gap-8 w-full max-w-2xl">
          {/* Mode Pill */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-widest transition-all shadow-md',
                isFocus
                  ? 'bg-accent text-white shadow-accent/25'
                  : 'bg-emerald-500 text-white shadow-emerald-500/25',
              )}
            >
              {isFocus ? '🎯 Focus Session' : '☕ Rest & Recharge'}
            </span>
          </div>

          {/* Large Countdown Display */}
          <div className="relative flex items-center justify-center">
            {isRunning && (
              <div
                className={cn(
                  'absolute -inset-10 rounded-full blur-3xl animate-pulse',
                  isFocus ? 'bg-accent/20' : 'bg-emerald-500/20',
                )}
              />
            )}
            <span className="font-mono text-7xl sm:text-8xl md:text-9xl font-bold tabular-nums text-text-primary tracking-tight relative drop-shadow-sm">
              {formatCountdown(remaining)}
            </span>
          </div>

          {/* Full Screen Visual Progress Bar with Percentage */}
          <div className="w-full max-w-lg space-y-2">
            <div className="flex justify-between text-xs font-semibold text-text-secondary">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-3 bg-surface-elevated rounded-full overflow-hidden border border-border shadow-inner">
              <div
                style={{ width: `${progressPercent}%` }}
                className={cn(
                  'h-full rounded-full transition-all duration-300 ease-out',
                  isFocus
                    ? 'bg-accent shadow-lg shadow-accent/50'
                    : 'bg-emerald-400 shadow-lg shadow-emerald-400/50',
                )}
              />
            </div>
          </div>

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
                className={cn(
                  'h-14 px-8 text-base font-semibold shadow-lg hover:scale-105 transition-transform',
                  isFocus
                    ? 'shadow-accent/25'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25',
                )}
              >
                <Play size={20} /> Start
              </Button>
            )}

            <Button
              size="lg"
              variant="secondary"
              onClick={() => skip()}
              className="h-14 px-7 text-base font-semibold shadow-md"
            >
              <SkipForward size={18} /> Skip
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

          {/* Completed Session Badges */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-text-secondary font-medium">Completed Focus Cycles:</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.max(state.completedFocusSessions, 1) }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-3 w-3 rounded-full transition-all',
                    i < state.completedFocusSessions
                      ? 'bg-accent shadow-sm shadow-accent/50 scale-110'
                      : 'border border-border bg-surface-elevated',
                  )}
                  title={`Session ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </FullScreenTimeOverlay>
    </>
  )
}
