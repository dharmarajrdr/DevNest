import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import type { TodoPriority } from '@/types'

const priorityStyles: Record<TodoPriority, string> = {
  LOW: 'bg-text-secondary/10 text-text-secondary',
  MEDIUM: 'bg-accent/15 text-accent',
  HIGH: 'bg-warning/15 text-warning',
  URGENT: 'bg-danger/15 text-danger',
}

export function PriorityBadge({ priority }: { priority: TodoPriority }) {
  return (
    <span
      className={cn(
        'rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        priorityStyles[priority],
      )}
    >
      {priority}
    </span>
  )
}

export function Badge({ className, children, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'rounded-md bg-surface-elevated px-1.5 py-0.5 text-[10px] text-text-secondary',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
