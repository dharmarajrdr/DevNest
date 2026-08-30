import { useMemo, useState, useRef } from 'react'
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronUp,
  Columns2,
  Copy,
  FileCode,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

type DiffViewMode = 'split' | 'unified'

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  oldLineNum?: number
  newLineNum?: number
  oldContent?: string
  newContent?: string
  content: string
}

// Computes Line-by-Line LCS Diff
function computeDiff(original: string, modified: string, ignoreWhitespace = false): DiffLine[] {
  const oldLines = original.split('\n')
  const newLines = modified.split('\n')

  const norm = (s: string) => (ignoreWhitespace ? s.trim() : s)

  const n = oldLines.length
  const m = newLines.length

  // Build LCS matrix
  // For safety against extreme sizes, cap matrix at 2000x2000
  const maxRows = Math.min(n, 2000)
  const maxCols = Math.min(m, 2000)

  const dp: number[][] = Array.from({ length: maxRows + 1 }, () => new Array(maxCols + 1).fill(0))

  for (let i = 0; i < maxRows; i++) {
    for (let j = 0; j < maxCols; j++) {
      if (norm(oldLines[i]) === norm(newLines[j])) {
        dp[i + 1][j + 1] = dp[i][j] + 1
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1])
      }
    }
  }

  // Backtrack to assemble diff lines
  let i = maxRows
  let j = maxCols
  const rawDiff: DiffLine[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && norm(oldLines[i - 1]) === norm(newLines[j - 1])) {
      rawDiff.push({
        type: 'unchanged',
        oldLineNum: i,
        newLineNum: j,
        oldContent: oldLines[i - 1],
        newContent: newLines[j - 1],
        content: oldLines[i - 1],
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiff.push({
        type: 'added',
        newLineNum: j,
        newContent: newLines[j - 1],
        content: newLines[j - 1],
      })
      j--
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiff.push({
        type: 'removed',
        oldLineNum: i,
        oldContent: oldLines[i - 1],
        content: oldLines[i - 1],
      })
      i--
    }
  }

  return rawDiff.reverse()
}

const SAMPLE_ORIGINAL = `function calculateTotal(items, taxRate) {
  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    subtotal += items[i].price;
  }
  const tax = subtotal * taxRate;
  return subtotal + tax;
}`

const SAMPLE_MODIFIED = `function calculateTotal(items, taxRate = 0.08, discount = 0) {
  const subtotal = items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = discountedSubtotal * taxRate;
  return {
    subtotal: discountedSubtotal,
    tax,
    total: discountedSubtotal + tax,
  };
}`

export function DiffTool() {
  const [original, setOriginal] = useState(SAMPLE_ORIGINAL)
  const [modified, setModified] = useState(SAMPLE_MODIFIED)
  const [viewMode, setViewMode] = useState<DiffViewMode>('split')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentDiffIdx, setCurrentDiffIdx] = useState(0)

  const diffContainerRef = useRef<HTMLDivElement>(null)

  const diffLines = useMemo(() => {
    return computeDiff(original, modified, ignoreWhitespace)
  }, [original, modified, ignoreWhitespace])

  const stats = useMemo(() => {
    let added = 0
    let removed = 0
    let unchanged = 0
    for (const l of diffLines) {
      if (l.type === 'added') added++
      else if (l.type === 'removed') removed++
      else unchanged++
    }
    return { added, removed, unchanged }
  }, [diffLines])

  // Pairs for Split View
  const splitRows = useMemo(() => {
    const rows: {
      left?: { lineNum?: number; text: string; type: 'removed' | 'unchanged' }
      right?: { lineNum?: number; text: string; type: 'added' | 'unchanged' }
    }[] = []

    let i = 0
    while (i < diffLines.length) {
      const line = diffLines[i]
      if (line.type === 'unchanged') {
        rows.push({
          left: { lineNum: line.oldLineNum, text: line.oldContent ?? '', type: 'unchanged' },
          right: { lineNum: line.newLineNum, text: line.newContent ?? '', type: 'unchanged' },
        })
        i++
      } else if (line.type === 'removed') {
        // Look ahead for matching 'added' on adjacent line for side-by-side pairing
        if (i + 1 < diffLines.length && diffLines[i + 1].type === 'added') {
          rows.push({
            left: { lineNum: line.oldLineNum, text: line.oldContent ?? '', type: 'removed' },
            right: { lineNum: diffLines[i + 1].newLineNum, text: diffLines[i + 1].newContent ?? '', type: 'added' },
          })
          i += 2
        } else {
          rows.push({
            left: { lineNum: line.oldLineNum, text: line.oldContent ?? '', type: 'removed' },
            right: undefined,
          })
          i++
        }
      } else if (line.type === 'added') {
        rows.push({
          left: undefined,
          right: { lineNum: line.newLineNum, text: line.newContent ?? '', type: 'added' },
        })
        i++
      }
    }

    return rows
  }, [diffLines])

  function handleSwap() {
    const temp = original
    setOriginal(modified)
    setModified(temp)
  }

  function handleClear() {
    setOriginal('')
    setModified('')
  }

  function handleLoadSample() {
    setOriginal(SAMPLE_ORIGINAL)
    setModified(SAMPLE_MODIFIED)
  }

  async function handleCopyDiff() {
    const unifiedText = diffLines
      .map((l) => {
        const prefix = l.type === 'added' ? '+ ' : l.type === 'removed' ? '- ' : '  '
        return prefix + l.content
      })
      .join('\n')

    await navigator.clipboard.writeText(unifiedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function scrollToChange(direction: 'next' | 'prev') {
    const changeElements = diffContainerRef.current?.querySelectorAll('[data-diff-change="true"]')
    if (!changeElements || changeElements.length === 0) return

    let nextIdx = direction === 'next' ? currentDiffIdx + 1 : currentDiffIdx - 1
    if (nextIdx >= changeElements.length) nextIdx = 0
    if (nextIdx < 0) nextIdx = changeElements.length - 1

    setCurrentDiffIdx(nextIdx)
    changeElements[nextIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top Toolbar: View Toggles, Options, Stats, Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        {/* Left: View Mode Toggle & Whitespace checkbox */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-border bg-surface p-0.5">
            <button
              onClick={() => setViewMode('split')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                viewMode === 'split'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              <Columns2 size={13} /> Split View
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                viewMode === 'unified'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              <FileCode size={13} /> Unified View
            </button>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none ml-1">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="rounded border-border text-accent focus:ring-accent"
            />
            <span>Ignore whitespace</span>
          </label>
        </div>

        {/* Middle: Diff Stats */}
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
            +{stats.added}
          </Badge>
          <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
            -{stats.removed}
          </Badge>
          <span className="text-xs text-text-secondary">{stats.unchanged} unchanged</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={handleSwap} title="Swap Original & Modified">
            <ArrowLeftRight size={13} /> Swap
          </Button>
          <Button size="sm" variant="ghost" onClick={handleLoadSample} title="Load sample diff">
            <Sparkles size={13} /> Sample
          </Button>
          <Button size="sm" variant="ghost" onClick={handleClear} title="Clear text">
            <Trash2 size={13} /> Clear
          </Button>
          <Button size="sm" variant="secondary" onClick={handleCopyDiff} title="Copy unified diff output">
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy Diff'}</span>
          </Button>
        </div>
      </div>

      {/* Input Editors (Collapsible or side-by-side textareas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Original (Version A)
            </label>
            <span className="text-[10px] text-text-secondary font-mono">
              {original.split('\n').length} lines
            </span>
          </div>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={5}
            placeholder="Paste original content here..."
            className="w-full rounded-lg border border-border bg-bg p-2.5 font-mono text-xs text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none resize-y"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Modified (Version B)
            </label>
            <span className="text-[10px] text-text-secondary font-mono">
              {modified.split('\n').length} lines
            </span>
          </div>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            rows={5}
            placeholder="Paste modified content here..."
            className="w-full rounded-lg border border-border bg-bg p-2.5 font-mono text-xs text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none resize-y"
          />
        </div>
      </div>

      {/* Diff Output Viewer Container */}
      <div className="flex flex-col rounded-xl border border-border bg-bg overflow-hidden shadow-inner">
        {/* Diff Header Banner */}
        <div className="flex items-center justify-between border-b border-border/70 bg-surface-elevated/60 px-4 py-2 text-xs text-text-secondary">
          <span className="font-semibold text-text-primary flex items-center gap-2">
            <span>Visual Diff Preview</span>
            <span className="text-[11px] font-normal text-text-secondary">
              ({viewMode === 'split' ? 'Side-by-Side Comparison' : 'Inline Unified View'})
            </span>
          </span>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-secondary mr-2">Jump changes:</span>
            <button
              onClick={() => scrollToChange('prev')}
              className="rounded p-1 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              title="Previous change"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={() => scrollToChange('next')}
              className="rounded p-1 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              title="Next change"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable Code Diff Area */}
        <div
          ref={diffContainerRef}
          className="max-h-[380px] overflow-auto font-mono text-xs select-text"
        >
          {original.trim() === '' && modified.trim() === '' ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-text-secondary">
              <Columns2 size={24} className="opacity-30 mb-2" />
              <p className="text-xs">Paste text in Original and Modified boxes above to see live diff.</p>
            </div>
          ) : viewMode === 'split' ? (
            /* Split View */
            <div className="min-w-[650px] divide-y divide-border/20">
              {splitRows.map((row, idx) => {
                const isChanged = row.left?.type === 'removed' || row.right?.type === 'added'

                return (
                  <div
                    key={idx}
                    data-diff-change={isChanged ? 'true' : undefined}
                    className="grid grid-cols-2 text-xs leading-relaxed"
                  >
                    {/* Left Pane (Original) */}
                    <div
                      className={cn(
                        'flex items-start border-r border-border/40 px-2 py-0.5 min-h-[22px]',
                        row.left?.type === 'removed'
                          ? 'bg-rose-500/15 text-rose-300 border-l-2 border-l-rose-500'
                          : 'text-text-secondary/90',
                      )}
                    >
                      <span className="w-9 shrink-0 select-none text-right pr-3 font-mono text-[10px] text-text-secondary/50">
                        {row.left?.lineNum ?? ''}
                      </span>
                      <span className="w-4 shrink-0 select-none font-bold text-rose-400">
                        {row.left?.type === 'removed' ? '-' : ' '}
                      </span>
                      <span className="flex-1 whitespace-pre-wrap break-all font-mono">
                        {row.left?.text ?? ''}
                      </span>
                    </div>

                    {/* Right Pane (Modified) */}
                    <div
                      className={cn(
                        'flex items-start px-2 py-0.5 min-h-[22px]',
                        row.right?.type === 'added'
                          ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-l-emerald-500'
                          : 'text-text-secondary/90',
                      )}
                    >
                      <span className="w-9 shrink-0 select-none text-right pr-3 font-mono text-[10px] text-text-secondary/50">
                        {row.right?.lineNum ?? ''}
                      </span>
                      <span className="w-4 shrink-0 select-none font-bold text-emerald-400">
                        {row.right?.type === 'added' ? '+' : ' '}
                      </span>
                      <span className="flex-1 whitespace-pre-wrap break-all font-mono">
                        {row.right?.text ?? ''}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Unified View */
            <div className="min-w-[500px] divide-y divide-border/20">
              {diffLines.map((line, idx) => {
                const isAdded = line.type === 'added'
                const isRemoved = line.type === 'removed'
                const isChanged = isAdded || isRemoved

                return (
                  <div
                    key={idx}
                    data-diff-change={isChanged ? 'true' : undefined}
                    className={cn(
                      'flex items-start px-3 py-0.5 text-xs leading-relaxed',
                      isAdded && 'bg-emerald-500/15 text-emerald-300 border-l-2 border-l-emerald-500',
                      isRemoved && 'bg-rose-500/15 text-rose-300 border-l-2 border-l-rose-500',
                      !isChanged && 'text-text-secondary/90',
                    )}
                  >
                    <span className="w-8 shrink-0 select-none text-right pr-2 font-mono text-[10px] text-text-secondary/50">
                      {line.oldLineNum ?? ''}
                    </span>
                    <span className="w-8 shrink-0 select-none text-right pr-3 font-mono text-[10px] text-text-secondary/50">
                      {line.newLineNum ?? ''}
                    </span>
                    <span
                      className={cn(
                        'w-4 shrink-0 select-none font-bold',
                        isAdded ? 'text-emerald-400' : isRemoved ? 'text-rose-400' : 'text-text-secondary/40',
                      )}
                    >
                      {isAdded ? '+' : isRemoved ? '-' : ' '}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all font-mono">
                      {line.content}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
