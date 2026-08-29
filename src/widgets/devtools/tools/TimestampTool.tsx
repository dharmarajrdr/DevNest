import { useState } from 'react'
import { ToolField, ToolTextarea } from './ToolPrimitives'

export function TimestampTool() {
  const [unix, setUnix] = useState(String(Math.floor(Date.now() / 1000)))
  const [iso, setIso] = useState(new Date().toISOString())

  function fromUnix(v: string) {
    setUnix(v)
    const n = Number(v)
    if (!Number.isNaN(n) && v.trim() !== '') setIso(new Date(n * 1000).toISOString())
  }

  function fromIso(v: string) {
    setIso(v)
    const t = new Date(v).getTime()
    if (!Number.isNaN(t)) setUnix(String(Math.floor(t / 1000)))
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => {
          const now = Date.now()
          setUnix(String(Math.floor(now / 1000)))
          setIso(new Date(now).toISOString())
        }}
        className="self-start rounded-md bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/25"
      >
        Use current time
      </button>
      <ToolField label="Unix timestamp (seconds)">
        <ToolTextarea value={unix} onChange={fromUnix} rows={1} />
      </ToolField>
      <ToolField label="ISO date">
        <ToolTextarea value={iso} onChange={fromIso} rows={1} />
      </ToolField>
      <p className="text-[11px] text-text-secondary">
        Local: {Number.isNaN(new Date(iso).getTime()) ? '—' : new Date(iso).toLocaleString()}
      </p>
    </div>
  )
}
