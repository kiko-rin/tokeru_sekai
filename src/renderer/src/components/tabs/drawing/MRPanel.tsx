import { useState } from 'react'
import { Button } from '../../ui/Button'
import { Toggle } from '../../ui/Toggle'
import { Slider } from '../../ui/Slider'

export function MRPanel() {
  const [lightMode, setLightMode] = useState('auto')
  const [colorMode, setColorMode] = useState('temp')
  const [perspectiveMode, setPerspectiveMode] = useState('2d')

  return (
    <div>
      <div style={{ fontSize: '9px', color: 'var(--ho-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>合成模式</div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '8px', color: 'var(--ho-text-tertiary)', marginBottom: '4px' }}>光影</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['自动匹配','手动调节'].map((opt) => (
            <div key={opt} onClick={() => setLightMode(opt)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 'var(--ho-radius-sm)', cursor: 'pointer', textAlign: 'center',
              border: lightMode===opt ? '1px solid var(--ho-accent)' : '1px solid var(--ho-border)',
              backgroundColor: lightMode===opt ? 'var(--ho-accent-bg)' : 'transparent'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--ho-text-secondary)', marginBottom: '2px' }}>/</div>
              <div style={{ fontSize: '9px', color: 'var(--ho-text-secondary)' }}>{opt}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '8px', color: 'var(--ho-text-tertiary)', marginBottom: '4px' }}>色彩</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['色温融合','色调映射'].map((opt) => (
            <div key={opt} onClick={() => setColorMode(opt)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 'var(--ho-radius-sm)', cursor: 'pointer', textAlign: 'center',
              border: colorMode===opt ? '1px solid var(--ho-accent)' : '1px solid var(--ho-border)',
              backgroundColor: colorMode===opt ? 'var(--ho-accent-bg)' : 'transparent'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--ho-text-secondary)', marginBottom: '2px' }}>/</div>
              <div style={{ fontSize: '9px', color: 'var(--ho-text-secondary)' }}>{opt}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '8px', color: 'var(--ho-text-tertiary)', marginBottom: '4px' }}>透视</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['2D匹配','深度匹配'].map((opt) => (
            <div key={opt} onClick={() => setPerspectiveMode(opt)} style={{
              flex: 1, padding: '8px 4px', borderRadius: 'var(--ho-radius-sm)', cursor: 'pointer', textAlign: 'center',
              border: perspectiveMode===opt ? '1px solid var(--ho-accent)' : '1px solid var(--ho-border)',
              backgroundColor: perspectiveMode===opt ? 'var(--ho-accent-bg)' : 'transparent'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--ho-text-secondary)', marginBottom: '2px' }}>/</div>
              <div style={{ fontSize: '9px', color: 'var(--ho-text-secondary)' }}>{opt}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '9px', color: 'var(--ho-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>AI辅助</div>
        {['AI深度估计','AI语义分割','AI光照估计'].map((ai) => (
          <div key={ai} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'4px' }}>
            <span style={{ fontSize:'9px',color:'var(--ho-text-secondary)' }}>{ai}</span>
            <Toggle checked={false} onChange={()=>{}} />
          </div>
        ))}
      </div>

      <div style={{ height:'60px',backgroundColor:'var(--ho-bg-tertiary)',borderRadius:'var(--ho-radius-sm)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'12px' }}>
        <span style={{ fontSize:'9px',color:'var(--ho-text-tertiary)' }}>MR合成效果预览</span>
      </div>

      <Button variant="primary" style={{ width:'100%' }}>应用合成</Button>
      <Button variant="ghost" style={{ width:'100%',marginTop:'4px' }}>重置参数</Button>
    </div>
  )
}
