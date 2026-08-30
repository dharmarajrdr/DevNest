import { type KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'

interface SwitchProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

export function Switch({
  id,
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md',
  className,
}: SwitchProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (!disabled) onChange(!checked)
    }
  }

  const isSm = size === 'sm'

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        isSm ? 'h-5 w-9' : 'h-6 w-11',
        checked ? 'bg-accent' : 'bg-surface-elevated border border-border hover:border-text-secondary/50',
        disabled && 'cursor-not-allowed opacity-40',
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
          isSm ? 'h-3.5 w-3.5 mt-0.5 ml-0.5' : 'h-4 w-4 mt-1 ml-1',
          checked
            ? isSm
              ? 'translate-x-4'
              : 'translate-x-5'
            : 'translate-x-0',
        )}
      />
    </button>
  )
}

