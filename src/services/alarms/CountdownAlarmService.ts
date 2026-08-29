/**
 * Schedules the single "it's done" moment for a countdown (Timer or
 * Pomodoro phase) via chrome.alarms, the same way TaskAlarmService does
 * for tasks — so the finish notification fires even if the new tab page
 * that started the countdown has since been closed. The live-updating
 * mm:ss display in the widget is separate and purely cosmetic; this is
 * what guarantees the notification actually happens.
 */
export function makeCountdownAlarmService(alarmName: string) {
  return {
    async schedule(finishAt: number): Promise<void> {
      await chrome.alarms.clear(alarmName)
      if (finishAt <= Date.now()) return
      chrome.alarms.create(alarmName, { when: finishAt })
    },
    async cancel(): Promise<void> {
      await chrome.alarms.clear(alarmName)
    },
    name: alarmName,
  }
}

export const TimerAlarmService = makeCountdownAlarmService('devtab-timer-finish')
export const PomodoroAlarmService = makeCountdownAlarmService('devtab-pomodoro-finish')
