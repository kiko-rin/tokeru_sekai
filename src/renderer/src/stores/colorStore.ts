import { create } from 'zustand'
import type { ColorGradeParams, ColorSpace, LUTPreset } from '@shared/types'

const DEFAULT_PARAMS: ColorGradeParams = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 6500,
  tint: 0,
  saturation: 1,
  vibrance: 0,
  lift: { r: 0, g: 0, b: 0 },
  gamma: { r: 1, g: 1, b: 1 },
  gain: { r: 1, g: 1, b: 1 },
  lutEnabled: false,
  lutOpacity: 1
}

interface ColorState {
  params: ColorGradeParams
  paramsHistory: ColorGradeParams[]
  historyIndex: number
  activeLUT: LUTPreset | null
  splitView: boolean
  activeTab: 'basic' | 'curve' | 'hsl' | 'lut'
  outputColorSpace: ColorSpace
  setParams: (params: Partial<ColorGradeParams>) => void
  resetParams: () => void
  undo: () => void
  redo: () => void
  setActiveLUT: (lut: LUTPreset | null) => void
  setSplitView: (v: boolean) => void
  setActiveTab: (tab: 'basic' | 'curve' | 'hsl' | 'lut') => void
  setOutputColorSpace: (cs: ColorSpace) => void
}

export const useColorStore = create<ColorState>((set, get) => ({
  params: { ...DEFAULT_PARAMS },
  paramsHistory: [{ ...DEFAULT_PARAMS }],
  historyIndex: 0,
  activeLUT: null,
  splitView: false,
  activeTab: 'basic',
  outputColorSpace: 'Rec709' as ColorSpace,
  setParams: (partial) => set((s) => {
    const next = { ...s.params, ...partial }
    const history = s.paramsHistory.slice(0, s.historyIndex + 1)
    history.push(next)
    return {
      params: next,
      paramsHistory: history,
      historyIndex: history.length - 1
    }
  }),
  resetParams: () => set({
    params: { ...DEFAULT_PARAMS },
    paramsHistory: [{ ...DEFAULT_PARAMS }],
    historyIndex: 0
  }),
  undo: () => set((s) => {
    if (s.historyIndex <= 0) return s
    const idx = s.historyIndex - 1
    return { params: { ...s.paramsHistory[idx] }, historyIndex: idx }
  }),
  redo: () => set((s) => {
    if (s.historyIndex >= s.paramsHistory.length - 1) return s
    const idx = s.historyIndex + 1
    return { params: { ...s.paramsHistory[idx] }, historyIndex: idx }
  }),
  setActiveLUT: (lut) => set({ activeLUT: lut }),
  setSplitView: (v) => set({ splitView: v }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setOutputColorSpace: (cs) => set({ outputColorSpace: cs })
}))
