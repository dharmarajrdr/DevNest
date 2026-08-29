import { useMemo, useState } from 'react'
import { ToolField, ToolTextarea } from './ToolPrimitives'

export function RegexTool() {
  const [pattern, setPattern] = useState('\\b[\\w.-]+@[\\w.-]+\\.\\w+\\b')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('Contact us at hello@example.com or sales@example.com.')

  const result = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags)
      const matches = [...text.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))]
      return { matches, error: null, re }
    } catch (e) {
      return { matches: [] as RegExpMatchArray[], error: (e as Error).message, re: null }
    }
  }, [pattern, flags, text])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <ToolField label="Pattern">
          <ToolTextarea value={pattern} onChange={setPattern} rows={1} error={!!result.error} />
        </ToolField>
        <div className="w-20">
          <ToolField label="Flags">
            <ToolTextarea value={flags} onChange={setFlags} rows={1} />
          </ToolField>
        </div>
      </div>
      <ToolField label="Test text">
        <ToolTextarea value={text} onChange={setText} rows={4} />
      </ToolField>
      {result.error ? (
        <p className="text-xs text-danger">{result.error}</p>
      ) : (
        <p className="text-xs text-text-secondary">
          {result.matches.length} match{result.matches.length === 1 ? '' : 'es'}
          {result.matches.length > 0 && ': '}
          {result.matches.slice(0, 8).map((m, i) => (
            <span key={i} className="ml-1 rounded bg-accent/15 px-1 font-mono text-accent">
              {m[0]}
            </span>
          ))}
        </p>
      )}
    </div>
  )
}
