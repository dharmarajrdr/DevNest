import { useEffect } from 'react'
import { useClock } from './useClock'
import { useSettingsStore } from '@/store/useSettingsStore'
import { BRAND_TAGLINE } from '@/config/brand'

function greeting(hour: number): string {
  if (hour < 5) return 'Working late'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Working late'
}

export function ClockWidget() {
  const now = useClock()
  const { settings, load, loading } = useSettingsStore()

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { clock } = settings

  const time = now.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: clock.showSeconds ? '2-digit' : undefined,
    hour12: !clock.use24Hour,
  })

  const date = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  if (loading) {
    return <div className="h-full animate-pulse rounded-card bg-surface" />
  }

  return (
    <div className="flex h-full flex-col justify-center rounded-card border border-border bg-surface px-6 py-4 shadow-card">
      <p className="text-xs font-medium text-text-secondary">
        {greeting(now.getHours())} · {BRAND_TAGLINE}
      </p>
      <div className="mt-1 flex items-baseline gap-3">
        <span className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-text-primary">
          {time}
        </span>
        {clock.showDate && <span className="text-sm text-text-secondary">{date}</span>}
      </div>
    </div>
  )
}
