import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <div className="mb-1 text-text-secondary opacity-70">{icon}</div>
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="max-w-[220px] text-xs text-text-secondary">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
