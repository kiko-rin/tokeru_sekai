import { useRef, useEffect, useCallback, useState } from 'react'
import { PointerHandler } from '../../../lib/input/PointerHandler'
import { BrushEngine } from '../../../lib/drawing/BrushEngine'
import { CanvasEngine } from '../../../lib/drawing/CanvasEngine'

interface DrawingCanvasProps {
  brushSize: number
  brushOpacity: number
  activeTool: string
  onStatusChange?: (status: { tool: string; zoom: number; x: number; y: number }) => void
}

export function DrawingCanvas({ brushSize, brushOpacity, activeTool, onStatusChange }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const brushRef = useRef<BrushEngine | null>(null)
  const pointerRef = useRef<PointerHandler | null>(null)
  const canvasEngineRef = useRef<CanvasEngine | null>(null)
  const [zoom, setZoom] = useState(100)
  const [isDrawing, setIsDrawing] = useState(false)
  const colorRef = useRef('#ffffff')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    brushRef.current = new BrushEngine(960, 540)
    canvasEngineRef.current = new CanvasEngine(canvas)

    const handler = new PointerHandler(canvas, {
      onDown: (state) => {
        setIsDrawing(true)
        const brush = brushRef.current!
        const engine = canvasEngineRef.current!
        const { x, y } = engine.screenToCanvas(state.x, state.y)
        brush.stamp(x, y, state.pressure, state.tiltX, state.tiltY, {
          size: brushSize, opacity: brushOpacity / 100, flow: 1, hardness: 0.8,
          spacing: 25, scatterX: 0, scatterY: 0, angle: 0, roundness: 1,
          pressureSize: true, pressureOpacity: false, tiltSize: false, tiltOpacity: false
        }, activeTool === '橡皮擦' ? '#1a1a1a' : '#ffffff')
        const bitmap = brush.getCanvas().transferToImageBitmap()
        engine.render(bitmap)
      },
      onMove: (state) => {
        if (!isDrawing) return
        const brush = brushRef.current!
        const engine = canvasEngineRef.current!
        const { x, y } = engine.screenToCanvas(state.x, state.y)
        brushRef.current?.line(
          state.x, state.y, x, y,
          state.pressure, state.tiltX, state.tiltY,
          { size: brushSize, opacity: brushOpacity / 100, flow: 1, hardness: 0.8,
            spacing: 25, scatterX: 0, scatterY: 0, angle: 0, roundness: 1,
            pressureSize: true, pressureOpacity: false, tiltSize: false, tiltOpacity: false },
          activeTool === '橡皮擦' ? '#1a1a1a' : '#ffffff'
        )
      },
      onUp: () => setIsDrawing(false),
      onLeave: () => setIsDrawing(false)
    })
    pointerRef.current = handler

    return () => {
      handler.destroy()
      canvasEngineRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    onStatusChange?.({ tool: activeTool, zoom, x: 0, y: 0 })
  }, [activeTool, zoom, onStatusChange])

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--ho-bg-primary)', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        style={{ maxWidth: '100%', maxHeight: '100%', backgroundColor: '#1a1a1a', borderRadius: '4px', cursor: 'crosshair', touchAction: 'none' }}
      />
    </div>
  )
}
