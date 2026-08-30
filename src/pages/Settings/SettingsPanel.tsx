import { useState, type ReactNode } from 'react'
import {
  Palette,
  Clock,
  Bell,
  LayoutGrid,
  Cloud,
  Database,
  Code2,
  Keyboard,
  Info,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Image as ImageIcon,
  Sliders,
  Calendar,
  Layers,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Switch } from '@/components/ui/Switch'
import { Select, type SelectOption } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useWidgetStore } from '@/store/useWidgetStore'
import { theme } from '@/config/theme'
import { WIDGET_REGISTRY } from '@/widgets/registry'
import { SyncSection } from './SyncSection'
import { BackupSection } from './BackupSection'
import { IntegrationsSection } from './IntegrationsSection'
import { cn } from '@/utils/cn'

interface Props {
  open: boolean
  onClose: () => void
}

type TabKey =
  | 'appearance'
  | 'clock'
  | 'notifications'
  | 'dashboard'
  | 'integrations'
  | 'sync'
  | 'backup'
  | 'shortcuts'
  | 'about'

interface TabConfig {
  key: TabKey
  label: string
  icon: LucideIcon
  badgeColor: string
  badgeBg: string
}

const TABS: TabConfig[] = [
  {
    key: 'appearance',
    label: 'Appearance',
    icon: Palette,
    badgeColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/10',
  },
  {
    key: 'clock',
    label: 'Clock & Time',
    icon: Clock,
    badgeColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: Bell,
    badgeColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/10',
  },
  {
    key: 'dashboard',
    label: 'Customization & Widgets',
    icon: LayoutGrid,
    badgeColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
  },
  {
    key: 'integrations',
    label: 'Developer Accounts',
    icon: Code2,
    badgeColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
  },
  {
    key: 'sync',
    label: 'Cloud Sync',
    icon: Cloud,
    badgeColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10',
  },
  {
    key: 'backup',
    label: 'Data & Backup',
    icon: Database,
    badgeColor: 'text-violet-400',
    badgeBg: 'bg-violet-500/10',
  },
  {
    key: 'shortcuts',
    label: 'Shortcuts',
    icon: Keyboard,
    badgeColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/10',
  },
  {
    key: 'about',
    label: 'About DevNest',
    icon: Info,
    badgeColor: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10',
  },
]

const NOTIFY_MINUTES_OPTIONS: SelectOption[] = [
  { value: '0', label: 'At due time' },
  { value: '5', label: '5 minutes before' },
  { value: '15', label: '15 minutes before' },
  { value: '30', label: '30 minutes before' },
]

function SettingRow({
  icon: Icon,
  iconColor = 'text-accent',
  iconBg = 'bg-accent/10',
  title,
  description,
  tooltip,
  children,
}: {
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  title: string
  description: string
  tooltip?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 py-3 border-b border-border/40 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5',
            iconBg,
            iconColor,
          )}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-text-primary">{title}</span>
            {tooltip && (
              <span
                title={tooltip}
                className="cursor-help text-text-secondary/70 hover:text-text-secondary"
              >
                <HelpCircle size={12} />
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="shrink-0 sm:self-center pl-11 sm:pl-0">{children}</div>
    </div>
  )
}

export function SettingsPanel({ open, onClose }: Props) {
  const { settings, update } = useSettingsStore()
  const { layout, toggleVisible, resetLayout, customizing, toggleCustomizing } = useWidgetStore()
  const [activeTab, setActiveTab] = useState<TabKey>('appearance')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings & Customization"
      maxWidth="max-w-4xl w-[860px]"
      bodyClassName="p-0 flex flex-col md:flex-row h-[580px] min-h-[580px] max-h-[580px] overflow-hidden"
    >
      {/* Sidebar Navigation */}
      <div className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border bg-surface/60 p-2 md:p-3 overflow-x-auto md:overflow-y-auto h-full">
        <div className="flex md:flex-col gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all whitespace-nowrap md:whitespace-normal w-full text-left',
                  isActive
                    ? 'bg-accent/15 text-accent shadow-sm'
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors',
                    isActive ? 'bg-accent/20 text-accent' : tab.badgeBg + ' ' + tab.badgeColor,
                  )}
                >
                  <Icon size={14} />
                </span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Settings Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 text-text-primary">
        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Appearance & Theme</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Customize your workspace theme, accent colors, and background wallpaper.
              </p>
            </div>

            {/* Accent Color Section */}
            <div className="rounded-lg border border-border bg-surface-elevated/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent" />
                  <h4 className="text-xs font-semibold text-text-primary">Accent Color</h4>
                </div>
                <span className="text-[11px] font-mono text-text-secondary">
                  {settings.accentColor}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary mb-3">
                Select your preferred highlight color for buttons, active tabs, and indicators.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {theme.accentPresets.map((color) => {
                  const isSelected = settings.accentColor === color
                  return (
                    <button
                      key={color}
                      aria-label={`Use accent ${color}`}
                      onClick={() => {
                        update({ accentColor: color })
                        document.documentElement.style.setProperty('--accent', color)
                      }}
                      className={cn(
                        'relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg',
                        isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-bg',
                      )}
                      style={{ backgroundColor: color }}
                    >
                      {isSelected && <Check size={14} className="text-white drop-shadow-md" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Background Layer Section */}
            <div className="rounded-lg border border-border bg-surface-elevated/40 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-blue-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-text-primary">Custom Wallpaper</h4>
                    <p className="text-[11px] text-text-secondary">
                      Display a custom background image behind your dashboard.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.background.enabled}
                  onChange={(checked) =>
                    update({ background: { ...settings.background, enabled: checked } })
                  }
                  label="Enable custom background"
                />
              </div>

              {settings.background.enabled && (
                <div className="space-y-4 pt-3 border-t border-border/50">
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={settings.background.imageUrl || ''}
                      onChange={(e) =>
                        update({
                          background: {
                            ...settings.background,
                            imageUrl: e.target.value || null,
                          },
                        })
                      }
                      className="w-full rounded-lg border border-border bg-bg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-text-secondary mb-1">
                        <span>Opacity</span>
                        <span>{Math.round(settings.background.opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={settings.background.opacity}
                        onChange={(e) =>
                          update({
                            background: {
                              ...settings.background,
                              opacity: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-accent"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-text-secondary mb-1">
                        <span>Blur</span>
                        <span>{settings.background.blurPx}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={settings.background.blurPx}
                        onChange={(e) =>
                          update({
                            background: {
                              ...settings.background,
                              blurPx: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full accent-accent"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-text-secondary mb-1">
                        <span>Overlay Dim</span>
                        <span>{Math.round(settings.background.overlayIntensity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.9"
                        step="0.05"
                        value={settings.background.overlayIntensity}
                        onChange={(e) =>
                          update({
                            background: {
                              ...settings.background,
                              overlayIntensity: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-accent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clock Tab */}
        {activeTab === 'clock' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Clock & Time Preferences</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Configure how time, seconds, and dates are displayed on your dashboard.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-elevated/40 p-4 divide-y divide-border/40">
              <SettingRow
                icon={Clock}
                iconColor="text-amber-400"
                iconBg="bg-amber-500/10"
                title="24-Hour Time Format"
                description="Display clock in 24-hour military notation (e.g. 14:30) instead of 12-hour AM/PM."
              >
                <Switch
                  checked={settings.clock.use24Hour}
                  onChange={(checked) =>
                    update({ clock: { ...settings.clock, use24Hour: checked } })
                  }
                  label="24-hour format"
                />
              </SettingRow>

              <SettingRow
                icon={Sliders}
                iconColor="text-blue-400"
                iconBg="bg-blue-500/10"
                title="Show Running Seconds"
                description="Display seconds on the primary clock widget."
              >
                <Switch
                  checked={settings.clock.showSeconds}
                  onChange={(checked) =>
                    update({ clock: { ...settings.clock, showSeconds: checked } })
                  }
                  label="Show seconds"
                />
              </SettingRow>

              <SettingRow
                icon={Calendar}
                iconColor="text-emerald-400"
                iconBg="bg-emerald-500/10"
                title="Show Current Date"
                description="Display the current weekday and date beneath the digital clock."
              >
                <Switch
                  checked={settings.clock.showDate}
                  onChange={(checked) =>
                    update({ clock: { ...settings.clock, showDate: checked } })
                  }
                  label="Show date"
                />
              </SettingRow>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Task Notifications</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Manage desktop alerts and reminders for task deadlines and focus sessions.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-elevated/40 p-4 divide-y divide-border/40">
              <SettingRow
                icon={Bell}
                iconColor="text-purple-400"
                iconBg="bg-purple-500/10"
                title="Enable Task Reminders"
                description="Master switch to allow desktop notifications when tasks are due."
              >
                <Switch
                  checked={settings.notifications.enabled}
                  onChange={(checked) =>
                    update({
                      notifications: { ...settings.notifications, enabled: checked },
                    })
                  }
                  label="Enable task reminders"
                />
              </SettingRow>

              <SettingRow
                icon={Clock}
                iconColor="text-amber-400"
                iconBg="bg-amber-500/10"
                title="Alert At Due Time"
                description="Receive an immediate alert at the exact moment the task is scheduled."
              >
                <Switch
                  disabled={!settings.notifications.enabled}
                  checked={settings.notifications.notifyAtDueTime}
                  onChange={(checked) =>
                    update({
                      notifications: { ...settings.notifications, notifyAtDueTime: checked },
                    })
                  }
                  label="Alert at due time"
                />
              </SettingRow>

              <SettingRow
                icon={Sliders}
                iconColor="text-cyan-400"
                iconBg="bg-cyan-500/10"
                title="Advance Notification Timing"
                description="Send an early reminder before the scheduled deadline."
              >
                <Select
                  disabled={!settings.notifications.enabled}
                  options={NOTIFY_MINUTES_OPTIONS}
                  value={String(settings.notifications.notifyMinutesBefore)}
                  onChange={(val) =>
                    update({
                      notifications: {
                        ...settings.notifications,
                        notifyMinutesBefore: parseInt(val) as 0 | 5 | 15 | 30,
                      },
                    })
                  }
                />
              </SettingRow>
            </div>
          </div>
        )}

        {/* Customization & Widgets Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Dashboard & Customization</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Customize your layout arrangement, toggle active widgets, and enter grid edit mode.
              </p>
            </div>

            {/* Interactive Grid Customization */}
            <div className="rounded-lg border border-border bg-surface-elevated/40 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <LayoutGrid size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Interactive Grid Customization</h4>
                    <p className="text-[11px] text-text-secondary">
                      Drag, drop, and resize widget tiles directly on your workspace.
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    toggleCustomizing()
                    onClose()
                  }}
                  className={cn(
                    'text-xs font-semibold',
                    customizing ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : '',
                  )}
                >
                  <LayoutGrid size={13} />
                  {customizing ? 'Exit Customization' : 'Customize Grid'}
                </Button>
              </div>
            </div>

            {/* Widget Visibility List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-text-primary">Visible Dashboard Widgets</h4>
                <Button size="sm" variant="secondary" onClick={() => resetLayout()}>
                  <RotateCcw size={12} />
                  Reset Layout
                </Button>
              </div>

              <div className="rounded-lg border border-border bg-surface-elevated/40 p-4 space-y-1 divide-y divide-border/40 max-h-72 overflow-y-auto">
                {layout.map((w) => {
                  const def = WIDGET_REGISTRY[w.type]
                  const Icon = def?.icon ?? Layers
                  const title = def?.title ?? w.type
                  return (
                    <div key={w.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface border border-border text-text-secondary">
                          <Icon size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-text-primary">{title}</p>
                          <p className="text-[10px] text-text-secondary">
                            {w.visible ? 'Visible on grid' : 'Hidden in tray'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={w.visible}
                        onChange={() => toggleVisible(w.id)}
                        label={`Toggle ${title} visibility`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Developer Integrations Tab */}
        {activeTab === 'integrations' && <IntegrationsSection />}

        {/* Sync Tab */}
        {activeTab === 'sync' && <SyncSection />}

        {/* Data & Backup Tab */}
        {activeTab === 'backup' && <BackupSection />}

        {/* Shortcuts Tab */}
        {activeTab === 'shortcuts' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Keyboard Shortcuts</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Quick reference for global keyboard hotkeys to navigate DevNest efficiently.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-elevated/40 p-4 divide-y divide-border/40 text-xs">
              {[
                { keys: ['⌘', 'K'], altKeys: ['Ctrl', 'K'], desc: 'Open Command Search Palette' },
                { keys: ['/'], desc: 'Quick search across tools & resources' },
                { keys: ['N'], desc: 'Create a new Task modal' },
                { keys: ['S'], desc: 'Start / Pause Stopwatch' },
                { keys: ['T'], desc: 'Start / Pause Timer' },
                { keys: ['Esc'], desc: 'Close active modal or search palette' },
              ].map((s, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <span className="text-text-secondary">{s.desc}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="rounded border border-border bg-surface px-2 py-0.5 text-[11px] font-mono font-semibold text-text-primary shadow-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">About DevNest</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                A software engineer's command center for the Chrome new tab page.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-elevated/40 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent font-black text-lg">
                  DN
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">DevNest Dashboard</h4>
                  <p className="text-[11px] text-text-secondary">Version 0.4.0 · Local-First Architecture</p>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                DevNest brings your development tools, tasks, snippets, notes, shortcuts, and focus
                timers into a single fast, distraction-free dashboard. All data is kept locally on
                your machine unless you explicitly enable private Google Drive Cloud Sync.
              </p>

              <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
                <span>Privacy: 100% Client-Side Storage</span>
                <a
                  href="https://github.com/dharmarajrdr/DevNest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  GitHub Repository <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

