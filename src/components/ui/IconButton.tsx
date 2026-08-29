import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  label: string // required — this is the accessible name, buttons must never be icon-only for screen readers
}

export function IconButton({ icon, label, className, ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary',
        'transition-colors duration-150 hover:bg-surface-elevated hover:text-text-primary',
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  )
}
