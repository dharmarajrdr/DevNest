import { useEffect, useMemo, useState } from 'react'
import { ListTodo, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { TodoItem } from './TodoItem'
import { TodoFormModal } from './TodoFormModal'
import { useTodoStore } from '@/store/useTodoStore'
import { isOverdue, isToday, isUpcoming } from '@/utils/date'
import { cn } from '@/utils/cn'

type Filter = 'today' | 'upcoming' | 'overdue' | 'completed'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
]

export function TodoWidget() {
  const { todos, load, loading } = useTodoStore()
  const [filter, setFilter] = useState<Filter>('today')
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visible = useMemo(() => {
    switch (filter) {
      case 'today':
        return todos.filter(
          (t) => t.status !== 'COMPLETED' && (isToday(t.dueDate) || !t.dueDate),
        )
      case 'upcoming':
        return todos.filter((t) => isUpcoming(t))
      case 'overdue':
        return todos.filter((t) => isOverdue(t))
      case 'completed':
        return todos.filter((t) => t.status === 'COMPLETED')
    }
  }, [todos, filter])

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <IconButton icon={<Plus size={16} />} label="Add task" onClick={() => setFormOpen(true)} />
      </CardHeader>

      <div className="flex gap-1 border-b border-border px-4 pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              filter === f.key
                ? 'bg-accent/15 text-accent'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-surface-elevated" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<ListTodo size={28} />}
            title="No tasks here"
            description="Plan your day and get things done."
            action={
              <button
                onClick={() => setFormOpen(true)}
                className="text-xs font-medium text-accent hover:underline"
              >
                + Add task
              </button>
            }
          />
        ) : (
          visible.map((todo) => <TodoItem key={todo.id} todo={todo} />)
        )}
      </div>

      <TodoFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </Card>
  )
}
