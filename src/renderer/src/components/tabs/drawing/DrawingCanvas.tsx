import { useRef, useEffect, useState, useCallback } from 'react'
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
  const handlerRef = useRef<PointerHandler | null>(null)
  const engineRef = useRef<CanvasEngine | null>(null)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const drawingRef = useRef(false)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    brushRef.current = new BrushEngine(960, 540)
    engineRef.current = new CanvasEngine(canvas)

    const handler = new PointerHandler(canvas, {
      onDown: (state) => {
        drawingRef.current = true
        const brush = brushRef.current!
        const engine = engineRef.current!
        const pt = engine.screenToCanvas(state.x, state.y)
        lastPointRef.current = pt
        const color = activeTool === '橡皮擦' ? '#1a1a1a' : '#ffffff'
        brush.stamp(pt.x, pt.y, state.pressure, state.tiltX, state.tiltY, {
          size: brushSize, opacity: brushOpacity / 100, flow: 1, hardness: 0.8,
          spacing: 25, scatterX: 0, scatterY: 0, angle: 0, roundness: 1,
          pressureSize: true, pressureOpacity: false, tiltSize: false, tiltOpacity: false
        }, color)
        const bitmap = brush.getCanvas().transferToImageBitmap()
        engine.render(bitmap)
      },
      onMove: (state) => {
        setCursorPos({ x: state.x, y: state.y })
        if (!drawingRef.current) return
        const brush = brushRef.current!
        const engine = engineRef.current!
        const pt = engine.screenToCanvas(state.x, state.y)
        const prev = lastPointRef.current
        if (prev) {
          const color = activeTool === '橡皮擦' ? '#1a1a1a' : '#ffffff'
          brush.line(prev.x, prev.y, pt.x, pt.y, state.pressure, state.tiltX, state.tiltY, {
            size: brushSize, opacity: brushOpacity / 100, flow: 1, hardness: 0.8,
            spacing: 25, scatterX: 0, scatterY: 0, angle: 0, roundness: 1,
            pressureSize: true, pressureOpacity: false, tiltSize: false, tiltOpacity: false
          }, color)
          const bitmap = brush.getCanvas().transferToImageBitmap()
          engine.render(bitmap)
        }
        lastPointRef.current = pt
      },
      onUp: () => {
        drawingRef.current = false
        lastPointRef.current = null
      },
      onLeave: () => {
        drawingRef.current = false
        lastPointRef.current = null
      }
    })
    handlerRef.current = handler

    return () => {
      handler.destroy()
      engineRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    onStatusChange?.({ tool: activeTool, zoom, x: cursorPos.x, y: cursorPos.y })
  }, [activeTool, zoom, cursorPos, onStatusChange])

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
