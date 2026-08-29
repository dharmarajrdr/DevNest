import { useState, type ReactNode } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/utils/cn'

export function CopyIconButton({ value, disabled }: { value: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      disabled={disabled || !value}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1200)
      }}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:text-text-primary disabled:opacity-30"
    >
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function ToolField({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-medium text-text-secondary">{label}</span>
        {action}
      </div>
      {children}
    </div>
  )
}

export function ToolTextarea({
  value,
  onChange,
  placeholder,
  readOnly,
  rows = 6,
  error,
}: {
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  readOnly?: boolean
  rows?: number
  error?: boolean
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={rows}
      spellCheck={false}
      className={cn(
        'w-full resize-none rounded-lg border bg-bg px-3 py-2 font-mono text-xs text-text-primary placeholder:text-text-secondary focus:outline-none',
        error ? 'border-danger' : 'border-border focus:border-accent',
        readOnly && 'text-text-secondary',
      )}
    />
  )
}
