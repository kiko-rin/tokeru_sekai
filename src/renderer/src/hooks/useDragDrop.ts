import { useCallback, useRef } from 'react'

export function useDragDrop() {
  const dragDataRef = useRef<Record<string,unknown> | null>(null)

  const onDragStart = useCallback((data: Record<string,unknown>) => (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(data))
    e.dataTransfer.effectAllowed = 'copy'
    dragDataRef.current = data
  }, [])

  const onDrop = useCallback((handler: (data: Record<string,unknown>) => void) => (e: React.DragEvent) => {
    e.preventDefault()
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      handler(data)
    } catch {}
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  return { onDragStart, onDrop, onDragOver }
}
