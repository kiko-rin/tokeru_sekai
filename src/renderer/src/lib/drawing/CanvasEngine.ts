export class CanvasEngine {
  private displayCanvas: HTMLCanvasElement
  private displayCtx: CanvasRenderingContext2D
  private zoom: number = 100
  private panX: number = 0
  private panY: number = 0

  constructor(canvas: HTMLCanvasElement) {
    this.displayCanvas = canvas
    this.displayCtx = canvas.getContext('2d')!
  }

  setZoom(zoom: number): void {
    this.zoom = Math.max(10, Math.min(400, zoom))
  }

  getZoom(): number {
    return this.zoom
  }

  setPan(x: number, y: number): void {
    this.panX = x
    this.panY = y
  }

  getPan(): { x: number; y: number } {
    return { x: this.panX, y: this.panY }
  }

  render(source: ImageBitmap | HTMLCanvasElement | OffscreenCanvas): void {
    const ctx = this.displayCtx
    ctx.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height)
    ctx.save()
    ctx.translate(this.panX, this.panY)
    ctx.scale(this.zoom / 100, this.zoom / 100)
    ctx.drawImage(source, 0, 0)
    ctx.restore()
  }

  screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.panX) / (this.zoom / 100),
      y: (screenY - this.panY) / (this.zoom / 100),
    }
  }

  canvasToScreen(canvasX: number, canvasY: number): { x: number; y: number } {
    return {
      x: canvasX * (this.zoom / 100) + this.panX,
      y: canvasY * (this.zoom / 100) + this.panY,
    }
  }

  resize(width: number, height: number): void {
    this.displayCanvas.width = width
    this.displayCanvas.height = height
  }

  destroy(): void {
    this.displayCtx.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height)
  }
}
