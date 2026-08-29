import { useMemo, useState } from 'react'
import { Copy, Search } from 'lucide-react'

interface Entry {
  command: string
  description: string
}

/** Reused for the Git / Docker / Linux / HTTP status references — a
 *  searchable list with one-click copy, rather than four bespoke tools. */
export function CheatSheetTool({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (e) => e.command.toLowerCase().includes(q) || e.description.toLowerCase().includes(q),
    )
  }, [entries, query])

  async function copy(entry: Entry) {
    await navigator.clipboard.writeText(entry.command)
    setCopiedId(entry.command)
    window.setTimeout(() => setCopiedId(null), 1200)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2">
        <Search size={14} className="text-text-secondary" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter…"
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
        />
      </div>
      <div className="max-h-80 overflow-y-auto">
        {filtered.map((entry) => (
          <button
            key={entry.command}
            onClick={() => copy(entry)}
            className="group flex w-full items-start justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-elevated"
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-xs text-text-primary">{entry.command}</p>
              <p className="text-[11px] text-text-secondary">{entry.description}</p>
            </div>
            <span className="mt-0.5 shrink-0 text-text-secondary opacity-0 group-hover:opacity-100">
              {copiedId === entry.command ? (
                <span className="text-[10px] text-success">Copied</span>
              ) : (
                <Copy size={13} />
              )}
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-xs text-text-secondary">No matches.</p>
        )}
      </div>
    </div>
  )
}
