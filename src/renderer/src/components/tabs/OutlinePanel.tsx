import { useState } from 'react'
import { Button } from '../ui/Button'
import { Panel } from '../ui/Panel'
import { Input } from '../ui/Input'
import { Icon } from '../ui/Icon'

interface Scene {
  id: string
  name: string
  expanded: boolean
  shots: { id: string; name: string }[]
}

const MOCK_SCENES: Scene[] = [
  { id: 's1', name: '开场', expanded: true, shots: [{ id: 'sh1', name: '镜头1.1' }, { id: 'sh2', name: '镜头1.2' }, { id: 'sh3', name: '镜头1.3' }] },
  { id: 's2', name: '主体展示', expanded: false, shots: [{ id: 'sh4', name: '镜头2.1' }] },
  { id: 's3', name: '结尾', expanded: false, shots: [] }
]

const MOCK_MATERIALS = [
  { name: '城市航拍.mp4', duration: '00:15' },
  { name: '日落延时.mp4', duration: '00:08' },
  { name: '公园全景.mp4', duration: '00:12' },
  { name: '夜景灯光.mp4', duration: '00:20' },
  { name: '街道人流.mp4', duration: '00:10' },
  { name: 'Logo.png', duration: '-' },
  { name: '音效01.wav', duration: '00:03' },
  { name: '转场特效.mp4', duration: '00:05' }
]

export function OutlinePanel() {
  const [scenes, setScenes] = useState(MOCK_SCENES)
  const [selectedShot, setSelectedShot] = useState('sh1')
  const [scriptText, setScriptText] = useState('城市黄昏全景，镜头从高空缓缓下降，穿过云层，城市灯火逐渐清晰。')
  const [materialTab, setMaterialTab] = useState('视频')
  const [materialSearch, setMaterialSearch] = useState('')

  const toggleScene = (id: string) => {
    setScenes(scenes.map((s) => s.id === id ? { ...s, expanded: !s.expanded } : s))
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: '240px', borderRight: '1px solid var(--ho-border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '12px', fontSize: 'var(--ho-font-size-md)', fontFamily: 'var(--ho-font-family-title)', color: 'var(--ho-text-primary)', borderBottom: '1px solid var(--ho-border)' }}>项目大纲</div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {scenes.map((scene) => (
            <div key={scene.id}>
              <div
                onClick={() => toggleScene(scene.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 16px', cursor: 'pointer', fontSize: 'var(--ho-font-size-sm)', color: 'var(--ho-text-secondary)' }}
              >
                <Icon name="chevron-right" size={12} color="var(--ho-text-secondary)" style={{ transition: 'var(--ho-transition-fast)', transform: scene.expanded ? 'rotate(90deg)' : '' }} />
                <span>{scene.name}</span>
              </div>
              {scene.expanded && scene.shots.map((shot) => (
                <div
                  key={shot.id}
                  onClick={() => setSelectedShot(shot.id)}
                  style={{
                    padding: '6px 16px 6px 36px', cursor: 'pointer', fontSize: 'var(--ho-font-size-sm)',
                    color: selectedShot === shot.id ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
                    backgroundColor: selectedShot === shot.id ? 'var(--ho-accent-bg)' : 'transparent'
                  }}
                >
                  {shot.name}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid var(--ho-border)', display: 'flex', gap: '8px' }}>
          <Button variant="ghost"><Icon name="plus" size={12} /> 添加场景</Button>
          <Button variant="ghost"><Icon name="plus" size={12} /> 添加镜头</Button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--ho-border)', fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-secondary)', display: 'flex', gap: '16px', flexShrink: 0 }}>
          <span>镜头1.1 - 开场</span>
          <span>时长: 00:05:00</span>
          <span>1920 x 1080</span>
        </div>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setScriptText(e.currentTarget.textContent || '')}
          style={{ flex: 1, padding: '16px', fontSize: 'var(--ho-font-size-md)', color: 'var(--ho-text-primary)', lineHeight: 1.8, outline: 'none', overflow: 'auto' }}
          dangerouslySetInnerHTML={{ __html: `<p>${scriptText}</p><p><strong>[旁白]</strong> 在这座城市里，每个人都有自己的故事...</p><p><em>（镜头缓慢推进，光线逐渐变化）</em></p><p style="background:rgba(122,158,196,0.08);padding:4px 8px;border-radius:6px;font-size:12px">运动：垂直下降 + 缓慢推进</p>` }}
        />
        <div style={{ height: '36px', borderTop: '1px solid var(--ho-border)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '4px', flexShrink: 0 }}>
          <Button variant="icon" style={{ fontWeight: 700 }}>B</Button>
          <Button variant="icon" style={{ fontStyle: 'italic' }}>I</Button>
          <Button variant="icon" style={{ textDecoration: 'underline' }}>U</Button>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--ho-border)', margin: '0 8px' }} />
          <select style={{ backgroundColor: 'var(--ho-bg-tertiary)', border: '1px solid var(--ho-border)', borderRadius: 'var(--ho-radius-sm)', color: 'var(--ho-text-secondary)', fontSize: 'var(--ho-font-size-xs)', padding: '2px 8px', height: '24px', outline: 'none' }}>
            <option>场景描述</option>
            <option>对白</option>
            <option>动作指示</option>
            <option>镜头指示</option>
          </select>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-tertiary)' }}>字数: 128</span>
        </div>
      </div>

      <div style={{ width: '280px', borderLeft: '1px solid var(--ho-border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--ho-border)' }}>
          {['视频', '图片', '音频', '特效'].map((tab) => (
            <button
              key={tab}
              onClick={() => setMaterialTab(tab)}
              style={{
                flex: 1, height: '32px', fontSize: 'var(--ho-font-size-xs)',
                color: materialTab === tab ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
                backgroundColor: materialTab === tab ? 'var(--ho-accent-bg)' : 'transparent',
                borderBottom: materialTab === tab ? '2px solid var(--ho-accent)' : '2px solid transparent'
              }}
            >{tab}</button>
          ))}
        </div>
        <div style={{ padding: '8px' }}>
          <Input placeholder="搜索素材..." value={materialSearch} onChange={(e) => setMaterialSearch(e.target.value)} />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignContent: 'start' }}>
          {MOCK_MATERIALS.filter((m) => m.name.includes(materialSearch)).map((m) => (
            <div key={m.name} style={{ cursor: 'pointer' }}>
              <div style={{ aspectRatio: '16/9', backgroundColor: '#222', borderRadius: 'var(--ho-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-tertiary)' }}>{m.duration}</span>
              </div>
              <div style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid var(--ho-border)' }}>
          <Button variant="default" style={{ width: '100%' }}><Icon name="plus" size={12} /> 导入素材</Button>
        </div>
      </div>
    </div>
  )
}
