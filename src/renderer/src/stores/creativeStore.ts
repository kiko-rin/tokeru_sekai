import { create } from 'zustand'
import type { BrushParams } from '../lib/drawing/BrushEngine'

export type CreativeMode = 'drawing' | 'puppet'
export type ToolType = 'brush' | 'pencil' | 'airbrush' | 'eraser' | 'fill' | 'gradient' | 'blur' | 'sharpen' | 'rect-select' | 'move' | 'zoom' | 'eyedropper' | 'text' | 'shape' | 'pen' | 'crop'
export type BlendMode = 'normal' | 'dissolve' | 'darken' | 'multiply' | 'color-burn' | 'linear-burn' | 'darker' | 'lighten' | 'screen' | 'color-dodge' | 'linear-dodge' | 'lighter' | 'overlay' | 'soft-light' | 'hard-light' | 'vivid-light' | 'linear-light' | 'pin-light' | 'hard-mix' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity' | 'add' | 'subtract'

interface Layer {
  id: string
  name: string
  type: 'raster' | 'group' | 'adjustment'
  visible: boolean
  opacity: number
  blendMode: BlendMode
  locked: boolean
  thumbnailColor: string
}

interface LightMatchParams {
  enableAutoMatch: boolean
  sourceBrightness: number
  targetBrightness: number
  contrastRatio: number
  shadowDensity: number
  highlightRoll: number
}

interface CreativeState {
  mode: CreativeMode
  layers: Layer[]
  activeLayerId: string | null
  activeTool: ToolType
  brushParams: BrushParams
  mrEnabled: boolean
  lightMatch: LightMatchParams
  spineLoaded: boolean
  currentAnimation: string
  playbackSpeed: number
  isLooping: boolean
  zoom: number
  panX: number
  panY: number
  setMode: (mode: CreativeMode) => void
  setLayers: (layers: Layer[]) => void
  addLayer: (layer: Layer) => void
  removeLayer: (id: string) => void
  setActiveLayer: (id: string | null) => void
  setActiveTool: (tool: string) => void
  setBrushParams: (params: Partial<BrushParams>) => void
  setMrEnabled: (enabled: boolean) => void
  setLightMatch: (params: Partial<LightMatchParams>) => void
  setSpineLoaded: (loaded: boolean) => void
  setCurrentAnimation: (anim: string) => void
  setPlaybackSpeed: (speed: number) => void
  setIsLooping: (loop: boolean) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
}

const DEFAULT_BRUSH: BrushParams = {
  size: 12,
  opacity: 1,
  flow: 1,
  hardness: 0.8,
  spacing: 25,
  scatterX: 0,
  scatterY: 0,
  angle: 0,
  roundness: 1,
  pressureSize: true,
  pressureOpacity: false,
  tiltSize: false,
  tiltOpacity: false
}

export const useCreativeStore = create<CreativeState>((set) => ({
  mode: 'drawing',
  layers: [
    { id: 'layer_5', name: 'MR合成预览', type: 'raster', visible: true, opacity: 0.75, blendMode: 'normal', locked: false, thumbnailColor: '#555555' },
    { id: 'layer_4', name: '高光', type: 'raster', visible: true, opacity: 1, blendMode: 'normal', locked: false, thumbnailColor: '#4a4a4a' },
    { id: 'layer_3', name: '阴影', type: 'raster', visible: true, opacity: 0.6, blendMode: 'normal', locked: false, thumbnailColor: '#404040' },
    { id: 'layer_2', name: '底色', type: 'raster', visible: true, opacity: 1, blendMode: 'normal', locked: false, thumbnailColor: '#464646' },
    { id: 'layer_1', name: '线稿', type: 'raster', visible: true, opacity: 1, blendMode: 'normal', locked: false, thumbnailColor: '#505050' }
  ],
  activeLayerId: 'layer_1',
  activeTool: 'brush',
  brushParams: { ...DEFAULT_BRUSH },
  mrEnabled: false,
  lightMatch: {
    enableAutoMatch: true,
    sourceBrightness: 0.5,
    targetBrightness: 0.5,
    contrastRatio: 1,
    shadowDensity: 0.3,
    highlightRoll: 0.5
  },
  spineLoaded: false,
  currentAnimation: '',
  playbackSpeed: 1,
  isLooping: true,
  zoom: 100,
  panX: 0,
  panY: 0,
  setMode: (mode) => set({ mode }),
  setLayers: (layers) => set({ layers }),
  addLayer: (layer) => set((s) => ({ layers: [...s.layers, layer], activeLayerId: layer.id })),
  removeLayer: (id) => set((s) => ({
    layers: s.layers.filter((l) => l.id !== id),
    activeLayerId: s.activeLayerId === id ? (s.layers[s.layers.length - 2]?.id ?? null) : s.activeLayerId
  })),
  setActiveLayer: (id) => set({ activeLayerId: id }),
  setActiveTool: (tool) => set({ activeTool: tool as ToolType }),
  setBrushParams: (partial) => set((s) => ({ brushParams: { ...s.brushParams, ...partial } })),
  setMrEnabled: (enabled) => set({ mrEnabled: enabled }),
  setLightMatch: (partial) => set((s) => ({ lightMatch: { ...s.lightMatch, ...partial } })),
  setSpineLoaded: (loaded) => set({ spineLoaded: loaded }),
  setCurrentAnimation: (anim) => set({ currentAnimation: anim }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setIsLooping: (loop) => set({ isLooping: loop }),
  setZoom: (zoom) => set({ zoom }),
  setPan: (x, y) => set({ panX: x, panY: y })
}))
