// ── Todo ─────────────────────────────────────────────────────────────

export type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Todo {
  id: string
  title: string
  description?: string
  status: TodoStatus
  priority: TodoPriority
  dueDate?: string // ISO date, e.g. "2026-08-29"
  dueTime?: string // "HH:MM", 24h
  createdAt: string
  updatedAt: string
  completedAt?: string
  tags: string[]
}

export type TodoDraft = Pick<Todo, 'title'> &
  Partial<Pick<Todo, 'description' | 'priority' | 'dueDate' | 'dueTime' | 'tags'>>

// ── Shortcuts ────────────────────────────────────────────────────────

export type ShortcutCategory =
  | 'Development'
  | 'Documentation'
  | 'Cloud'
  | 'Productivity'
  | 'Personal'
  | 'Custom'

export interface Shortcut {
  id: string
  title: string
  url: string
  description?: string
  category: ShortcutCategory
  order: number
  createdAt: string
}

export type ShortcutDraft = Pick<Shortcut, 'title' | 'url'> &
  Partial<Pick<Shortcut, 'description' | 'category'>>

// ── Widgets ──────────────────────────────────────────────────────────

export type WidgetType = 'CLOCK' | 'TODO' | 'SHORTCUTS'
// Additional types (STOPWATCH, TIMER, POMODORO, DEV_TOOLS, SNIPPETS, NOTES,
// PRODUCTIVITY, GITHUB, CALENDAR, QUOTE, SYSTEM_STATUS) register the same
// way — see widgets/registry.ts — once their components exist.

export interface WidgetConfig {
  id: string
  type: WidgetType
  x: number
  y: number
  w: number // grid columns, out of 12
  h: number // grid rows
  visible: boolean
  minimized: boolean
}

// ── Settings ─────────────────────────────────────────────────────────

export interface ClockSettings {
  use24Hour: boolean
  showSeconds: boolean
  showDate: boolean
}

export interface NotificationSettings {
  enabled: boolean
  notifyAtDueTime: boolean
  notifyMinutesBefore: 0 | 5 | 15 | 30
}

export interface BackgroundSettings {
  enabled: boolean
  imageUrl: string | null
  opacity: number // 0–1
  blurPx: number
  overlayIntensity: number // 0–1
}

export interface Settings {
  accentColor: string
  clock: ClockSettings
  notifications: NotificationSettings
  background: BackgroundSettings
}

export const DEFAULT_SETTINGS: Settings = {
  accentColor: '#5B8CFF',
  clock: { use24Hour: false, showSeconds: false, showDate: true },
  notifications: { enabled: true, notifyAtDueTime: true, notifyMinutesBefore: 0 },
  background: { enabled: false, imageUrl: null, opacity: 0.5, blurPx: 0, overlayIntensity: 0.6 },
}
