import { TodoRepository } from '@/services/storage/repositories/TodoRepository'
import { NotificationService } from '@/services/notifications/NotificationService'
import { TaskAlarmService } from '@/services/alarms/TaskAlarmService'

// Service worker: the only place alarm firing → notification happens.
// Keeping this logic out of React means reminders work even with the
// new tab page closed.
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const todoId = TaskAlarmService.parseTodoId(alarm.name)
  if (!todoId) return

  const todos = await TodoRepository.getAll()
  const todo = todos.find((t) => t.id === todoId)
  if (!todo || todo.status === 'COMPLETED') return

  NotificationService.taskDue(todo.id, todo.title)
})

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Placeholder for first-run seeding / onboarding hook (Phase 6+).
    console.info('DevTab installed.')
  }
})
