import { useMemo, useState } from 'react'
import { ToolField, ToolTextarea, CopyIconButton } from './ToolPrimitives'

export function UrlEncodeTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const result = useMemo(() => {
    try {
      return { output: mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input), error: false }
    } catch {
      return { output: '', error: true }
    }
  }, [input, mode])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        {(['encode', 'decode'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${mode === m ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {m}
          </button>
        ))}
      </div>
      <ToolField label="Input">
        <ToolTextarea value={input} onChange={setInput} rows={4} placeholder="https://example.com/path?q=hello world" />
      </ToolField>
      <ToolField label="Output" action={<CopyIconButton value={result.output} />}>
        <ToolTextarea value={result.error ? 'Invalid input' : result.output} readOnly rows={4} error={result.error} />
      </ToolField>
    </div>
  )
}
