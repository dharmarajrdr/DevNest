/**
 * A minimal in-memory stand-in for the subset of the chrome.* API this
 * codebase actually calls (StorageService, TaskAlarmService,
 * NotificationService). Installed fresh in each test file's beforeEach so
 * tests never share state — real chrome.storage isn't available outside
 * an extension context, so unit tests for repositories need this to run
 * at all.
 */
function createArea() {
  let store: Record<string, unknown> = {}
  return {
    get: (key: string) => Promise.resolve({ [key]: store[key] }),
    set: (items: Record<string, unknown>) => {
      store = { ...store, ...items }
      return Promise.resolve()
    },
    remove: (key: string) => {
      delete store[key]
      return Promise.resolve()
    },
    clear: () => {
      store = {}
      return Promise.resolve()
    },
  }
}

export function installChromeMock() {
  const local = createArea()
  const sync = createArea()

  ;(globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local,
      sync,
      onChanged: { addListener: () => {}, removeListener: () => {} },
    },
    alarms: {
      create: () => {},
      clear: () => Promise.resolve(true),
      onAlarm: { addListener: () => {} },
    },
    notifications: {
      create: () => {},
    },
  }

  return { local, sync }
}
