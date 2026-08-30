import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileJson,
  FileUp,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { BackupService, type BackupSummary } from '@/services/storage/BackupService'

export function BackupSection() {
  const [summary, setSummary] = useState<BackupSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState<BackupSummary | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearing, setClearing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadSummary() {
    try {
      setLoading(true)
      const data = await BackupService.getStorageSummary()
      setSummary(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
  }, [])

  async function handleExport() {
    try {
      await BackupService.downloadBackupFile()
    } catch (err) {
      console.error('Export failed', err)
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportError(null)
    setImportSuccess(null)

    try {
      const text = await file.text()
      const result = await BackupService.importBackup(text)
      if (result.success && result.summary) {
        setImportSuccess(result.summary)
        await loadSummary()
      } else {
        setImportError(result.error || 'Failed to import backup file.')
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to read file.')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleConfirmClear() {
    try {
      setClearing(true)
      await BackupService.clearAllData()
      await loadSummary()
      setImportSuccess(null)
      setImportError(null)
      setShowClearModal(false)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Data Management & Backup</h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Export your entire workspace to a JSON backup, restore previous state, or reset data.
        </p>
      </div>

      {/* Summary Counts Badges */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-lg border border-border bg-surface-elevated/40 p-3 text-center">
            <span className="block text-base font-bold text-text-primary">
              {summary.todosCount}
            </span>
            <span className="text-[11px] text-text-secondary">Tasks</span>
          </div>
          <div className="rounded-lg border border-border bg-surface-elevated/40 p-3 text-center">
            <span className="block text-base font-bold text-text-primary">
              {summary.shortcutsCount}
            </span>
            <span className="text-[11px] text-text-secondary">Shortcuts</span>
          </div>
          <div className="rounded-lg border border-border bg-surface-elevated/40 p-3 text-center">
            <span className="block text-base font-bold text-text-primary">
              {summary.notesCount}
            </span>
            <span className="text-[11px] text-text-secondary">Notes</span>
          </div>
          <div className="rounded-lg border border-border bg-surface-elevated/40 p-3 text-center">
            <span className="block text-base font-bold text-text-primary">
              {summary.snippetsCount}
            </span>
            <span className="text-[11px] text-text-secondary">Snippets</span>
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="rounded-lg border border-border bg-surface-elevated/40 p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Download size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-primary">Export Entire Data</h4>
              <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                Download a complete JSON backup file of all your tasks, shortcuts, notes, snippets,
                custom settings, focus timer history, and widget layout.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleExport} disabled={loading} className="shrink-0">
            <FileJson size={14} />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Import Section */}
      <div className="rounded-lg border border-border bg-surface-elevated/40 p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileUp size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-primary">Import & Restore Backup</h4>
              <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                Upload an exported DevNest JSON file to restore your entire workspace state. Useful
                for transferring data across devices or restoring backups.
              </p>
            </div>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
              id="backup-file-input"
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0"
            >
              {importing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Importing...
                </>
              ) : (
                <>
                  <FileUp size={14} /> Import JSON
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Import Feedback Banners */}
        {importSuccess && (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-success animate-fadeIn">
            <CheckCircle2 size={16} className="shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Backup successfully restored!</p>
              <p className="text-[11px] text-success/80 mt-0.5">
                Restored {importSuccess.todosCount} tasks, {importSuccess.shortcutsCount} shortcuts,{' '}
                {importSuccess.notesCount} notes, and {importSuccess.snippetsCount} snippets.
              </p>
            </div>
          </div>
        )}

        {importError && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger animate-fadeIn">
            <AlertCircle size={16} className="shrink-0" />
            <span>{importError}</span>
          </div>
        )}
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/15 text-danger">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-danger">Danger Zone: Clear All Data</h4>
                <Badge className="bg-danger/10 text-danger border border-danger/30 text-[9px]">
                  Irreversible
                </Badge>
              </div>
              <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                Permanently erase all local tasks, notes, snippets, shortcuts, and focus history.
                Resets the application to its fresh install state.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowClearModal(true)}
            className="shrink-0"
          >
            <Trash2 size={14} /> Clear All Data
          </Button>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      <Modal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear all application data?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">This action cannot be undone!</p>
              <p className="text-[11px] text-danger/90 mt-1">
                All your tasks, shortcuts, snippets, notes, and preferences will be permanently
                deleted from this browser. Please export a JSON backup if you wish to keep your data.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              disabled={clearing}
              onClick={() => setShowClearModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={clearing}
              onClick={handleConfirmClear}
            >
              {clearing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Clearing...
                </>
              ) : (
                'Yes, Delete Everything'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

