import type { NotificationSettings, Todo } from '@/types'
import { dueTimestamp } from '@/utils/date'

const PREFIX = 'devtab-task:'

function alarmName(todoId: string): string {
  return `${PREFIX}${todoId}`
}

/**
 * Task reminders are scheduled with chrome.alarms, not a React interval —
 * alarms persist across service-worker restarts and browser relaunches,
 * which a setTimeout in a page context cannot.
 */
export const TaskAlarmService = {
  async schedule(todo: Todo, notificationSettings: NotificationSettings): Promise<void> {
    await this.cancel(todo.id)
    if (!notificationSettings.enabled || todo.status === 'COMPLETED') return

    const due = dueTimestamp(todo)
    if (!due) return

    const leadMs = notificationSettings.notifyMinutesBefore * 60_000
    const fireAt = due - leadMs
    if (fireAt <= Date.now()) return // already past — don't schedule a reminder in the past

    chrome.alarms.create(alarmName(todo.id), { when: fireAt })
  },

  async cancel(todoId: string): Promise<void> {
    await chrome.alarms.clear(alarmName(todoId))
  },

  parseTodoId(alarmName_: string): string | null {
    return alarmName_.startsWith(PREFIX) ? alarmName_.slice(PREFIX.length) : null
  },
}
