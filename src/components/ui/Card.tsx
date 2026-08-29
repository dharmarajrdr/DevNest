import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface shadow-card',
        'transition-colors duration-150',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between px-5 pt-4 pb-2', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-sm font-semibold text-text-primary', className)} {...rest}>
      {children}
    </h2>
  )
}
