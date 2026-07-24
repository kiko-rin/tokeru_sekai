import React from 'react'

interface TagProps {
  children: React.ReactNode
  color?: 'default' | 'accent' | 'safe' | 'warning'
  style?: React.CSSProperties
}

export function Tag({ children, color = 'default', style }: TagProps) {
  const colorMap: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      color: 'var(--ho-text-secondary)'
    },
    accent: {
      backgroundColor: 'var(--ho-accent-bg)',
      color: 'var(--ho-accent)'
    },
    safe: {
      backgroundColor: 'rgba(107, 158, 122, 0.12)',
      color: 'var(--ho-safe)'
    },
    warning: {
      backgroundColor: 'rgba(196, 168, 106, 0.12)',
      color: 'var(--ho-warning)'
    }
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: '20px',
      padding: '0 8px',
      borderRadius: '10px',
      fontSize: 'var(--ho-font-size-xs)',
      ...colorMap[color],
      ...style
    }}>
      {children}
    </span>
  )
}
