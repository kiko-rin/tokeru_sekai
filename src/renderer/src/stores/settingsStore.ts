import { create } from 'zustand'
import type { ACEColorSettings } from '@shared/types'

const DEFAULT_ACE: ACEColorSettings = {
  autoRestore: true,
  restoreLUTLibrary: 'built-in',
  defaultRestoreLUT: '',
  forceOverwrite: false,
  autoUnify: true,
  unifyStrength: 70,
  targetTemperature: 5600,
  targetTint: 0,
  targetSaturation: 100,
  targetContrast: 1,
  lutStoragePath: '~/.2d-workshop/luts/'
}

interface SettingsState {
  language: string
  theme: 'dark' | 'light'
  uiScale: number
  autoSave: boolean
  autoSaveInterval: number
  undoSteps: number
  ace: ACEColorSettings
  projectPath: string
  cachePath: string
  exportPath: string
  activeNav: string
  setLanguage: (lang: string) => void
  setTheme: (theme: 'dark' | 'light') => void
  setUiScale: (scale: number) => void
  setAutoSave: (on: boolean, interval?: number) => void
  setUndoSteps: (steps: number) => void
  setAceSettings: (settings: Partial<ACEColorSettings>) => void
  resetToAceStandard: () => void
  setProjectPath: (path: string) => void
  setCachePath: (path: string) => void
  setExportPath: (path: string) => void
  setActiveNav: (nav: string) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'zh-CN',
  theme: 'dark',
  uiScale: 100,
  autoSave: true,
  autoSaveInterval: 5,
  undoSteps: 50,
  ace: { ...DEFAULT_ACE },
  projectPath: '~/2D-Workshop/Projects/',
  cachePath: '~/2D-Workshop/Cache/',
  exportPath: '~/2D-Workshop/Export/',
  activeNav: 'general',
  setLanguage: (lang) => set({ language: lang }),
  setTheme: (theme) => set({ theme }),
  setUiScale: (scale) => set({ uiScale: scale }),
  setAutoSave: (on, interval) => set((s) => ({ autoSave: on, autoSaveInterval: interval ?? s.autoSaveInterval })),
  setUndoSteps: (steps) => set({ undoSteps: steps }),
  setAceSettings: (partial) => set((s) => ({ ace: { ...s.ace, ...partial } })),
  resetToAceStandard: () => set((s) => ({
    ace: {
      ...s.ace,
      autoRestore: true,
      autoUnify: true,
      unifyStrength: 70,
      targetTemperature: 5600,
      targetTint: 0,
      targetSaturation: 100,
      targetContrast: 1
    }
  })),
  setProjectPath: (path) => set({ projectPath: path }),
  setCachePath: (path) => set({ cachePath: path }),
  setExportPath: (path) => set({ exportPath: path }),
  setActiveNav: (nav) => set({ activeNav: nav })
}))
