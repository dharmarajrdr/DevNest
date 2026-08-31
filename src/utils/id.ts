export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function generateTaskId(): string {
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 8)
  return `task_${ts}_${rand}`
}
