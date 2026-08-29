import { StorageService } from '../StorageService'
import type { Note, NoteDraft } from '@/types'
import { generateId } from '@/utils/id'

const KEY = 'devtab.notes'

async function getAll(): Promise<Note[]> {
  return (await StorageService.get<Note[]>(KEY)) ?? []
}
async function saveAll(notes: Note[]): Promise<void> {
  await StorageService.set(KEY, notes)
}

export const NoteRepository = {
  getAll,
  /** Used by the sync engine to write back a merged local+remote set. */
  async replaceAll(notes: Note[]): Promise<void> {
    await saveAll(notes)
  },
  async create(draft: NoteDraft): Promise<Note> {
    const now = new Date().toISOString()
    const note: Note = { id: generateId(), title: draft.title, content: draft.content ?? '', createdAt: now, updatedAt: now }
    await saveAll([note, ...(await getAll())])
    return note
  },
  async update(id: string, patch: Partial<Note>): Promise<void> {
    const all = await getAll()
    await saveAll(all.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)))
  },
  async remove(id: string): Promise<void> {
    await saveAll((await getAll()).filter((n) => n.id !== id))
  },
}
