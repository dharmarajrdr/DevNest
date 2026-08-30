import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmModalProps {
  open: boolean
  title?: string
  message: string
  itemName?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title = 'Confirm deletion',
  message,
  itemName,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger/5 p-3">
          <AlertTriangle size={18} className="shrink-0 text-danger mt-0.5" />
          <div className="text-xs text-text-secondary leading-relaxed">
            <p>{message}</p>
            {itemName && (
              <p className="mt-1 font-semibold text-text-primary truncate">
                &ldquo;{itemName}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

