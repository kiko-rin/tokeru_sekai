import { useEffect } from 'react'

interface ShortcutMap {
  [key: string]: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutMap): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
      if (isInput && e.key !== 'Escape' && e.key !== 'Enter') return

      const mod = e.ctrlKey || e.metaKey ? 'ctrl-' : ''
      const shift = e.shiftKey ? 'shift-' : ''
      const key = e.key === ' ' ? 'Space' : e.key
      const combo = `${mod}${shift}${key.toLowerCase()}`
      const handler = handlers[combo]

      if (handler) {
        e.preventDefault()
        e.stopPropagation()
        handler()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [handlers])
}
