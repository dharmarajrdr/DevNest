import { useState } from 'react'
import { ToolField, ToolTextarea, CopyIconButton } from './ToolPrimitives'

const CHARSETS = {
  Alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  Letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  Numbers: '0123456789',
  Hex: '0123456789abcdef',
  'Alphanumeric + symbols': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-_=+',
}

function randomString(length: number, charset: string): string {
  const bytes = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(bytes, (b) => charset[b % charset.length]).join('')
}

export function RandomStringTool() {
  const [length, setLength] = useState(24)
  const [charsetName, setCharsetName] = useState<keyof typeof CHARSETS>('Alphanumeric')
  const [output, setOutput] = useState(() => randomString(24, CHARSETS.Alphanumeric))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[11px] text-text-secondary">Length</label>
        <input
          type="number"
          min={4}
          max={128}
          value={length}
          onChange={(e) => setLength(Math.min(128, Math.max(4, Number(e.target.value) || 4)))}
          className="w-16 rounded-md border border-border bg-bg px-2 py-1 text-xs text-text-primary"
        />
        <select
          value={charsetName}
          onChange={(e) => setCharsetName(e.target.value as keyof typeof CHARSETS)}
          className="rounded-md border border-border bg-bg px-2 py-1 text-xs text-text-primary"
        >
          {Object.keys(CHARSETS).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button
          onClick={() => setOutput(randomString(length, CHARSETS[charsetName]))}
          className="ml-auto rounded-md bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/25"
        >
          Generate
        </button>
      </div>
      <ToolField label="Output" action={<CopyIconButton value={output} />}>
        <ToolTextarea value={output} readOnly rows={2} />
      </ToolField>
    </div>
  )
}
