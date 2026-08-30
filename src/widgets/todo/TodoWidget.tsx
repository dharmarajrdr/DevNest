import { useEffect, useMemo, useState } from 'react'
import { Flame, ListTodo, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { TodoItem } from './TodoItem'
import { TodoFormModal } from './TodoFormModal'
import { TaskStreakView } from './TaskStreakView'
import { useTodoStore } from '@/store/useTodoStore'
import { useUIStore } from '@/store/useUIStore'
import { isOverdueTask, isTodayTask, isUpcomingTask } from '@/utils/date'
import { currentStreak } from '@/utils/productivity'
import { cn } from '@/utils/cn'

type Filter = 'today' | 'upcoming' | 'overdue' | 'completed' | 'streak'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
  { key: 'streak', label: 'Streak' },
]

export function TodoWidget() {
  const { todos, load, loading } = useTodoStore()
  const { taskFormOpen: formOpen, setTaskFormOpen: setFormOpen } = useUIStore()
  const [filter, setFilter] = useState<Filter>('today')
  const [editingTodo, setEditingTodo] = useState<typeof todos[0] | null>(null)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const streak = useMemo(() => currentStreak(todos), [todos])

  const visible = useMemo(() => {
    switch (filter) {
      case 'today':
        return todos.filter((t) => isTodayTask(t))
      case 'upcoming':
        return todos.filter((t) => isUpcomingTask(t))
      case 'overdue':
        return todos.filter((t) => isOverdueTask(t))
      case 'completed':
        return todos.filter((t) => t.status === 'COMPLETED')
      case 'streak':
        return []
    }
  }, [todos, filter])

  function handleOpenCreate() {
    setEditingTodo(null)
    setFormOpen(true)
  }

  function handleOpenEdit(todo: typeof todos[0]) {
    setEditingTodo(todo)
    setFormOpen(true)
  }

  function handleCloseModal() {
    setEditingTodo(null)
    setFormOpen(false)
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListTodo size={16} className="text-accent" />
          <CardTitle>Tasks</CardTitle>
          {streak > 0 && (
            <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
              <Flame size={13} className="fill-amber-500/20" /> {streak}
            </span>
          )}
        </div>
        <IconButton icon={<Plus size={16} />} label="Add task" onClick={handleOpenCreate} />
      </CardHeader>

      <div className="flex gap-1 border-b border-border px-4 pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              filter === f.key
                ? 'bg-accent/15 text-accent'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {f.key === 'streak' && <Flame size={12} />}
            {f.label}
          </button>
        ))}
      </div>

      {filter === 'streak' ? (
        <TaskStreakView todos={todos} />
      ) : (
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
                  onClick={handleOpenCreate}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  + Add task
                </button>
              }
            />
          ) : (
            visible.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onEdit={handleOpenEdit} />
            ))
          )}
        </div>
      )}

      <TodoFormModal
        open={formOpen}
        onClose={handleCloseModal}
        todoToEdit={editingTodo}
      />
    </Card>
  )
}
