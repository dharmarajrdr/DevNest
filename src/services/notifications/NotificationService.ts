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
}
