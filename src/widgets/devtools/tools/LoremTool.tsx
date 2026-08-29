import { useState } from 'react'
import { ToolField, ToolTextarea, CopyIconButton } from './ToolPrimitives'

const WORD_BANK = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
]

function sentence(): string {
  const len = 6 + Math.floor(Math.random() * 8)
  const words = Array.from({ length: len }, () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)])
  const s = words.join(' ')
  return s[0].toUpperCase() + s.slice(1) + '.'
}

function paragraph(): string {
  const count = 3 + Math.floor(Math.random() * 3)
  return Array.from({ length: count }, sentence).join(' ')
}

export function LoremTool() {
  const [paragraphs, setParagraphs] = useState(3)
  const [output, setOutput] = useState(() => Array.from({ length: 3 }, paragraph).join('\n\n'))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label className="text-[11px] text-text-secondary">Paragraphs</label>
        <input
          type="number"
          min={1}
          max={10}
          value={paragraphs}
          onChange={(e) => setParagraphs(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
          className="w-16 rounded-md border border-border bg-bg px-2 py-1 text-xs text-text-primary"
        />
        <button
          onClick={() => setOutput(Array.from({ length: paragraphs }, paragraph).join('\n\n'))}
          className="ml-auto rounded-md bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/25"
        >
          Generate
        </button>
      </div>
      <ToolField label="Output" action={<CopyIconButton value={output} />}>
        <ToolTextarea value={output} readOnly rows={9} />
      </ToolField>
    </div>
  )
}
