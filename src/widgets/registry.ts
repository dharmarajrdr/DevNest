import type { ComponentType } from 'react'
import { Clock, ListTodo, Link2, type LucideProps } from 'lucide-react'
import type { WidgetType } from '@/types'
import { ClockWidget } from './clock/ClockWidget'
import { TodoWidget } from './todo/TodoWidget'
import { ShortcutsWidget } from './shortcuts/ShortcutsWidget'

export interface WidgetDefinition {
  type: WidgetType
  title: string
  icon: ComponentType<LucideProps>
  component: ComponentType
}

/**
 * Every widget on the dashboard is looked up here by type — the grid
 * never imports a widget component directly. Adding STOPWATCH, TIMER,
 * DEV_TOOLS, SNIPPETS, NOTES, etc. later is one entry here plus a
 * WidgetConfig in the default layout; nothing else changes.
 */
export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition> = {
  CLOCK: { type: 'CLOCK', title: 'Clock', icon: Clock, component: ClockWidget },
  TODO: { type: 'TODO', title: 'Tasks', icon: ListTodo, component: TodoWidget },
  SHORTCUTS: { type: 'SHORTCUTS', title: 'Shortcuts', icon: Link2, component: ShortcutsWidget },
}
