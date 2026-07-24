export type BlendMode =
  | 'normal'
  | 'dissolve'
  | 'darken'
  | 'multiply'
  | 'color-burn'
  | 'linear-burn'
  | 'lighten'
  | 'screen'
  | 'color-dodge'
  | 'linear-dodge'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'vivid-light'
  | 'linear-light'
  | 'pin-light'
  | 'hard-mix'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'
  | 'add'
  | 'subtract'

export const BLEND_MODE_MAP: Record<BlendMode, GlobalCompositeOperation> = {
  normal: 'source-over',
  dissolve: 'source-over',
  darken: 'darken',
  multiply: 'multiply',
  'color-burn': 'color-burn',
  'linear-burn': 'color-burn',
  lighten: 'lighten',
  screen: 'screen',
  'color-dodge': 'color-dodge',
  'linear-dodge': 'lighter',
  overlay: 'overlay',
  'soft-light': 'soft-light',
  'hard-light': 'hard-light',
  'vivid-light': 'hard-light',
  'linear-light': 'hard-light',
  'pin-light': 'hard-light',
  'hard-mix': 'hard-light',
  difference: 'difference',
  exclusion: 'exclusion',
  hue: 'hue',
  saturation: 'saturation',
  color: 'color',
  luminosity: 'luminosity',
  add: 'lighter',
  subtract: 'difference',
}

export interface DrawingLayer {
  id: string
  name: string
  canvas: OffscreenCanvas
  ctx: OffscreenCanvasRenderingContext2D
  visible: boolean
  opacity: number
  blendMode: BlendMode
  locked: boolean
}

export class LayerManager {
  private layers: DrawingLayer[] = []
  private width: number
  private height: number
  private composeCanvas: OffscreenCanvas
  private composeCtx: OffscreenCanvasRenderingContext2D

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.composeCanvas = new OffscreenCanvas(width, height)
    this.composeCtx = this.composeCanvas.getContext('2d')!
  }

  addLayer(name: string): DrawingLayer {
    const canvas = new OffscreenCanvas(this.width, this.height)
    const ctx = canvas.getContext('2d')!
    const layer: DrawingLayer = {
      id: `layer_${Date.now()}`,
      name,
      canvas,
      ctx,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      locked: false,
    }
    this.layers.push(layer)
    return layer
  }

  removeLayer(id: string): void {
    this.layers = this.layers.filter((l) => l.id !== id)
  }

  getLayer(id: string): DrawingLayer | undefined {
    return this.layers.find((l) => l.id === id)
  }

  getLayers(): DrawingLayer[] {
    return [...this.layers]
  }

  moveLayer(id: string, newIndex: number): void {
    const idx = this.layers.findIndex((l) => l.id === id)
    if (idx < 0) return
    const layer = this.layers[idx]
    this.layers.splice(idx, 1)
    this.layers.splice(Math.min(newIndex, this.layers.length), 0, layer)
  }

  compose(): ImageBitmap {
    const ctx = this.composeCtx
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.globalCompositeOperation = 'source-over'

    for (const layer of this.layers) {
      if (!layer.visible) continue
      ctx.globalAlpha = layer.opacity
      const op = BLEND_MODE_MAP[layer.blendMode] || 'source-over'
      ctx.globalCompositeOperation = op
      ctx.drawImage(layer.canvas, 0, 0)
    }

    return this.composeCanvas.transferToImageBitmap()
  }

  resize(width: number, height: number): void {
    this.width = width
    this.height = height
    this.composeCanvas.width = width
    this.composeCanvas.height = height
    for (const layer of this.layers) {
      layer.canvas.width = width
      layer.canvas.height = height
    }
  }
}
