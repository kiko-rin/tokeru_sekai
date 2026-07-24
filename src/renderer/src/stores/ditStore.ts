import { create } from 'zustand'

export interface DITJob {
  id: string
  jobName: string
  sourcePath: string
  destPath: string
  projectId: string | null
  projectName: string
  files: DITFile[]
  status: 'idle' | 'scanning' | 'ready' | 'copying' | 'verifying' | 'completed' | 'error'
  progress: number
  totalSize: number
  copiedSize: number
  errors: string[]
  startedAt: number | null
  completedAt: number | null
}

export interface DITFile {
  id: string
  name: string
  relativePath: string
  size: number
  type: 'video' | 'audio' | 'image' | 'other'
  sourceHash: string | null
  destHash: string | null
  hashAlgorithm: string
  verified: boolean
  copied: boolean
  modifiedAt: number
}

export interface DITSession {
  id: string
  date: string
  cardName: string
  jobs: DITJob[]
  notes: string
}

interface DITState {
  currentJob: DITJob | null
  sessions: DITSession[]
  recentCards: { path: string; label: string; lastUsed: number }[]
  setCurrentJob: (job: DITJob | null) => void
  updateJob: (updates: Partial<DITJob>) => void
  addSession: (session: DITSession) => void
  addRecentCard: (path: string, label: string) => void
  reset: () => void
}

export const useDITStore = create<DITState>((set) => ({
  currentJob: null,
  sessions: [],
  recentCards: [],
  setCurrentJob: (job) => set({ currentJob: job }),
  updateJob: (updates) => set((s) => ({
    currentJob: s.currentJob ? { ...s.currentJob, ...updates } : null
  })),
  addSession: (session) => set((s) => ({ sessions: [...s.sessions, session] })),
  addRecentCard: (path, label) => set((s) => {
    const existing = s.recentCards.filter(c => c.path !== path)
    return { recentCards: [{ path, label, lastUsed: Date.now() }, ...existing].slice(0, 10) }
  }),
  reset: () => set({ currentJob: null })
}))
