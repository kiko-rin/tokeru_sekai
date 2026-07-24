import { useState, useEffect, useCallback, useRef } from 'react'
import { useTabCollapse } from '../../hooks/useTabCollapse'

const TABS = [
  { id: 'outline', label: '大纲' },
  { id: 'quick-edit', label: '快编' },
  { id: 'editor', label: '剪辑台' },
  { id: 'creative', label: '创绘' },
  { id: 'color', label: '调色' },
  { id: 'audio', label: '调音' },
  { id: 'publish', label: '发布' }
]

interface TabBarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const { expanded, onMouseEnter, onMouseLeave, resetTimer } = useTabCollapse()
  const [dragY, setDragY] = useState(0)
  const isDragging = useRef(false)

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    setDragY(e.clientY)
  }, [])

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return
    const delta = dragY - e.clientY
    if (delta > 30) {
      resetTimer()
      isDragging.current = false
    }
  }, [dragY, resetTimer])

  const handleDragEnd = useCallback(() => {
    isDragging.current = false
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragEnd)
    return () => {
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('mouseup', handleDragEnd)
    }
  }, [handleDragMove, handleDragEnd])

  if (!expanded) {
    return (
      <div
        onMouseEnter={onMouseEnter}
        onClick={resetTimer}
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '48px',
          height: '20px',
          backgroundColor: 'var(--ho-bg-secondary)',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderTop: '1px solid var(--ho-border)',
          borderLeft: '1px solid var(--ho-border)',
          borderRight: '1px solid var(--ho-border)',
          transition: 'var(--ho-transition-normal)',
          zIndex: 100
        }}
      >
        <div style={{
          width: '20px',
          height: '2px',
          backgroundColor: 'var(--ho-text-tertiary)',
          borderRadius: '1px'
        }} />
      </div>
    )
  }

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={handleDragStart}
      style={{
        height: '44px',
        backgroundColor: 'var(--ho-bg-secondary)',
        borderTop: '1px solid var(--ho-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        flexShrink: 0,
        transition: 'var(--ho-transition-expand)'
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            height: '32px',
            padding: '0 16px',
            borderRadius: 'var(--ho-radius-sm)',
            fontSize: 'var(--ho-font-size-sm)',
            color: activeTab === tab.id ? 'var(--ho-text-primary)' : 'var(--ho-text-secondary)',
            backgroundColor: activeTab === tab.id ? 'var(--ho-accent-bg)' : 'transparent',
            transition: 'var(--ho-transition-normal)',
            position: 'relative'
          }}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '16px',
              height: '2px',
              backgroundColor: 'var(--ho-accent)',
              borderRadius: '1px'
            }} />
          )}
        </button>
      ))}
    </div>
  )
}
