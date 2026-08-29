import type { ComponentType } from 'react'
import { Clock, ListTodo, Link2, Timer, AlarmClock, Coffee, Wrench, Code2, NotebookPen, BarChart3, Github, type LucideProps } from 'lucide-react'
import type { WidgetType } from '@/types'
import { ClockWidget } from './clock/ClockWidget'
import { TodoWidget } from './todo/TodoWidget'
import { ShortcutsWidget } from './shortcuts/ShortcutsWidget'
import { StopwatchWidget } from './stopwatch/StopwatchWidget'
import { TimerWidget } from './timer/TimerWidget'
import { PomodoroWidget } from './pomodoro/PomodoroWidget'
import { DevToolsWidget } from './devtools/DevToolsWidget'
import { SnippetsWidget } from './snippets/SnippetsWidget'
import { NotesWidget } from './notes/NotesWidget'
import { ProductivityWidget } from './productivity/ProductivityWidget'
import { GitHubWidget } from './github/GitHubWidget'

export interface WidgetDefinition {
  type: WidgetType
  title: string
  icon: ComponentType<LucideProps>
  component: ComponentType
}

/**
 * Every widget on the dashboard is looked up here by type — the grid
 * never imports a widget component directly. Adding a new widget later
 * (Productivity, GitHub, Calendar…) is one entry here plus a WidgetConfig
 * in WidgetRepository's default layout; nothing else changes.
 */
export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition> = {
  CLOCK: { type: 'CLOCK', title: 'Clock', icon: Clock, component: ClockWidget },
  TODO: { type: 'TODO', title: 'Tasks', icon: ListTodo, component: TodoWidget },
  SHORTCUTS: { type: 'SHORTCUTS', title: 'Shortcuts', icon: Link2, component: ShortcutsWidget },
  STOPWATCH: { type: 'STOPWATCH', title: 'Stopwatch', icon: Timer, component: StopwatchWidget },
  TIMER: { type: 'TIMER', title: 'Timer', icon: AlarmClock, component: TimerWidget },
  POMODORO: { type: 'POMODORO', title: 'Pomodoro', icon: Coffee, component: PomodoroWidget },
  DEV_TOOLS: { type: 'DEV_TOOLS', title: 'Developer Tools', icon: Wrench, component: DevToolsWidget },
  SNIPPETS: { type: 'SNIPPETS', title: 'Snippets', icon: Code2, component: SnippetsWidget },
  NOTES: { type: 'NOTES', title: 'Notes', icon: NotebookPen, component: NotesWidget },
  PRODUCTIVITY: { type: 'PRODUCTIVITY', title: 'Productivity', icon: BarChart3, component: ProductivityWidget },
  GITHUB: { type: 'GITHUB', title: 'GitHub Activity', icon: Github, component: GitHubWidget },
}
