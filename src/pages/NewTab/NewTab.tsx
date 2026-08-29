import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { BackgroundLayer } from '@/components/layout/BackgroundLayer'
import { BentoGrid } from '@/components/layout/BentoGrid'
import { CommandPalette } from '@/components/search/CommandPalette'
import { SettingsPanel } from '@/pages/Settings/SettingsPanel'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'

export function NewTab() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useKeyboardShortcut({ key: 'k', metaOrCtrl: true, onTrigger: () => setSearchOpen(true) })
  useKeyboardShortcut({ key: '/', onTrigger: () => setSearchOpen(true) })

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
