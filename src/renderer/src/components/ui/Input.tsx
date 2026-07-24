import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ style, ...props }: InputProps) {
  return (
    <input
      style={{
        height: '30px',
        padding: '0 10px',
        backgroundColor: 'var(--ho-bg-tertiary)',
        border: '1px solid var(--ho-border)',
        borderRadius: 'var(--ho-radius-sm)',
        fontSize: 'var(--ho-font-size-sm)',
        color: 'var(--ho-text-primary)',
        outline: 'none',
        transition: 'var(--ho-transition-normal)',
        ...style
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--ho-accent)'
        e.currentTarget.style.boxShadow = '0 0 0 2px var(--ho-accent-bg)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--ho-border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
      {...props}
    />
  )
}
