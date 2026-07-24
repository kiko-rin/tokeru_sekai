import { create } from 'zustand'

export type FileStatus = 'available' | 'missing' | 'moved' | 'offline'
export type HashAlgorithm = 'sha256' | 'sha512' | 'md5'

export interface DITFile {
  id: string
  name: string
  relativePath: string     // original relative path from project root
  absolutePath: string     // last known absolute path
  size: number
  type: 'video' | 'audio' | 'image' | 'lut' | 'other'
  hash: string
  hashAlgorithm: HashAlgorithm
  status: FileStatus
  modifiedAt: number
  projectId: string
  linkedClips: string[]    // clip IDs in timeline that reference this file
}

export interface DITCardJob {
  id: string
  cardLabel: string
  sourcePath: string
  destPath: string
  files: { name: string; path: string; size: number; hash: string; hashAlgorithm: string; verified: boolean }[]
  status: 'idle' | 'scanning' | 'ready' | 'copying' | 'verifying' | 'completed' | 'error'
  progress: number
  totalSize: number
  copiedSize: number
  errors: string[]
  startedAt: number | null
  completedAt: number | null
}

export interface DITSession {
  id: string
  date: string
  cardName: string
  projectId: string
  projectName: string
  jobs: DITCardJob[]
  notes: string
}

export interface ProjectConfig {
  version: string
  projectId: string
  projectName: string
  createdAt: number
  updatedAt: number
  rootPath: string
  files: DITFile[]
  sessions: DITSession[]
  lastOpenPaths: { clipId: string; path: string; hash: string; hashAlgorithm: string }[]
}

interface DITState {
  // File registry (per session)
  projectFiles: DITFile[]
  currentProjectId: string | null
  currentProjectRoot: string

  // Card copy state
  currentJob: DITCardJob | null
  sessions: DITSession[]
  recentCards: { path: string; label: string; lastUsed: number }[]

  // Actions
  setProjectId: (id: string | null) => void
  setProjectRoot: (path: string) => void
  setProjectFiles: (files: DITFile[]) => void
  addProjectFile: (file: DITFile) => void
  removeProjectFile: (id: string) => void
  updateFileStatus: (id: string, status: FileStatus, newPath?: string) => void
  updateFileHash: (id: string, hash: string, algorithm: HashAlgorithm) => void
  linkClipToFile: (fileId: string, clipId: string) => void
  unlinkClipFromFile: (fileId: string, clipId: string) => void

  setCurrentJob: (job: DITCardJob | null) => void
  updateJob: (updates: Partial<DITCardJob>) => void
  addSession: (session: DITSession) => void
  addRecentCard: (path: string, label: string) => void
  reset: () => void

  // Config persistence helpers
  generateConfig: () => ProjectConfig
  loadFromConfig: (config: ProjectConfig) => void
}

export const useDITStore = create<DITState>((set, get) => ({
  projectFiles: [],
  currentProjectId: null,
  currentProjectRoot: '',
  currentJob: null,
  sessions: [],
  recentCards: [],

  setProjectId: (id) => set({ currentProjectId: id }),
  setProjectRoot: (path) => set({ currentProjectRoot: path }),
  setProjectFiles: (files) => set({ projectFiles: files }),
  addProjectFile: (file) => set((s) => ({ projectFiles: [...s.projectFiles, file] })),
  removeProjectFile: (id) => set((s) => ({ projectFiles: s.projectFiles.filter(f => f.id !== id) })),

  updateFileStatus: (id, status, newPath) => set((s) => ({
    projectFiles: s.projectFiles.map(f => f.id === id ? { ...f, status, absolutePath: newPath || f.absolutePath } : f)
  })),

  updateFileHash: (id, hash, algorithm) => set((s) => ({
    projectFiles: s.projectFiles.map(f => f.id === id ? { ...f, hash, hashAlgorithm: algorithm } : f)
  })),

  linkClipToFile: (fileId, clipId) => set((s) => ({
    projectFiles: s.projectFiles.map(f =>
      f.id === fileId ? { ...f, linkedClips: [...new Set([...f.linkedClips, clipId])] } : f
    )
  })),

  unlinkClipFromFile: (fileId, clipId) => set((s) => ({
    projectFiles: s.projectFiles.map(f =>
      f.id === fileId ? { ...f, linkedClips: f.linkedClips.filter(c => c !== clipId) } : f
    )
  })),

  setCurrentJob: (job) => set({ currentJob: job }),
  updateJob: (updates) => set((s) => ({
    currentJob: s.currentJob ? { ...s.currentJob, ...updates } : null
  })),
  addSession: (session) => set((s) => ({ sessions: [...s.sessions, session] })),
  addRecentCard: (path, label) => set((s) => {
    const existing = s.recentCards.filter(c => c.path !== path)
    return { recentCards: [{ path, label, lastUsed: Date.now() }, ...existing].slice(0, 10) }
  }),
  reset: () => set({ currentJob: null }),

  generateConfig: () => {
    const s = get()
    return {
      version: '1.0.0',
      projectId: s.currentProjectId || '',
      projectName: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      rootPath: s.currentProjectRoot,
      files: s.projectFiles,
      sessions: s.sessions,
      lastOpenPaths: s.projectFiles.flatMap(f =>
        f.linkedClips.map(clipId => ({ clipId, path: f.absolutePath, hash: f.hash, hashAlgorithm: f.hashAlgorithm }))
      )
    }
  },

  loadFromConfig: (config) => set({
    projectFiles: config.files || [],
    sessions: config.sessions || [],
    currentProjectRoot: config.rootPath || '',
    currentProjectId: config.projectId || null,
  })
}))
