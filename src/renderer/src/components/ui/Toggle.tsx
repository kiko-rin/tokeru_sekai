import React from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: '40px',
        height: '22px',
        borderRadius: '11px',
        backgroundColor: checked ? 'var(--ho-accent)' : 'var(--ho-bg-tertiary)',
        border: checked ? 'none' : '1px solid var(--ho-border)',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'var(--ho-transition-normal)',
        flexShrink: 0
      }}
    >
      <div style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: checked ? '#ffffff' : 'var(--ho-text-tertiary)',
        position: 'absolute',
        top: '3px',
        left: checked ? '21px' : '3px',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }} />
    </button>
  )
}
