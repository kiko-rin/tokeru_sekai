export type ShadowType = 'none' | 'hard' | 'soft' | 'ao'

export interface ShadowParams {
  type: ShadowType
  angle: number
  distance: number
  blur: number
  color: [number, number, number]
  opacity: number
  samples: number
}

export class ProjectionGen {
  generate(
    foreground: ImageData,
    background: ImageData,
    params: ShadowParams
  ): ImageData {
    const { width, height } = foreground
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(background, 0, 0)

    const shadowCanvas = new OffscreenCanvas(width, height)
    const sCtx = shadowCanvas.getContext('2d')!
    sCtx.putImageData(foreground, 0, 0)

    const rad = params.angle * Math.PI / 180
    const dx = Math.cos(rad) * params.distance
    const dy = Math.sin(rad) * params.distance

    if (params.type === 'hard') {
      ctx.globalAlpha = params.opacity
      ctx.fillStyle = `rgb(${params.color[0]*255},${params.color[1]*255},${params.color[2]*255})`
      ctx.drawImage(shadowCanvas, dx, dy)
    } else if (params.type === 'soft') {
      ctx.globalAlpha = params.opacity * 0.5
      for (let i = -params.samples; i <= params.samples; i++) {
        const spread = params.blur / params.samples
        ctx.drawImage(shadowCanvas, dx + i * spread, dy + i * spread * 0.5)
      }
    }

    ctx.globalAlpha = 1
    ctx.drawImage(shadowCanvas, 0, 0)

    return ctx.getImageData(0, 0, width, height)
  }
}
