import React, { useCallback } from 'react'

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  style?: React.CSSProperties
}

export function Slider({ value, min, max, step = 0.01, onChange, style }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }, [onChange])

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      ...style
    }}>
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '2px'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: 'var(--ho-accent)',
          borderRadius: '2px'
        }} />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
          margin: 0
        }}
      />
      <div style={{
        position: 'absolute',
        left: `calc(${percentage}% - 10px)`,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        pointerEvents: 'none',
        transition: 'transform 0.1s ease'
      }} />
    </div>
  )
}
