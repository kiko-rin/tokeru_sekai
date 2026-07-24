import { create } from 'zustand'

interface EQBand {
  frequency: number
  gain: number
  q: number
  type: 'peak' | 'low-shelf' | 'high-shelf' | 'low-pass' | 'high-pass' | 'notch'
}

interface EffectParams {
  [key: string]: number | boolean | string
}

interface AudioEffect {
  id: string
  name: string
  type: string
  bypassed: boolean
  params: EffectParams
}

interface AudioTrackState {
  id: string
  name: string
  color: string
  muted: boolean
  solo: boolean
  volume: number
}

interface AudioState {
  tracks: AudioTrackState[]
  effects: AudioEffect[]
  activeTab: 'spectrum' | 'effects' | 'library'
  selectedEffectId: string | null
  masterVolume: number
  monitorVolume: number
  loudnessStandard: string
  addEffect: (effect: AudioEffect) => void
  removeEffect: (id: string) => void
  toggleBypass: (id: string) => void
  updateEffectParam: (id: string, key: string, value: number | boolean | string) => void
  setActiveTab: (tab: 'spectrum' | 'effects' | 'library') => void
  setTrackVolume: (id: string, volume: number) => void
  toggleMute: (id: string) => void
  toggleSolo: (id: string) => void
  setMasterVolume: (v: number) => void
  setMonitorVolume: (v: number) => void
  setLoudnessStandard: (s: string) => void
}

export const useAudioStore = create<AudioState>((set) => ({
  tracks: [
    { id: 'a1', name: 'A1 主音频', color: '#aa8a6a', muted: false, solo: false, volume: 0 },
    { id: 'a2', name: 'A2 背景音乐', color: '#8a6a8a', muted: false, solo: false, volume: 0 },
    { id: 'a3', name: 'A3 音效', color: '#8a7aaa', muted: false, solo: false, volume: 0 },
    { id: 'a4', name: 'A4 配音', color: '#6b9e7a', muted: false, solo: false, volume: 0 }
  ],
  effects: [],
  activeTab: 'spectrum',
  selectedEffectId: null,
  masterVolume: 0,
  monitorVolume: 0,
  loudnessStandard: 'EBU R128',
  addEffect: (effect) => set((s) => ({ effects: [...s.effects, effect], selectedEffectId: effect.id })),
  removeEffect: (id) => set((s) => ({
    effects: s.effects.filter((e) => e.id !== id),
    selectedEffectId: s.selectedEffectId === id ? null : s.selectedEffectId
  })),
  toggleBypass: (id) => set((s) => ({
    effects: s.effects.map((e) => e.id === id ? { ...e, bypassed: !e.bypassed } : e)
  })),
  updateEffectParam: (id, key, value) => set((s) => ({
    effects: s.effects.map((e) => e.id === id ? { ...e, params: { ...e.params, [key]: value } } : e)
  })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTrackVolume: (id, volume) => set((s) => ({
    tracks: s.tracks.map((t) => t.id === id ? { ...t, volume } : t)
  })),
  toggleMute: (id) => set((s) => ({
    tracks: s.tracks.map((t) => t.id === id ? { ...t, muted: !t.muted } : t)
  })),
  toggleSolo: (id) => set((s) => ({
    tracks: s.tracks.map((t) => t.id === id ? { ...t, solo: !t.solo } : t)
  })),
  setMasterVolume: (v) => set({ masterVolume: v }),
  setMonitorVolume: (v) => set({ monitorVolume: v }),
  setLoudnessStandard: (s) => set({ loudnessStandard: s })
}))
