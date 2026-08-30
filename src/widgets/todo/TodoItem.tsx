import { Check, Repeat, RotateCcw, Trash2 } from 'lucide-react'
import type { Todo } from '@/types'
import { PriorityBadge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/utils/cn'
import { formatRecurrenceLabel, formatTaskTimeframe, isCompleteable, isOverdueTask } from '@/utils/date'
import { useTodoStore } from '@/store/useTodoStore'

export function TodoItem({ todo }: { todo: Todo }) {
  const { complete, restore, remove } = useTodoStore()
  const overdue = isOverdueTask(todo)
  const completeable = isCompleteable(todo)
  const isFuture = !completeable && todo.status !== 'COMPLETED'
  const done = todo.status === 'COMPLETED'
  const recurrenceLabel = formatRecurrenceLabel(todo.recurrence)
  const timeframeLabel = formatTaskTimeframe(todo)

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors',
        'hover:bg-surface-elevated',
      )}
    >
      <button
        aria-label={
          done
            ? 'Mark as not done'
            : isFuture
              ? 'Cannot complete future tasks until start date'
              : 'Mark as done'
        }
        title={
          isFuture && !done
            ? 'Cannot complete future tasks until start date'
            : done
              ? 'Mark as not done'
              : 'Mark as done'
        }
        disabled={isFuture && !done}
        onClick={() => (done ? restore(todo.id) : complete(todo.id))}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
          done
            ? 'border-accent bg-accent text-white'
            : isFuture
              ? 'cursor-not-allowed border-border/40 bg-surface-elevated/30 opacity-40'
              : 'border-border hover:border-accent',
        )}
      >
        {done && <Check size={12} strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm',
            done ? 'text-text-secondary line-through' : 'text-text-primary',
          )}
        >
          {todo.title}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 text-[11px]">
          {timeframeLabel && (
            <p className={cn(overdue ? 'text-danger' : 'text-text-secondary')}>
              {overdue ? 'Overdue · ' : ''}
              {timeframeLabel}
            </p>
          )}
          {recurrenceLabel && (
            <span
              title={`Recurring: ${recurrenceLabel}`}
              className="flex items-center gap-0.5 text-[10px] text-accent font-medium"
            >
              <Repeat size={10} />
              {recurrenceLabel}
            </span>
          )}
        </div>
      </div>

      {!done && <PriorityBadge priority={todo.priority} />}

      <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
        <IconButton
          icon={done ? <RotateCcw size={14} /> : <Trash2 size={14} />}
          label={done ? 'Restore task' : 'Delete task'}
          onClick={() => (done ? restore(todo.id) : remove(todo.id))}
        />
      </div>
    </div>
  )
}
