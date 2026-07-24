export interface BrushParams {
  size: number
  opacity: number
  flow: number
  hardness: number
  spacing: number
  scatterX: number
  scatterY: number
  angle: number
  roundness: number
  pressureSize: boolean
  pressureOpacity: boolean
  tiltSize: boolean
  tiltOpacity: boolean
}

export class BrushEngine {
  private canvas: OffscreenCanvas
  private ctx: OffscreenCanvasRenderingContext2D

  constructor(width: number, height: number) {
    this.canvas = new OffscreenCanvas(width, height)
    this.ctx = this.canvas.getContext('2d')!
  }

  resize(width: number, height: number): void {
    this.canvas.width = width
    this.canvas.height = height
  }

  getCanvas(): OffscreenCanvas {
    return this.canvas
  }

  getContext(): OffscreenCanvasRenderingContext2D {
    return this.ctx
  }

  stamp(x: number, y: number, pressure: number, tiltX: number, tiltY: number, params: BrushParams, color: string): void {
    const size = params.pressureSize ? params.size * pressure : params.size
    const opacity = params.pressureOpacity ? params.opacity * pressure : params.opacity
    const half = size / 2
    const r = Math.max(1, half)

    this.ctx.save()
    this.ctx.globalAlpha = opacity * params.flow
    this.ctx.globalCompositeOperation = 'source-over'

    if (params.hardness >= 1) {
      this.ctx.fillStyle = color
      this.ctx.beginPath()
      this.ctx.arc(x, y, r, 0, Math.PI * 2)
      this.ctx.fill()
    } else {
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, r)
      gradient.addColorStop(0, color)
      gradient.addColorStop(params.hardness, color)
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      this.ctx.fillStyle = gradient
      this.ctx.beginPath()
      this.ctx.arc(x, y, r, 0, Math.PI * 2)
      this.ctx.fill()
    }

    this.ctx.restore()
  }

  line(x0: number, y0: number, x1: number, y1: number, pressure: number, tiltX: number, tiltY: number, params: BrushParams, color: string): void {
    const dx = x1 - x0
    const dy = y1 - y0
    const dist = Math.sqrt(dx * dx + dy * dy)
    const step = Math.max(1, params.spacing / 100 * params.size * 0.5)
    const steps = Math.max(1, Math.floor(dist / step))

    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const px = x0 + dx * t
      const py = y0 + dy * t
      const scatter = params.size * 0.3
      const sx = px + (Math.random() - 0.5) * params.scatterX / 100 * scatter
      const sy = py + (Math.random() - 0.5) * params.scatterY / 100 * scatter
      this.stamp(sx, sy, pressure, tiltX, tiltY, params, color)
    }
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
