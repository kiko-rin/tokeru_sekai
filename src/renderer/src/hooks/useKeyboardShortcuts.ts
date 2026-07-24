import { useEffect } from 'react'

interface ShortcutMap {
  [key: string]: () => void
}

const SHORTCUTS: Record<string, string> = {
  's': 'save', 'z': 'undo', 'shift-z': 'redo',
  'delete': 'delete', 'backspace': 'delete',
  'I': 'mark-in', 'O': 'mark-out',
  ' ': 'play-pause', 'ArrowLeft': 'prev-frame', 'ArrowRight': 'next-frame',
  'Home': 'go-start', 'End': 'go-end',
  'b': 'tool-brush', 'e': 'tool-eraser', 'v': 'tool-move',
  'p': 'tool-pen', 'm': 'tool-select', 't': 'tool-text',
  'n': 'tool-pencil', 'a': 'tool-picker',
  'N': 'toggle-snap'
}

export function useKeyboardShortcuts(handlers: ShortcutMap): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement
      if (isInput && e.key !== 'Escape' && e.key !== 'Enter') return

      const key = e.shiftKey ? `shift-${e.key.toLowerCase()}` : e.ctrlKey ? `ctrl-${e.key.toLowerCase()}` : e.key
      const handler = handlers[key]

      if (handler) {
        e.preventDefault()
        handler()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
