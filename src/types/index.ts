// ── Todo ─────────────────────────────────────────────────────────────

export type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
export type RecurrenceUnit = 'day' | 'week' | 'month'

export interface RecurrenceConfig {
  type: RecurrenceType
  interval?: number // e.g. every 2 weeks (default: 1)
  unit?: RecurrenceUnit // for CUSTOM: 'day' | 'week' | 'month'
  daysOfWeek?: number[] // 0 (Sun) - 6 (Sat)
  daysOfMonth?: number[] // 1 - 31 for Monthly recurrence
  endDate?: string // ISO date "YYYY-MM-DD" when the recurrence series stops
}

export interface Todo {
  id: string
  title: string
  description?: string
  status: TodoStatus
  priority: TodoPriority
  startDate?: string // ISO date, e.g. "2026-08-30"
  startTime?: string // "HH:MM", 24h
  endDate?: string // ISO date, e.g. "2026-08-30" or "2026-09-02"
  endTime?: string // "HH:MM", 24h
  isAllDay?: boolean // true for all-day and multi-day tasks without exact time
  dueDate?: string // legacy support, mapped to endDate
  dueTime?: string // legacy support, mapped to endTime
  createdAt: string
  updatedAt: string
  completedAt?: string
  tags: string[]
  recurrence?: RecurrenceConfig
  recurringParentId?: string
}

export type TodoDraft = Pick<Todo, 'title'> &
  Partial<
    Pick<
      Todo,
      | 'description'
      | 'priority'
      | 'startDate'
      | 'startTime'
      | 'endDate'
      | 'endTime'
      | 'isAllDay'
      | 'dueDate'
      | 'dueTime'
      | 'tags'
      | 'recurrence'
      | 'recurringParentId'
    >
  >

// ── Shortcuts ────────────────────────────────────────────────────────

export type ShortcutCategory =
  | 'Readings'
  | 'Social'
  | 'AI Tools'
  | 'Development'
  | 'Documentation'
  | 'Cloud'
  | 'Productivity'
  | 'Personal'
  | 'Custom'
  | (string & {})

export interface Shortcut {
  id: string
  title: string
  url: string
  description?: string
  category: ShortcutCategory
  order: number
  createdAt: string
  updatedAt: string
}

export type ShortcutDraft = Pick<Shortcut, 'title' | 'url'> &
  Partial<Pick<Shortcut, 'description' | 'category'>>

// ── Stopwatch ────────────────────────────────────────────────────────

export type RunState = 'idle' | 'running' | 'paused'

export interface Lap {
  id: string
  elapsedMs: number // total elapsed at the moment the lap was recorded
  createdAt: string
}

export interface StopwatchState {
  status: RunState
  startedAt: number | null // epoch ms of the current run segment; null when not running
  accumulatedMs: number // elapsed time banked from prior run segments
  laps: Lap[]
}

export const IDLE_STOPWATCH: StopwatchState = {
  status: 'idle',
  startedAt: null,
  accumulatedMs: 0,
  laps: [],
}

// ── Timer ────────────────────────────────────────────────────────────

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface TimerState {
  status: TimerStatus
  durationMs: number
  startedAt: number | null // epoch ms of the current run segment
  accumulatedMs: number // ms of durationMs already consumed before this run segment
}

export const IDLE_TIMER: TimerState = {
  status: 'idle',
  durationMs: 25 * 60_000,
  startedAt: null,
  accumulatedMs: 0,
}

// ── Pomodoro ─────────────────────────────────────────────────────────

export type PomodoroMode = 'focus' | 'break'

export interface PomodoroSettings {
  focusMinutes: number
  breakMinutes: number
}

export interface PomodoroState {
  mode: PomodoroMode
  completedFocusSessions: number
  timer: TimerState
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = { focusMinutes: 25, breakMinutes: 5 }

// ── Snippets ─────────────────────────────────────────────────────────

export type SnippetCategory =
  | 'Git'
  | 'Java'
  | 'Spring Boot'
  | 'JavaScript'
  | 'TypeScript'
  | 'SQL'
  | 'Docker'
  | 'Kubernetes'
  | 'Linux'
  | 'Regex'
  | 'Custom'

export interface Snippet {
  id: string
  title: string
  code: string
  category: SnippetCategory
  favorite: boolean
  createdAt: string
  updatedAt: string
}

export type SnippetDraft = Pick<Snippet, 'title' | 'code'> & Partial<Pick<Snippet, 'category'>>

// ── Notes ────────────────────────────────────────────────────────────

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export type NoteDraft = Pick<Note, 'title'> & Partial<Pick<Note, 'content'>>

// ── Productivity ─────────────────────────────────────────────────────

export interface FocusSessionLogEntry {
  id: string
  minutes: number
  completedAt: string // ISO datetime
}

// ── GitHub (placeholder — see services/github/GitHubService.ts) ───────

export interface GitHubActivitySummary {
  username: string
  commits: number
  pullRequests: number
  issues: number
}

// ── Sync (Phase 7 — Google account sync) ───────────────────────────────

export interface GoogleProfile {
  email: string
  name: string
  pictureUrl?: string
}

export type SyncStatus = 'idle' | 'signed-out' | 'syncing' | 'synced' | 'error' | 'offline'

/** Everything that syncs, as one JSON blob in the user's Drive appDataFolder. */
export interface SyncPayload {
  todos: Todo[]
  shortcuts: Shortcut[]
  notes: Note[]
  snippets: Snippet[]
  settings: Settings
  widgetLayout: WidgetConfig[]
  pomodoroSettings: PomodoroSettings
  syncedAt: string
}

export type WidgetType =
  | 'CLOCK'
  | 'TODO'
  | 'SHORTCUTS'
  | 'STOPWATCH'
  | 'TIMER'
  | 'POMODORO'
  | 'DEV_TOOLS'
  | 'SNIPPETS'
  | 'NOTES'
  | 'PRODUCTIVITY'
  | 'GITHUB'
// Further types (CALENDAR, QUOTE, SYSTEM_STATUS) register the same way —
// see widgets/registry.ts — once their components exist.

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
