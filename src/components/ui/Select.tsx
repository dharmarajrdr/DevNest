import { type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[]
  onChange: (value: string) => void
  className?: string
}

export function Select({ options, value, onChange, disabled, className, ...rest }: SelectProps) {
  return (
    <div className={cn('relative inline-block w-full max-w-xs', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'w-full appearance-none rounded-lg border border-border bg-surface-elevated px-3 py-1.5 pr-8 text-xs font-medium text-text-primary shadow-sm',
          'transition-colors duration-150',
          'hover:border-border/80 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface-elevated text-text-primary">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary"
      />
    </div>
  )
}

