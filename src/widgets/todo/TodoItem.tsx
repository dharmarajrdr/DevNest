import { Check, RotateCcw, Trash2 } from 'lucide-react'
import type { Todo } from '@/types'
import { PriorityBadge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/utils/cn'
import { formatDueLabel, isOverdue } from '@/utils/date'
import { useTodoStore } from '@/store/useTodoStore'

export function TodoItem({ todo }: { todo: Todo }) {
  const { complete, restore, remove } = useTodoStore()
  const overdue = isOverdue(todo)
  const done = todo.status === 'COMPLETED'

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors',
        'hover:bg-surface-elevated',
      )}
    >
      <button
        aria-label={done ? 'Mark as not done' : 'Mark as done'}
        onClick={() => (done ? restore(todo.id) : complete(todo.id))}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
          done ? 'border-accent bg-accent text-white' : 'border-border hover:border-accent',
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
        {todo.dueDate && (
          <p className={cn('text-[11px]', overdue ? 'text-danger' : 'text-text-secondary')}>
            {overdue ? 'Overdue · ' : ''}
            {formatDueLabel(todo)}
          </p>
        )}
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
