import { useEffect, useState } from 'react'
import { Flame, Timer as TimerIcon, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { useTodoStore } from '@/store/useTodoStore'
import { ProductivityRepository } from '@/services/storage/repositories/ProductivityRepository'
import type { FocusSessionLogEntry } from '@/types'
import {
  completionRateToday,
  currentStreak,
  focusMinutesOn,
  formatFocusMinutes,
  pomodoroSessionsOn,
  tasksCompletedInLast7Days,
  tasksCompletedOn,
} from '@/utils/productivity'
import { todayISO } from '@/utils/date'

function ProgressBar({ ratio }: { ratio: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.round(ratio * 100)}%` }} />
    </div>
  )
}

export function ProductivityWidget() {
  const { todos, load: loadTodos, loading: todosLoading } = useTodoStore()
  const [log, setLog] = useState<FocusSessionLogEntry[]>([])
  const [logLoading, setLogLoading] = useState(true)

  useEffect(() => {
    loadTodos()
    ProductivityRepository.getAll().then((l) => {
      setLog(l)
      setLogLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (todosLoading || logLoading) return <div className="h-full animate-pulse rounded-card bg-surface" />

  const today = todayISO()
  const completedToday = tasksCompletedOn(todos, today).length
  const completedWeek = tasksCompletedInLast7Days(todos)
  const focusToday = focusMinutesOn(log, today)
  const sessionsToday = pomodoroSessionsOn(log, today)
  const streak = currentStreak(todos)
  const rate = completionRateToday(todos)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Productivity</CardTitle>
        {streak > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-warning">
            <Flame size={13} /> {streak} day{streak === 1 ? '' : 's'}
          </span>
        )}
      </CardHeader>

      <div className="flex flex-1 flex-col justify-center gap-4 px-5 pb-4">
        {rate && (
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-text-secondary">Today&apos;s tasks</span>
              <span className="font-medium text-text-primary">
                {rate.completed} / {rate.total}
              </span>
            </div>
            <ProgressBar ratio={rate.total ? rate.completed / rate.total : 0} />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="flex items-center justify-center gap-1 text-lg font-semibold text-text-primary">
              <CheckCircle2 size={14} className="text-success" />
              {completedToday}
            </p>
            <p className="text-[10px] text-text-secondary">Completed today</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">{completedWeek}</p>
            <p className="text-[10px] text-text-secondary">This week</p>
          </div>
          <div>
            <p className="flex items-center justify-center gap-1 text-lg font-semibold text-text-primary">
              <TimerIcon size={14} className="text-accent" />
              {formatFocusMinutes(focusToday)}
            </p>
            <p className="text-[10px] text-text-secondary">Focus time today</p>
          </div>
        </div>

        {sessionsToday > 0 && (
          <p className="text-center text-[11px] text-text-secondary">
            {sessionsToday} Pomodoro session{sessionsToday === 1 ? '' : 's'} today
          </p>
        )}
      </div>
    </Card>
  )
}
