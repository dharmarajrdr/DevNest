import { useEffect, useState } from 'react'
import { ToolField, ToolTextarea, CopyIconButton } from './ToolPrimitives'

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const

export function HashTool() {
  const [input, setInput] = useState('')
  const [algo, setAlgo] = useState<(typeof ALGORITHMS)[number]>('SHA-256')
  const [output, setOutput] = useState('')

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!input) return setOutput('')
      const data = new TextEncoder().encode(input)
      const digest = await crypto.subtle.digest(algo, data)
      const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
      if (!cancelled) setOutput(hex)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [input, algo])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        {ALGORITHMS.map((a) => (
          <button
            key={a}
            onClick={() => setAlgo(a)}
            className={`rounded-md px-2 py-1 text-[11px] font-medium ${algo === a ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {a}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-text-secondary">
        MD5 isn&apos;t offered — the Web Crypto API doesn&apos;t support it, and it&apos;s cryptographically broken for anything security-sensitive.
      </p>
      <ToolField label="Input">
        <ToolTextarea value={input} onChange={setInput} rows={4} placeholder="Text to hash…" />
      </ToolField>
      <ToolField label={`${algo} hex digest`} action={<CopyIconButton value={output} />}>
        <ToolTextarea value={output} readOnly rows={3} />
      </ToolField>
    </div>
  )
}
