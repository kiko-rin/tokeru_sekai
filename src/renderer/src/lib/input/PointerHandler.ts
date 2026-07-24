export interface PointerState {
  x: number
  y: number
  pressure: number
  tiltX: number
  tiltY: number
  azimuthAngle: number
  altitudeAngle: number
  pointerId: number
  button: number
  isDown: boolean
  isEraser: boolean
  inCanvas: boolean
}

export type PointerEventCallback = (state: PointerState, event: PointerEvent) => void

export interface PointerHandlerOptions {
  onDown?: PointerEventCallback
  onMove?: PointerEventCallback
  onUp?: PointerEventCallback
  onEnter?: PointerEventCallback
  onLeave?: PointerEventCallback
  pressureCurve?: (p: number) => number
}

export class PointerHandler {
  private canvas: HTMLElement
  private state: PointerState
  private options: PointerHandlerOptions
  private boundDown: (e: PointerEvent) => void
  private boundMove: (e: PointerEvent) => void
  private boundUp: (e: PointerEvent) => void
  private boundEnter: (e: PointerEvent) => void
  private boundLeave: (e: PointerEvent) => void

  constructor(canvas: HTMLElement, options?: PointerHandlerOptions) {
    this.canvas = canvas
    this.options = options || {}
    this.state = {
      x: 0, y: 0, pressure: 0, tiltX: 0, tiltY: 0,
      azimuthAngle: 0, altitudeAngle: 0, pointerId: 0,
      button: 0, isDown: false, isEraser: false, inCanvas: false
    }

    canvas.style.touchAction = 'none'

    this.boundDown = this.onPointerDown.bind(this)
    this.boundMove = this.onPointerMove.bind(this)
    this.boundUp = this.onPointerUp.bind(this)
    this.boundEnter = this.onPointerEnter.bind(this)
    this.boundLeave = this.onPointerLeave.bind(this)

    canvas.addEventListener('pointerdown', this.boundDown)
    canvas.addEventListener('pointermove', this.boundMove)
    canvas.addEventListener('pointerup', this.boundUp)
    canvas.addEventListener('pointerenter', this.boundEnter)
    canvas.addEventListener('pointerleave', this.boundLeave)
  }

  private updateState(e: PointerEvent): void {
    const curve = this.options.pressureCurve || ((p: number) => p)
    this.state = {
      x: e.offsetX,
      y: e.offsetY,
      pressure: curve(e.pressure),
      tiltX: e.tiltX,
      tiltY: e.tiltY,
      azimuthAngle: e.azimuthAngle,
      altitudeAngle: e.altitudeAngle,
      pointerId: e.pointerId,
      button: e.button,
      isDown: e.buttons > 0,
      isEraser: e.button === 5,
      inCanvas: true
    }
  }

  private onPointerDown(e: PointerEvent): void {
    this.canvas.setPointerCapture(e.pointerId)
    this.updateState(e)
    this.options.onDown?.(this.state, e)
  }

  private onPointerMove(e: PointerEvent): void {
    this.updateState(e)
    this.options.onMove?.(this.state, e)
  }

  private onPointerUp(e: PointerEvent): void {
    this.canvas.releasePointerCapture(e.pointerId)
    this.updateState(e)
    this.state.isDown = false
    this.options.onUp?.(this.state, e)
  }

  private onPointerEnter(e: PointerEvent): void {
    this.state.inCanvas = true
    this.options.onEnter?.(this.state, e)
  }

  private onPointerLeave(e: PointerEvent): void {
    this.state.inCanvas = false
    this.state.isDown = false
    this.options.onLeave?.(this.state, e)
  }

  setPressureCurve(curve: (p: number) => number): void {
    this.options.pressureCurve = curve
  }

  getState(): PointerState {
    return { ...this.state }
  }

  destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.boundDown)
    this.canvas.removeEventListener('pointermove', this.boundMove)
    this.canvas.removeEventListener('pointerup', this.boundUp)
    this.canvas.removeEventListener('pointerenter', this.boundEnter)
    this.canvas.removeEventListener('pointerleave', this.boundLeave)
  }
}
