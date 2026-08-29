import { TodoRepository } from '@/services/storage/repositories/TodoRepository'
import { TimerRepository } from '@/services/storage/repositories/TimerRepository'
import { PomodoroRepository } from '@/services/storage/repositories/PomodoroRepository'
import { ProductivityRepository } from '@/services/storage/repositories/ProductivityRepository'
import { NotificationService } from '@/services/notifications/NotificationService'
import { TaskAlarmService } from '@/services/alarms/TaskAlarmService'
import { TimerAlarmService, PomodoroAlarmService } from '@/services/alarms/CountdownAlarmService'
import { nextPomodoroState } from '@/services/pomodoro/transition'

// Service worker: the only place any alarm firing turns into a notification
// (and, for Timer/Pomodoro, the authoritative state write). Keeping this
// out of React means reminders and phase transitions happen correctly even
// with every new tab page closed — a setTimeout in a page context cannot.
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const todoId = TaskAlarmService.parseTodoId(alarm.name)
  if (todoId) {
    const todos = await TodoRepository.getAll()
    const todo = todos.find((t) => t.id === todoId)
    if (todo && todo.status !== 'COMPLETED') NotificationService.taskDue(todo.id, todo.title)
    return
  }

  if (alarm.name === TimerAlarmService.name) {
    const state = await TimerRepository.get()
    // Guard against a race with a tab that was open at the exact finish
    // moment and already transitioned local state — only act if this
    // alarm is still the authoritative "not yet finished" source.
    if (state.status !== 'running') return
    await TimerRepository.save({ ...state, status: 'finished', accumulatedMs: state.durationMs, startedAt: null })
    NotificationService.timerFinished()
    return
  }

  if (alarm.name === PomodoroAlarmService.name) {
    const state = await PomodoroRepository.get()
    if (state.timer.status !== 'running') return
    const settings = await PomodoroRepository.getSettings()
    const completingFocus = state.mode === 'focus'
    const next = nextPomodoroState(state, settings)
    await PomodoroRepository.save(next)
    if (completingFocus) await ProductivityRepository.logFocusSession(settings.focusMinutes)
    NotificationService.pomodoroPhaseComplete(next.mode)
  }
})

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Placeholder for first-run seeding / onboarding hook (Phase 6+).
    console.info('DevTab installed.')
  }
})
