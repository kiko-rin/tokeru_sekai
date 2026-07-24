import React from 'react'

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Panel({ children, style, ...props }: PanelProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--ho-bg-secondary)',
        border: '1px solid var(--ho-border)',
        borderRadius: 'var(--ho-radius-md)',
        padding: '12px',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  )
}
