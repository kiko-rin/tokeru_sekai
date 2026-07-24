import { create } from 'zustand'
import type { Track, Clip } from '@shared/types'

interface TimelineState {
  tracks: Track[]
  currentTime: number
  inPoint: number
  outPoint: number
  zoom: number
  playing: boolean
  selectedClipId: string | null
  setTracks: (tracks: Track[]) => void
  addTrack: (track: Track) => void
  removeTrack: (id: string) => void
  setCurrentTime: (time: number) => void
  setPlaying: (playing: boolean) => void
  setZoom: (zoom: number) => void
  selectClip: (id: string | null) => void
  addClip: (trackId: string, clip: Clip) => void
  removeClip: (clipId: string) => void
}

export const useTimelineStore = create<TimelineState>((set) => ({
  tracks: [],
  currentTime: 0,
  inPoint: 0,
  outPoint: 0,
  zoom: 1,
  playing: false,
  selectedClipId: null,
  setTracks: (tracks) => set({ tracks }),
  addTrack: (track) => set((s) => ({ tracks: [...s.tracks, track] })),
  removeTrack: (id) => set((s) => ({ tracks: s.tracks.filter((t) => t.id !== id) })),
  setCurrentTime: (time) => set({ currentTime: time }),
  setPlaying: (playing) => set({ playing }),
  setZoom: (zoom) => set({ zoom }),
  selectClip: (id) => set({ selectedClipId: id }),
  addClip: (trackId, clip) => set((s) => ({
    tracks: s.tracks.map((t) => t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t)
  })),
  removeClip: (clipId) => set((s) => ({
    tracks: s.tracks.map((t) => ({ ...t, clips: t.clips.filter((c) => c.id !== clipId) }))
  }))
}))
