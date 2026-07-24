import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  mediaPanelCollapsed: boolean
  activeDialog: string | null
  toggleSidebar: () => void
  toggleMediaPanel: () => void
  openDialog: (id: string) => void
  closeDialog: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mediaPanelCollapsed: false,
  activeDialog: null,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleMediaPanel: () => set((s) => ({ mediaPanelCollapsed: !s.mediaPanelCollapsed })),
  openDialog: (id) => set({ activeDialog: id }),
  closeDialog: () => set({ activeDialog: null })
}))
