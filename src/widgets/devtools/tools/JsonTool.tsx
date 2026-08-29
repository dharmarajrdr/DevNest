import { useMemo, useState } from 'react'
import { ToolField, ToolTextarea, CopyIconButton } from './ToolPrimitives'

export function JsonTool() {
  const [input, setInput] = useState('{\n  "hello": "world"\n}')
  const [mode, setMode] = useState<'format' | 'minify'>('format')

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(input)
      return { output: mode === 'format' ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed), error: false }
    } catch {
      return { output: '', error: true }
    }
  }, [input, mode])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        {(['format', 'minify'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${mode === m ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {m === 'format' ? 'Format' : 'Minify'}
          </button>
        ))}
      </div>
      <ToolField label="Input">
        <ToolTextarea value={input} onChange={setInput} rows={7} error={result.error} />
      </ToolField>
      <ToolField label="Output" action={<CopyIconButton value={result.output} />}>
        <ToolTextarea value={result.error ? 'Invalid JSON' : result.output} readOnly rows={7} error={result.error} />
      </ToolField>
    </div>
  )
}
