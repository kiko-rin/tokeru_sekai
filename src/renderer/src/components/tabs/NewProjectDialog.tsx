import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Panel } from '../ui/Panel'

export interface NewProjectData {
  name: string
  type: 'mr' | 'static' | 'animation'
  resolution: string
  fps: number
  backgroundColor: string
  description: string
}

interface NewProjectDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (data: NewProjectData) => void
}

export function NewProjectDialog({ open, onClose, onCreate }: NewProjectDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'mr' | 'static' | 'animation'>('mr')
  const [resolution, setResolution] = useState('1920x1080')
  const [fps, setFps] = useState(30)
  const [bgColor, setBgColor] = useState('#141414')
  const [description, setDescription] = useState('')

  if (!open) return null

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate({ name: name.trim(), type, resolution, fps, backgroundColor: bgColor, description })
    setName(''); setDescription(''); onClose()
  }

  return (
    <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
      <Panel style={{ maxWidth:'480px', width:'100%', padding:'24px' }}>
        <h2 style={{ fontFamily:'var(--ho-font-family-title)', fontSize:'18px', color:'var(--ho-text-primary)', marginBottom:'20px', fontWeight:600 }}>新建项目</h2>

        <div style={{ marginBottom:'16px' }}>
          <div style={{ fontSize:'12px', color:'var(--ho-text-tertiary)', marginBottom:'6px' }}>项目名称</div>
          <Input placeholder="输入项目名称" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div style={{ marginBottom:'16px' }}>
          <div style={{ fontSize:'12px', color:'var(--ho-text-tertiary)', marginBottom:'6px' }}>项目类型</div>
          <div style={{ display:'flex', gap:'8px' }}>
            {[
              { label:'MR混合媒体', value:'mr' as const },
              { label:'静态图像', value:'static' as const },
              { label:'动画', value:'animation' as const }
            ].map(opt => (
              <div key={opt.value} onClick={() => setType(opt.value)} style={{
                flex:1, padding:'10px 8px', borderRadius:'var(--ho-radius-sm)', cursor:'pointer', textAlign:'center',
                border: type === opt.value ? '1px solid var(--ho-accent)' : '1px solid var(--ho-border)',
                backgroundColor: type === opt.value ? 'var(--ho-accent-bg)' : 'transparent',
                color: type === opt.value ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
                fontSize:'12px'
              }}>{opt.label}</div>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
          <div>
            <div style={{ fontSize:'12px', color:'var(--ho-text-tertiary)', marginBottom:'6px' }}>分辨率</div>
            <select value={resolution} onChange={e => setResolution(e.target.value)} style={{ width:'100%', height:'30px', backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:'var(--ho-radius-sm)', color:'var(--ho-text-secondary)', fontSize:'12px', padding:'0 8px', outline:'none' }}>
              <option>1920x1080</option><option>3840x2160</option><option>自定义</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize:'12px', color:'var(--ho-text-tertiary)', marginBottom:'6px' }}>帧率</div>
            <select value={fps} onChange={e => setFps(Number(e.target.value))} style={{ width:'100%', height:'30px', backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:'var(--ho-radius-sm)', color:'var(--ho-text-secondary)', fontSize:'12px', padding:'0 8px', outline:'none' }}>
              <option value={24}>24</option><option value={25}>25</option><option value={30}>30</option><option value={60}>60</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom:'16px' }}>
          <div style={{ fontSize:'12px', color:'var(--ho-text-tertiary)', marginBottom:'6px' }}>背景色</div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width:'32px', height:'32px', padding:0, border:'none', borderRadius:'4px', cursor:'pointer' }} />
            <Input value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width:'120px' }} />
          </div>
        </div>

        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'12px', color:'var(--ho-text-tertiary)', marginBottom:'6px' }}>描述</div>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ width:'100%', backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:'var(--ho-radius-sm)', color:'var(--ho-text-primary)', fontSize:'12px', padding:'8px', outline:'none', resize:'vertical' }} />
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:'8px' }}>
          <Button variant="default" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleCreate}>创建</Button>
        </div>
      </Panel>
    </div>
  )
}
