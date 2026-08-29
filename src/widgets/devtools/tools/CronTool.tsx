import { useMemo, useState } from 'react'
import { ToolField, ToolTextarea } from './ToolPrimitives'

const FIELD_NAMES = ['minute', 'hour', 'day of month', 'month', 'day of week']
const PRESETS = [
  { expr: '* * * * *', label: 'Every minute' },
  { expr: '*/5 * * * *', label: 'Every 5 minutes' },
  { expr: '0 * * * *', label: 'Every hour, on the hour' },
  { expr: '0 0 * * *', label: 'Every day at midnight' },
  { expr: '0 9 * * 1-5', label: 'Weekdays at 9am' },
  { expr: '0 0 1 * *', label: 'First of every month' },
]

function describeField(value: string, name: string): string {
  if (value === '*') return `every ${name}`
  if (value.startsWith('*/')) return `every ${value.slice(2)} ${name}(s)`
  if (value.includes(',')) return `${name} in {${value}}`
  if (value.includes('-')) return `${name} between ${value.replace('-', ' and ')}`
  return `${name} = ${value}`
}

export function CronTool() {
  const [expr, setExpr] = useState('0 9 * * 1-5')

  const description = useMemo(() => {
    const fields = expr.trim().split(/\s+/)
    if (fields.length !== 5) return null
    return fields.map((f, i) => describeField(f, FIELD_NAMES[i])).join(', ')
  }, [expr])

  return (
    <div className="flex flex-col gap-3">
      <ToolField label="Cron expression (5 fields)">
        <ToolTextarea value={expr} onChange={setExpr} rows={1} error={!description} />
      </ToolField>
      <p className="text-xs text-text-secondary">
        {description ?? 'Expected 5 space-separated fields: minute hour day-of-month month day-of-week.'}
      </p>
      <div>
        <p className="mb-1 text-[11px] font-medium text-text-secondary">Common presets</p>
        <div className="flex flex-col gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.expr}
              onClick={() => setExpr(p.expr)}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-surface-elevated"
            >
              <span className="font-mono text-text-primary">{p.expr}</span>
              <span className="text-text-secondary">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
