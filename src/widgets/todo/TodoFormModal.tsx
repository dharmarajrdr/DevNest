import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { RecurrenceConfig, RecurrenceType, RecurrenceUnit, TodoPriority } from '@/types'
import { useTodoStore } from '@/store/useTodoStore'
import { todayISO } from '@/utils/date'

const PRIORITIES: TodoPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

type RecurrenceOption = 'NONE' | RecurrenceType
const RECURRENCE_OPTIONS: { key: RecurrenceOption; label: string }[] = [
  { key: 'NONE', label: 'None' },
  { key: 'DAILY', label: 'Daily' },
  { key: 'WEEKLY', label: 'Weekly' },
  { key: 'MONTHLY', label: 'Monthly' },
  { key: 'CUSTOM', label: 'Custom' },
]

const DAYS_OF_WEEK = [
  { day: 0, label: 'S' },
  { day: 1, label: 'M' },
  { day: 2, label: 'T' },
  { day: 3, label: 'W' },
  { day: 4, label: 'T' },
  { day: 5, label: 'F' },
  { day: 6, label: 'S' },
]

export function TodoFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { create } = useTodoStore()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceOption>('NONE')
  const [customInterval, setCustomInterval] = useState(1)
  const [customUnit, setCustomUnit] = useState<RecurrenceUnit>('day')
  const [selectedDays, setSelectedDays] = useState<number[]>([])

  function reset() {
    setTitle('')
    setPriority('MEDIUM')
    setDueDate('')
    setDueTime('')
    setRecurrenceType('NONE')
    setCustomInterval(1)
    setCustomUnit('day')
    setSelectedDays([])
  }

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b),
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    // If recurring but no due date is picked, default due date to today
    const effectiveDueDate =
      recurrenceType !== 'NONE' && !dueDate ? todayISO() : dueDate || undefined

    const recurrence: RecurrenceConfig | undefined =
      recurrenceType === 'NONE'
        ? undefined
        : {
          type: recurrenceType,
          interval: recurrenceType === 'CUSTOM' ? Math.max(1, customInterval) : 1,
          unit: recurrenceType === 'CUSTOM' ? customUnit : undefined,
          daysOfWeek:
            recurrenceType === 'WEEKLY' || (recurrenceType === 'CUSTOM' && customUnit === 'week')
              ? selectedDays.length > 0
                ? selectedDays
                : undefined
              : undefined,
        }

    await create({
      title: title.trim(),
      priority,
      dueDate: effectiveDueDate,
      dueTime: dueTime || undefined,
      recurrence,
    })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="task-title" className="mb-1 block text-xs text-text-secondary">
            Title
          </label>
          <input
            id="task-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to get done?"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-date" className="mb-1 block text-xs text-text-secondary">
              Due date
            </label>
            <input
              id="task-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="task-time" className="mb-1 block text-xs text-text-secondary">
              Due time
            </label>
            <input
              id="task-time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              disabled={!dueDate && recurrenceType === 'NONE'}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent disabled:opacity-40"
            />
          </div>
        </div>

        <div>
          <span className="mb-1 block text-xs text-text-secondary">Recurrence</span>
          <div className="flex flex-wrap gap-1.5">
            {RECURRENCE_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.key}
                onClick={() => setRecurrenceType(opt.key)}
                className={
                  'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ' +
                  (recurrenceType === opt.key
                    ? 'border-accent bg-accent/15 text-accent'
                    : 'border-border text-text-secondary hover:text-text-primary')
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          {recurrenceType === 'CUSTOM' && (
            <div className="mt-2.5 space-y-2 rounded-lg border border-border bg-surface-elevated/40 p-2.5">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span>Repeat every</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={customInterval}
                  onChange={(e) => setCustomInterval(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 rounded-md border border-border bg-bg px-2 py-1 text-xs text-text-primary focus:border-accent"
                />
                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value as RecurrenceUnit)}
                  className="rounded-md border border-border bg-bg px-2 py-1 text-xs text-text-primary focus:border-accent"
                >
                  <option value="day">Day(s)</option>
                  <option value="week">Week(s)</option>
                  <option value="month">Month(s)</option>
                </select>
              </div>
            </div>
          )}

          {(recurrenceType === 'WEEKLY' ||
            (recurrenceType === 'CUSTOM' && customUnit === 'week')) && (
              <div className="mt-2">
                <span className="mb-1 block text-[11px] text-text-secondary">
                  On specific days (optional):
                </span>
                <div className="flex gap-1">
                  {DAYS_OF_WEEK.map((d) => (
                    <button
                      type="button"
                      key={d.day}
                      onClick={() => toggleDay(d.day)}
                      className={
                        'h-7 w-7 rounded-md border text-xs font-medium transition-colors ' +
                        (selectedDays.includes(d.day)
                          ? 'border-accent bg-accent text-white'
                          : 'border-border text-text-secondary hover:text-text-primary')
                      }
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div>
          <span className="mb-1 block text-xs text-text-secondary">Priority</span>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPriority(p)}
                className={
                  'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ' +
                  (priority === p
                    ? 'border-accent bg-accent/15 text-accent'
                    : 'border-border text-text-secondary hover:text-text-primary')
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            Add task
          </Button>
        </div>
      </form>
    </Modal>
  )
}
