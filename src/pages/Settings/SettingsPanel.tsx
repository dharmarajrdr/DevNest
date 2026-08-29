import { Modal } from '@/components/ui/Modal'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useWidgetStore } from '@/store/useWidgetStore'
import { theme } from '@/config/theme'
import { WIDGET_REGISTRY } from '@/widgets/registry'
import { SyncSection } from './SyncSection'

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * A settings panel covering Appearance, Clock, Notifications, Dashboard,
 * and Sync. Full keyboard-shortcut and About sections are the remaining
 * gap against the original spec's Settings list.
 */
export function SettingsPanel({ open, onClose }: Props) {
  const { settings, update } = useSettingsStore()
  const { layout, toggleVisible, resetLayout } = useWidgetStore()

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="flex flex-col gap-6">
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase text-text-secondary">Appearance</h3>
          <div className="flex gap-2">
            {theme.accentPresets.map((color) => (
              <button
                key={color}
                aria-label={`Use accent ${color}`}
                onClick={() => {
                  update({ accentColor: color })
                  document.documentElement.style.setProperty('--accent', color)
                }}
                className="h-6 w-6 rounded-full border-2"
                style={{
                  backgroundColor: color,
                  borderColor: settings.accentColor === color ? '#fff' : 'transparent',
                }}
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase text-text-secondary">Clock</h3>
          <label className="flex items-center justify-between py-1 text-sm">
            24-hour format
            <input
              type="checkbox"
              checked={settings.clock.use24Hour}
              onChange={(e) => update({ clock: { ...settings.clock, use24Hour: e.target.checked } })}
            />
          </label>
          <label className="flex items-center justify-between py-1 text-sm">
            Show seconds
            <input
              type="checkbox"
              checked={settings.clock.showSeconds}
              onChange={(e) =>
                update({ clock: { ...settings.clock, showSeconds: e.target.checked } })
              }
            />
          </label>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase text-text-secondary">
            Notifications
          </h3>
          <label className="flex items-center justify-between py-1 text-sm">
            Task due reminders
            <input
              type="checkbox"
              checked={settings.notifications.enabled}
              onChange={(e) =>
                update({ notifications: { ...settings.notifications, enabled: e.target.checked } })
              }
            />
          </label>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase text-text-secondary">Dashboard</h3>
          {layout.map((w) => (
            <label key={w.id} className="flex items-center justify-between py-1 text-sm">
              {WIDGET_REGISTRY[w.type]?.title ?? w.type}
              <input type="checkbox" checked={w.visible} onChange={() => toggleVisible(w.id)} />
            </label>
          ))}
          <button
            onClick={() => resetLayout()}
            className="mt-2 text-xs font-medium text-accent hover:underline"
          >
            Reset layout
          </button>
        </section>

        <SyncSection />
      </div>
    </Modal>
  )
}
