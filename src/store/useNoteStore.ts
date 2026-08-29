import { create } from 'zustand'
import type { Note, NoteDraft } from '@/types'
import { NoteRepository } from '@/services/storage/repositories/NoteRepository'

interface NoteStore {
  notes: Note[]
  loading: boolean
  load: () => Promise<void>
  create: (draft: NoteDraft) => Promise<Note>
  update: (id: string, patch: Partial<Note>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  loading: true,
  load: async () => {
    set({ loading: true })
    set({ notes: await NoteRepository.getAll(), loading: false })
  },
  create: async (draft) => {
    const note = await NoteRepository.create(draft)
    set({ notes: await NoteRepository.getAll() })
    return note
  },
  update: async (id, patch) => {
    await NoteRepository.update(id, patch)
    set({ notes: await NoteRepository.getAll() })
  },
  remove: async (id) => {
    await NoteRepository.remove(id)
    set({ notes: await NoteRepository.getAll() })
  },
}))
