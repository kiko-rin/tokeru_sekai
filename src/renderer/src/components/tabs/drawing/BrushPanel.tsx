import { Slider } from '../../ui/Slider'

interface BrushPanelProps {
  brushSize: number
  brushOpacity: number
  onSizeChange: (v: number) => void
  onOpacityChange: (v: number) => void
}

const BRUSHES = ['圆形硬笔','圆形软笔','线性涂抹','橡皮擦','填充工具','吸管','模糊','锐化']

export function BrushPanel({ brushSize, brushOpacity, onSizeChange, onOpacityChange }: BrushPanelProps) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '6px', marginBottom: '16px' }}>
        {BRUSHES.map(b => (
          <div key={b} style={{ padding: '8px', border: '1px solid var(--ho-border)', borderRadius: 'var(--ho-radius-sm)', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '50%', margin: '0 auto 4px' }} />
            <div style={{ fontSize: '9px', color: 'var(--ho-text-secondary)' }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[
          { label: '大小', val: brushSize, min: 1, max: 500, setter: onSizeChange },
          { label: '硬度', val: 80, min: 0, max: 100 },
          { label: '不透明度', val: brushOpacity, min: 0, max: 100, setter: onOpacityChange },
          { label: '流量', val: 100, min: 0, max: 100 },
          { label: '间距', val: 25, min: 1, max: 100 },
          { label: '散布X', val: 0, min: 0, max: 100 },
          { label: '散布Y', val: 0, min: 0, max: 100 }
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '50px', fontSize: '9px', color: 'var(--ho-text-secondary)' }}>{item.label}</span>
            <input type="range" min={item.min} max={item.max} value={item.val} onChange={(e) => item.setter?.(Number(e.target.value))} style={{ flex: 1, height: '3px', accentColor: 'var(--ho-accent)' }} />
            <span style={{ width: '22px', fontSize: '8px', fontFamily: 'var(--ho-font-family-mono)', color: 'var(--ho-accent)', textAlign: 'right' }}>{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
