import { useEffect, useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { RecurrenceConfig, RecurrenceType, RecurrenceUnit, Todo, TodoPriority } from '@/types'
import { useTodoStore } from '@/store/useTodoStore'
import { todayISO } from '@/utils/date'
import { cn } from '@/utils/cn'

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
  { day: 0, label: 'Sun' },
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
]

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1)

interface Props {
  open: boolean
  onClose: () => void
  todoToEdit?: Todo | null
}

export function TodoFormModal({ open, onClose, todoToEdit }: Props) {
  const { create, update } = useTodoStore()
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [linkError, setLinkError] = useState<string | null>(null)
  const [priority, setPriority] = useState<TodoPriority>('MEDIUM')
  const [startDate, setStartDate] = useState(todayISO())
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceOption>('NONE')
  const [customInterval, setCustomInterval] = useState(1)
  const [customUnit, setCustomUnit] = useState<RecurrenceUnit>('day')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [selectedDaysOfMonth, setSelectedDaysOfMonth] = useState<number[]>([])

  function reset() {
    setTitle('')
    setLink('')
    setLinkError(null)
    setPriority('MEDIUM')
    setStartDate(todayISO())
    setStartTime('')
    setEndTime('')
    setEndDate('')
    setRecurrenceType('NONE')
    setCustomInterval(1)
    setCustomUnit('day')
    setSelectedDays([])
    setSelectedDaysOfMonth([])
  }

  useEffect(() => {
    if (open) {
      if (todoToEdit) {
        setTitle(todoToEdit.title)
        setLink(todoToEdit.link || '')
        setLinkError(null)
        setPriority(todoToEdit.priority)
        setStartDate(todoToEdit.startDate || todoToEdit.dueDate || todayISO())
        setStartTime(todoToEdit.startTime || (todoToEdit.isAllDay ? '' : todoToEdit.dueTime || ''))
        setEndTime(todoToEdit.endTime || '')
        setEndDate(todoToEdit.recurrence?.endDate || todoToEdit.endDate || '')
        if (todoToEdit.recurrence) {
          setRecurrenceType(todoToEdit.recurrence.type)
          setCustomInterval(todoToEdit.recurrence.interval || 1)
          setCustomUnit(todoToEdit.recurrence.unit || 'day')
          setSelectedDays(todoToEdit.recurrence.daysOfWeek || [])
          setSelectedDaysOfMonth(todoToEdit.recurrence.daysOfMonth || [])
        } else {
          setRecurrenceType('NONE')
          setCustomInterval(1)
          setCustomUnit('day')
          setSelectedDays([])
          setSelectedDaysOfMonth([])
        }
      } else {
        reset()
      }
    }
  }, [open, todoToEdit])

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b),
    )
  }

  function toggleDayOfMonth(dom: number) {
    setSelectedDaysOfMonth((prev) =>
      prev.includes(dom) ? prev.filter((d) => d !== dom) : [...prev, dom].sort((a, b) => a - b),
    )
  }

  // Time validation: Start time cannot be later than end time
  const isTimeInvalid = Boolean(startTime && endTime && startTime > endTime)
  const isEndDateInvalid = Boolean(
    recurrenceType !== 'NONE' && endDate && endDate < todayISO(),
  )

  function validateUrl(str: string): string | null {
    const trimmed = str.trim()
    if (!trimmed) return null
    let formatted = trimmed
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`
    }
    try {
      const u = new URL(formatted)
      if (!u.hostname || !u.hostname.includes('.')) {
        return 'Please enter a valid URL (e.g. https://github.com/org/repo/pull/123 or docs link)'
      }
      return null
    } catch {
      return 'Please enter a valid URL'
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || isTimeInvalid || isEndDateInvalid) return

    let formattedLink = link.trim()
    if (formattedLink) {
      const err = validateUrl(formattedLink)
      if (err) {
        setLinkError(err)
        return
      }
      if (!/^https?:\/\//i.test(formattedLink)) {
        formattedLink = `https://${formattedLink}`
      }
    }

    const effectiveStartDate = recurrenceType === 'NONE' ? (startDate || todayISO()) : todayISO()

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
          daysOfMonth:
            recurrenceType === 'MONTHLY' || (recurrenceType === 'CUSTOM' && customUnit === 'month')
              ? selectedDaysOfMonth.length > 0
                ? selectedDaysOfMonth
                : undefined
              : undefined,
          endDate: endDate || undefined,
        }

    if (todoToEdit) {
      await update(todoToEdit.id, {
        title: title.trim(),
        priority,
        startDate: effectiveStartDate,
        startTime: startTime || undefined,
        endDate: recurrenceType === 'NONE' ? effectiveStartDate : endDate || undefined,
        endTime: endTime || undefined,
        isAllDay: !startTime && !endTime,
        link: formattedLink || undefined,
        dueDate: recurrenceType === 'NONE' ? effectiveStartDate : endDate || effectiveStartDate,
        dueTime: endTime || startTime || undefined,
        recurrence,
      })
    } else {
      await create({
        title: title.trim(),
        priority,
        startDate: effectiveStartDate,
        startTime: startTime || undefined,
        endDate: recurrenceType === 'NONE' ? effectiveStartDate : endDate || undefined,
        endTime: endTime || undefined,
        isAllDay: !startTime && !endTime,
        link: formattedLink || undefined,
        dueDate: recurrenceType === 'NONE' ? effectiveStartDate : endDate || effectiveStartDate,
        dueTime: endTime || startTime || undefined,
        recurrence,
      })
    }

    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={todoToEdit ? 'Edit task' : 'New task'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
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

        {/* Link / URL */}
        <div>
          <label htmlFor="task-link" className="mb-1 block text-xs text-text-secondary">
            Resource / Documentation Link (Optional)
          </label>
          <input
            id="task-link"
            value={link}
            onChange={(e) => {
              setLink(e.target.value)
              if (linkError) setLinkError(null)
            }}
            placeholder="e.g. https://github.com/... or PR / Jira link"
            className={cn(
              'w-full rounded-lg border bg-bg px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent',
              linkError ? 'border-danger/60' : 'border-border',
            )}
          />
          {linkError && (
            <p className="mt-1 text-[11px] text-danger animate-fadeIn">{linkError}</p>
          )}
        </div>

        {/* Recurrence Selector */}
        <div>
          <span className="mb-1.5 block text-xs text-text-secondary">Repetition</span>
          <div className="flex flex-wrap gap-1.5">
            {RECURRENCE_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.key}
                onClick={() => setRecurrenceType(opt.key)}
                className={cn(
                  'rounded-lg border px-3 py-1 text-xs font-medium transition-colors',
                  recurrenceType === opt.key
                    ? 'border-accent bg-accent/15 text-accent shadow-sm'
                    : 'border-border text-text-secondary hover:text-text-primary',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONDITIONAL FORM FIELDS BASED ON RECURRENCE ── */}

        {/* NONE (One-off task): Start Date, Start Time, End Time */}
        {recurrenceType === 'NONE' && (
          <div className="space-y-3 rounded-lg border border-border bg-surface-elevated/20 p-3">
            <div>
              <label htmlFor="task-start-date" className="mb-1 block text-xs text-text-secondary">
                Start date
              </label>
              <input
                id="task-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-start-time" className="mb-1 block text-xs text-text-secondary">
                  Start time
                </label>
                <input
                  id="task-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="task-end-time" className="mb-1 block text-xs text-text-secondary">
                  End time
                </label>
                <input
                  id="task-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
                />
              </div>
            </div>
          </div>
        )}

        {/* DAILY: Start Time, End Time, End Date (Repeat until) */}
        {recurrenceType === 'DAILY' && (
          <div className="space-y-3 rounded-lg border border-border bg-surface-elevated/20 p-3">
            <p className="text-[11px] text-text-secondary">
              Starting from today, repeats daily between start and end time.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-daily-start-time" className="mb-1 block text-xs text-text-secondary">
                  Start time
                </label>
                <input
                  id="task-daily-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="task-daily-end-time" className="mb-1 block text-xs text-text-secondary">
                  End time
                </label>
                <input
                  id="task-daily-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="task-daily-end-date" className="mb-1 block text-xs text-text-secondary">
                End date (Repeat until)
              </label>
              <input
                id="task-daily-end-date"
                type="date"
                min={todayISO()}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Indefinite"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
              />
            </div>
          </div>
        )}

        {/* WEEKLY: Days of Week, Start Time, End Time, End Date */}
        {recurrenceType === 'WEEKLY' && (
          <div className="space-y-3 rounded-lg border border-border bg-surface-elevated/20 p-3">
            <div>
              <span className="mb-1.5 block text-xs text-text-secondary">Repeat on days of the week:</span>
              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((d) => (
                  <button
                    type="button"
                    key={d.day}
                    onClick={() => toggleDay(d.day)}
                    className={cn(
                      'py-1.5 text-xs font-semibold rounded-md border transition-all text-center',
                      selectedDays.includes(d.day)
                        ? 'border-accent bg-accent text-white shadow-sm'
                        : 'border-border bg-surface text-text-secondary hover:text-text-primary hover:border-accent/40',
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-weekly-start-time" className="mb-1 block text-xs text-text-secondary">
                  Start time
                </label>
                <input
                  id="task-weekly-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="task-weekly-end-time" className="mb-1 block text-xs text-text-secondary">
                  End time
                </label>
                <input
                  id="task-weekly-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="task-weekly-end-date" className="mb-1 block text-xs text-text-secondary">
                End date (Repeat until)
              </label>
              <input
                id="task-weekly-end-date"
                type="date"
                min={todayISO()}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
              />
            </div>
          </div>
        )}

        {/* MONTHLY: Days of Month (1-31), Start Time, End Time, End Date */}
        {recurrenceType === 'MONTHLY' && (
          <div className="space-y-3 rounded-lg border border-border bg-surface-elevated/20 p-3">
            <div>
              <span className="mb-1.5 block text-xs text-text-secondary">
                Repeat on specific day(s) of the month:
              </span>
              <div className="grid grid-cols-7 sm:grid-cols-11 gap-1 max-h-36 overflow-y-auto p-1 rounded-md border border-border/50 bg-bg">
                {DAYS_OF_MONTH.map((dom) => (
                  <button
                    type="button"
                    key={dom}
                    onClick={() => toggleDayOfMonth(dom)}
                    className={cn(
                      'h-7 text-xs font-semibold rounded border transition-colors',
                      selectedDaysOfMonth.includes(dom)
                        ? 'border-accent bg-accent text-white'
                        : 'border-transparent text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
                    )}
                  >
                    {dom}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-monthly-start-time" className="mb-1 block text-xs text-text-secondary">
                  Start time
                </label>
                <input
                  id="task-monthly-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="task-monthly-end-time" className="mb-1 block text-xs text-text-secondary">
                  End time
                </label>
                <input
                  id="task-monthly-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="task-monthly-end-date" className="mb-1 block text-xs text-text-secondary">
                End date (Repeat until)
              </label>
              <input
                id="task-monthly-end-date"
                type="date"
                min={todayISO()}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
              />
            </div>
          </div>
        )}

        {/* CUSTOM: Interval, Unit, Days of week if weekly, Start Time, End Time, End Date */}
        {recurrenceType === 'CUSTOM' && (
          <div className="space-y-3 rounded-lg border border-border bg-surface-elevated/20 p-3">
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

            {customUnit === 'week' && (
              <div>
                <span className="mb-1.5 block text-xs text-text-secondary">On days of week:</span>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map((d) => (
                    <button
                      type="button"
                      key={d.day}
                      onClick={() => toggleDay(d.day)}
                      className={cn(
                        'py-1 text-xs font-semibold rounded border transition-all text-center',
                        selectedDays.includes(d.day)
                          ? 'border-accent bg-accent text-white'
                          : 'border-border bg-surface text-text-secondary hover:text-text-primary',
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {customUnit === 'month' && (
              <div>
                <span className="mb-1.5 block text-xs text-text-secondary">On days of month:</span>
                <div className="grid grid-cols-7 sm:grid-cols-11 gap-1 max-h-32 overflow-y-auto p-1 rounded-md border border-border/50 bg-bg">
                  {DAYS_OF_MONTH.map((dom) => (
                    <button
                      type="button"
                      key={dom}
                      onClick={() => toggleDayOfMonth(dom)}
                      className={cn(
                        'h-6 text-xs font-semibold rounded border transition-colors',
                        selectedDaysOfMonth.includes(dom)
                          ? 'border-accent bg-accent text-white'
                          : 'border-transparent text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
                      )}
                    >
                      {dom}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-custom-start-time" className="mb-1 block text-xs text-text-secondary">
                  Start time
                </label>
                <input
                  id="task-custom-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="task-custom-end-time" className="mb-1 block text-xs text-text-secondary">
                  End time
                </label>
                <input
                  id="task-custom-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="task-custom-end-date" className="mb-1 block text-xs text-text-secondary">
                End date (Repeat until)
              </label>
              <input
                id="task-custom-end-date"
                type="date"
                min={todayISO()}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent"
              />
            </div>
          </div>
        )}

        {/* Time Validation Error Message */}
        {isTimeInvalid && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger animate-fadeIn">
            <AlertCircle size={14} className="shrink-0" />
            <span>Start time cannot be later than end time. Please adjust the times.</span>
          </div>
        )}

        {/* Priority Selector */}
        <div>
          <span className="mb-1 block text-xs text-text-secondary">Priority</span>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPriority(p)}
                className={cn(
                  'rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                  priority === p
                    ? 'border-accent bg-accent/15 text-accent'
                    : 'border-border text-text-secondary hover:text-text-primary',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!title.trim() || isTimeInvalid || isEndDateInvalid}
          >
            {todoToEdit ? 'Save changes' : 'Add task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
