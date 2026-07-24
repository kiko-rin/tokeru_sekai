import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'

const TOOL_ICONS: Record<string, string> = {
  '画笔':'brush','铅笔':'pencil','喷枪':'brush','橡皮擦':'eraser',
  '填充':'fill','渐变':'gradient','模糊':'brush','锐化':'brush',
  '矩形选区':'pen','移动':'move','缩放':'zoom','吸管':'user',
  '文字':'text','形状':'pen','钢笔':'pen','裁剪':'cut'
}

import type { ToolType } from '../../../stores/creativeStore'

interface ToolBarProps {
  activeTool: string
  onToolChange: (tool: ToolType) => void
}

export function ToolBar({ activeTool, onToolChange }: ToolBarProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '4px', marginBottom: '16px' }}>
      {Object.keys(TOOL_ICONS).map((name) => (
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
          <Icon name={TOOL_ICONS[name] as any} size={14} color="var(--ho-text-secondary)" />
          <span style={{ fontSize: '8px', color: 'var(--ho-text-tertiary)' }}>{name === '画笔' ? 'b' : name === '橡皮擦' ? 'e' : name === '缩放' ? 'z' : '/'}</span>
        </button>
      ))}
    </div>
  )
}
