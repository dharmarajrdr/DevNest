import { useMemo, useState } from 'react'
import { ToolField, ToolTextarea, CopyIconButton } from './ToolPrimitives'

export function Base64Tool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const result = useMemo(() => {
    try {
      const output = mode === 'encode' ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)))
      return { output, error: false }
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
        <ToolTextarea value={input} onChange={setInput} rows={5} placeholder={mode === 'encode' ? 'Text to encode…' : 'Base64 to decode…'} />
      </ToolField>
      <ToolField label="Output" action={<CopyIconButton value={result.output} />}>
        <ToolTextarea value={result.error ? 'Invalid Base64 input' : result.output} readOnly rows={5} error={result.error} />
      </ToolField>
    </div>
  )
}
