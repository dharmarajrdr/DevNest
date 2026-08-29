import { useMemo, useState } from 'react'
import { ToolField, ToolTextarea, CopyIconButton } from './ToolPrimitives'

const CLAUSE_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'JOIN', 'LEFT JOIN',
  'RIGHT JOIN', 'INNER JOIN', 'ON', 'AND', 'OR', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
]

/** A heuristic formatter — uppercases keywords and puts major clauses on
 *  their own line. It won't handle every dialect edge case; for that,
 *  reach for a real SQL parser. This is a quick readability pass. */
function format(sql: string): string {
  let out = sql.replace(/\s+/g, ' ').trim()
  const sorted = [...CLAUSE_KEYWORDS].sort((a, b) => b.length - a.length)
  for (const kw of sorted) {
    const re = new RegExp(`\\b${kw.replace(' ', '\\s+')}\\b`, 'gi')
    out = out.replace(re, `\n${kw}`)
  }
  out = out.replace(/,\s*/g, ',\n  ')
  return out.trim()
}

export function SqlFormatTool() {
  const [input, setInput] = useState('select id, name, email from users where active = true order by created_at desc limit 20')
  const output = useMemo(() => (input.trim() ? format(input) : ''), [input])

  return (
    <div className="flex flex-col gap-3">
      <ToolField label="Input SQL">
        <ToolTextarea value={input} onChange={setInput} rows={4} />
      </ToolField>
      <ToolField label="Formatted" action={<CopyIconButton value={output} />}>
        <ToolTextarea value={output} readOnly rows={8} />
      </ToolField>
      <p className="text-[10px] text-text-secondary">
        Heuristic formatting — for complex multi-statement SQL, a full parser will do better.
      </p>
    </div>
  )
}
