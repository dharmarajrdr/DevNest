import { useMemo, useState } from 'react'
import { ToolField, ToolTextarea, CopyIconButton } from './ToolPrimitives'

function words(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .filter(Boolean)
}

const CONVERTERS: Record<string, (s: string) => string> = {
  camelCase: (s) => {
    const w = words(s).map((x) => x.toLowerCase())
    return w.map((x, i) => (i === 0 ? x : x[0].toUpperCase() + x.slice(1))).join('')
  },
  PascalCase: (s) => words(s).map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase()).join(''),
  snake_case: (s) => words(s).map((x) => x.toLowerCase()).join('_'),
  'kebab-case': (s) => words(s).map((x) => x.toLowerCase()).join('-'),
  'UPPER CASE': (s) => words(s).join(' ').toUpperCase(),
  'lower case': (s) => words(s).join(' ').toLowerCase(),
  'Title Case': (s) => words(s).map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase()).join(' '),
}

export function CaseTool() {
  const [input, setInput] = useState('hello world example')

  const results = useMemo(
    () => Object.entries(CONVERTERS).map(([label, fn]) => [label, input ? fn(input) : '']),
    [input],
  )

  return (
    <div className="flex flex-col gap-3">
      <ToolField label="Input">
        <ToolTextarea value={input} onChange={setInput} rows={1} />
      </ToolField>
      <div className="space-y-2">
        {results.map(([label, value]) => (
          <ToolField key={label} label={label} action={<CopyIconButton value={value} />}>
            <ToolTextarea value={value} readOnly rows={1} />
          </ToolField>
        ))}
      </div>
    </div>
  )
}
