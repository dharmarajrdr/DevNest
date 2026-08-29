import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { ToolField, ToolTextarea, CopyIconButton } from './ToolPrimitives'
import { generateId } from '@/utils/id'

export function UuidTool() {
  const [ids, setIds] = useState<string[]>([generateId()])
  const [count, setCount] = useState(5)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label className="text-[11px] text-text-secondary">Count</label>
        <input
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
          className="w-16 rounded-md border border-border bg-bg px-2 py-1 text-xs text-text-primary"
        />
        <button
          onClick={() => setIds(Array.from({ length: count }, () => generateId()))}
          className="ml-auto flex items-center gap-1 rounded-md bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/25"
        >
          <RefreshCw size={12} /> Generate
        </button>
      </div>
      <ToolField label="Output" action={<CopyIconButton value={ids.join('\n')} />}>
        <ToolTextarea value={ids.join('\n')} readOnly rows={Math.min(10, Math.max(4, ids.length))} />
      </ToolField>
    </div>
  )
}
