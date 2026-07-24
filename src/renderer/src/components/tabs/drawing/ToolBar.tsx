import { Button } from '../../ui/Button'

const TOOLS = [
  ['画笔','b'],['铅笔','n'],['喷枪','a'],['橡皮擦','e'],
  ['填充','g'],['渐变','d'],['模糊','r'],['锐化','s'],
  ['矩形选区','m'],['移动','v'],['缩放','z'],['吸管','i'],
  ['文字','t'],['形状','u'],['钢笔','p'],['裁剪','c']
]

import type { ToolType } from '../../../stores/creativeStore'

interface ToolBarProps {
  activeTool: string
  onToolChange: (tool: ToolType) => void
}

export function ToolBar({ activeTool, onToolChange }: ToolBarProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '4px', marginBottom: '16px' }}>
      {TOOLS.map(([name]) => (
        <button
          key={name}
          onClick={() => onToolChange(name as any)}
          style={{
            height: '40px', borderRadius: 'var(--ho-radius-sm)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '2px',
            backgroundColor: activeTool === name ? 'var(--ho-accent-bg)' : 'rgba(255,255,255,0.02)',
            color: activeTool === name ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
            border: activeTool === name ? '1px solid var(--ho-accent)' : '1px solid var(--ho-border)',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '12px' }}>/</span>
          <span style={{ fontSize: '8px', color: 'var(--ho-text-tertiary)' }}>{name === '画笔' ? 'b' : name === '橡皮擦' ? 'e' : name === '缩放' ? 'z' : '/'}</span>
        </button>
      ))}
    </div>
  )
}
