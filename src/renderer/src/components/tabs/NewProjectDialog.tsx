import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Panel } from '../ui/Panel'

export interface NewProjectData {
  name: string
  type: 'mr' | 'static' | 'animation'
}

interface NewProjectDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (data: NewProjectData) => void
}

export function NewProjectDialog({ open, onClose, onCreate }: NewProjectDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'mr' | 'static' | 'animation'>('mr')

  if (!open) return null

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate({ name: name.trim(), type })
    setName('')
    onClose()
  }

  return (
    <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
      <Panel style={{ maxWidth:420, width:'100%', padding:24 }}>
        <h2 style={{ fontFamily:'var(--ho-font-family-title)', fontSize:18, color:'var(--ho-text-primary)', marginBottom:20, fontWeight:600 }}>新建项目</h2>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, color:'var(--ho-text-tertiary)', marginBottom:6 }}>项目名称</div>
          <Input placeholder="输入项目名称" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, color:'var(--ho-text-tertiary)', marginBottom:6 }}>项目类型</div>
          <div style={{ display:'flex', gap:8 }}>
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
                fontSize:12
              }}>{opt.label}</div>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <Button variant="default" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleCreate}>开始创建</Button>
        </div>
      </Panel>
    </div>
  )
}
