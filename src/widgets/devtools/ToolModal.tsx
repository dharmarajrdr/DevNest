import { Suspense } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { DevToolDefinition } from './tools/registry'

export function ToolModal({ tool, onClose }: { tool: DevToolDefinition | null; onClose: () => void }) {
  if (!tool) return null
  const Tool = tool.component

  return (
    <Modal open={!!tool} onClose={onClose} title={tool.label}>
      <Suspense
        fallback={
          <div className="space-y-2">
            <div className="h-8 animate-pulse rounded-lg bg-surface-elevated" />
            <div className="h-24 animate-pulse rounded-lg bg-surface-elevated" />
          </div>
        }
      >
        <Tool />
      </Suspense>
    </Modal>
  )
}
