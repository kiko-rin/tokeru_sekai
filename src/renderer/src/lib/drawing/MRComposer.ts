export interface LightDirection {
  azimuth: number
  elevation: number
  intensity: number
  colorTemp: number
}

export class MRComposer {
  compose(
    background: ImageData,
    foreground: ImageData,
    blendMode: string,
    opacity: number,
    lightDirection?: LightDirection
  ): ImageData {
    const canvas = new OffscreenCanvas(background.width, background.height)
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(background, 0, 0)
    ctx.globalCompositeOperation = this.mapBlendMode(blendMode)
    ctx.globalAlpha = opacity

    const fgCanvas = new OffscreenCanvas(foreground.width, foreground.height)
    const fgCtx = fgCanvas.getContext('2d')!
    fgCtx.putImageData(foreground, 0, 0)
    ctx.drawImage(fgCanvas, 0, 0)

    return ctx.getImageData(0, 0, canvas.width, canvas.height)
  }

  private mapBlendMode(mode: string): GlobalCompositeOperation {
    const map: Record<string, GlobalCompositeOperation> = {
      normal: 'source-over',
      multiply: 'multiply',
      screen: 'screen',
      overlay: 'overlay',
      darken: 'darken',
      lighten: 'lighten',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'soft-light': 'soft-light',
      'hard-light': 'hard-light',
      difference: 'difference',
      exclusion: 'exclusion',
    }
    return map[mode] || 'source-over'
  }
}
