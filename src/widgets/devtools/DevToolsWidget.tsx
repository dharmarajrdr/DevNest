import { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { DEV_TOOLS, type DevToolDefinition } from './tools/registry'
import { ToolModal } from './ToolModal'

export function DevToolsWidget() {
  const [active, setActive] = useState<DevToolDefinition | null>(null)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Developer Tools</CardTitle>
      </CardHeader>
      <div className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto px-3 pb-3 sm:grid-cols-4">
        {DEV_TOOLS.map((tool) => {
          const Icon = tool.icon
          return (
            <button
              key={tool.id}
              onClick={() => setActive(tool)}
              className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-2 py-3 text-center transition-colors hover:border-accent/50"
            >
              <Icon size={16} className="text-accent" />
              <span className="text-[10px] leading-tight text-text-secondary">{tool.label}</span>
            </button>
          )
        })}
      </div>
      <ToolModal tool={active} onClose={() => setActive(null)} />
    </Card>
  )
}
