import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { BackgroundLayer } from '@/components/layout/BackgroundLayer'
import { BentoGrid } from '@/components/layout/BentoGrid'
import { CommandPalette } from '@/components/search/CommandPalette'
import { SettingsPanel } from '@/pages/Settings/SettingsPanel'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useUIStore } from '@/store/useUIStore'
import { useStopwatchStore } from '@/store/useStopwatchStore'
import { useTimerStore } from '@/store/useTimerStore'

export function NewTab() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const setTaskFormOpen = useUIStore((s) => s.setTaskFormOpen)
  const startStopwatch = useStopwatchStore((s) => s.start)
  const startTimer = useTimerStore((s) => s.start)

  useKeyboardShortcut({ key: 'k', metaOrCtrl: true, onTrigger: () => setSearchOpen(true) })
  useKeyboardShortcut({ key: '/', onTrigger: () => setSearchOpen(true) })
  useKeyboardShortcut({ key: 'n', onTrigger: () => setTaskFormOpen(true) })
  useKeyboardShortcut({ key: 's', onTrigger: () => startStopwatch() })
  useKeyboardShortcut({ key: 't', onTrigger: () => startTimer() })

  return (
    <div className="relative min-h-screen px-6 py-6 md:px-10 md:py-8">
      <BackgroundLayer />
      <div className="mx-auto max-w-[1400px]">
        <Header onOpenSearch={() => setSearchOpen(true)} onOpenSettings={() => setSettingsOpen(true)} />
        <BentoGrid />
      </div>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
