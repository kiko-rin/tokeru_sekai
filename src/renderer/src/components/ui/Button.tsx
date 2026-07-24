import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'icon'
  children: React.ReactNode
}

export function Button({ variant = 'default', children, style, ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    height: '32px',
    padding: '0 12px',
    fontSize: 'var(--ho-font-size-sm)',
    borderRadius: 'var(--ho-radius-sm)',
    transition: 'var(--ho-transition-normal)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap'
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: 'transparent',
      color: 'var(--ho-text-secondary)',
      border: '1px solid var(--ho-border-active)'
    },
    primary: {
      backgroundColor: 'var(--ho-accent)',
      color: '#0e1318',
      border: 'none',
      fontWeight: 500
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--ho-text-secondary)',
      border: 'none'
    },
    icon: {
      width: '30px',
      height: '30px',
      padding: 0,
      backgroundColor: 'transparent',
      color: 'var(--ho-text-secondary)',
      border: 'none'
    }
  }

  return (
    <button
      style={{ ...baseStyle, ...variantStyles[variant], ...style }}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--ho-accent-hover)'
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--ho-accent)'
        }
      }}
      onMouseDown={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--ho-accent-pressed)'
        }
      }}
      onMouseUp={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--ho-accent-hover)'
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}
