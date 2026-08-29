import { useMemo, useState } from 'react'
import { ToolField, ToolTextarea } from './ToolPrimitives'

function decodeSegment(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  return JSON.stringify(JSON.parse(decodeURIComponent(escape(atob(padded)))), null, 2)
}

export function JwtTool() {
  const [token, setToken] = useState('')

  const result = useMemo(() => {
    const parts = token.trim().split('.')
    if (parts.length !== 3) return { header: '', payload: '', error: token ? 'A JWT has three dot-separated parts.' : null }
    try {
      return { header: decodeSegment(parts[0]), payload: decodeSegment(parts[1]), error: null }
    } catch {
      return { header: '', payload: '', error: 'Could not decode — not a valid JWT.' }
    }
  }, [token])

  return (
    <div className="flex flex-col gap-3">
      <ToolField label="Token">
        <ToolTextarea value={token} onChange={setToken} rows={4} placeholder="eyJhbGciOi..." />
      </ToolField>
      <p className="text-[10px] text-text-secondary">
        Decodes the header and payload only — this does not verify the signature.
      </p>
      {result.error ? (
        <p className="text-xs text-danger">{result.error}</p>
      ) : (
        token && (
          <>
            <ToolField label="Header">
              <ToolTextarea value={result.header} readOnly rows={4} />
            </ToolField>
            <ToolField label="Payload">
              <ToolTextarea value={result.payload} readOnly rows={6} />
            </ToolField>
          </>
        )
      )}
    </div>
  )
}
