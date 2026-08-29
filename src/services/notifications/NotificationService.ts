export const NotificationService = {
  taskDue(taskId: string, title: string): void {
    chrome.notifications.create(`task-due:${taskId}`, {
      type: 'basic',
      iconUrl: 'public/icons/icon128.png',
      title: 'Task due',
      message: title,
      priority: 2,
    })
  },

  timerFinished(): void {
    chrome.notifications.create('devtab-timer-finish', {
      type: 'basic',
      iconUrl: 'public/icons/icon128.png',
      title: 'Timer finished',
      message: "Time's up.",
      priority: 2,
    })
  },

  pomodoroPhaseComplete(nextMode: 'focus' | 'break'): void {
    chrome.notifications.create('devtab-pomodoro-finish', {
      type: 'basic',
      iconUrl: 'public/icons/icon128.png',
      title: nextMode === 'break' ? 'Focus session complete' : 'Break complete',
      message: nextMode === 'break' ? 'Time for a short break.' : 'Back to focus when you are ready.',
      priority: 2,
    })
  },
}
