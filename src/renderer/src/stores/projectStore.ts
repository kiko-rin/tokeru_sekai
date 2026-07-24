import { create } from 'zustand'
import type { Project } from '@shared/types'

interface ProjectState {
  projects: Project[]
  currentProjectId: string | null
  searchQuery: string
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  removeProject: (id: string) => void
  setCurrentProject: (id: string | null) => void
  setSearchQuery: (query: string) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProjectId: null,
  searchQuery: '',
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
  setCurrentProject: (id) => set({ currentProjectId: id }),
  setSearchQuery: (query) => set({ searchQuery: query })
}))
