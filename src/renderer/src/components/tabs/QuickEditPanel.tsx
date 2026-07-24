import { useState, useCallback, useMemo } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Slider } from '../ui/Slider'
import { Icon } from '../ui/Icon'
import { useDragDrop } from '../../hooks/useDragDrop'
import { useDITImport } from '../../hooks/useDITImport'

interface StoryboardItem {
  id: number
  name: string
  materialIndex: number
}

const MOCK_MATERIALS = [
  { name: '城市航拍.mp4', duration: '00:15', thumb: '#' },
  { name: '日落延时.mp4', duration: '00:08', thumb: '#' },
  { name: '公园全景.mp4', duration: '00:12', thumb: '#' },
  { name: '夜景灯光.mp4', duration: '00:20', thumb: '#' },
  { name: '街道人流.mp4', duration: '00:10', thumb: '#' },
  { name: '河流水面.mp4', duration: '00:06', thumb: '#' }
]

const TRANSITIONS = [
  { name: '溶解', symbol: '*' },
  { name: '擦除', symbol: '<>' },
  { name: '推拉', symbol: '<>' },
  { name: '缩放', symbol: '[+]' },
  { name: '翻转', symbol: '()' },
  { name: '百叶窗', symbol: '=' }
]

export function QuickEditPanel() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('全部')
  const [selectedTrans, setSelectedTrans] = useState('')
  const [durationPerClip, setDurationPerClip] = useState(5)
  const [speed, setSpeed] = useState(100)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [storyboardItems, setStoryboardItems] = useState<StoryboardItem[]>([
    { id: 0, name: '城市航拍.mp4', materialIndex: 0 },
    { id: 1, name: '日落延时.mp4', materialIndex: 1 },
    { id: 2, name: '公园全景.mp4', materialIndex: 2 },
    { id: 3, name: '夜景灯光.mp4', materialIndex: 3 },
  ])

  const { onDragStart, onDrop, onDragOver } = useDragDrop()
  const { importMedia, ImportDialog } = useDITImport()

  const nextId = useMemo(() => Math.max(0, ...storyboardItems.map(i => i.id)) + 1, [storyboardItems])

  const filteredMaterials = MOCK_MATERIALS.filter(m =>
    m.name.includes(search)
  )

  const handleDropOnStoryboard = useCallback((data: Record<string, unknown>) => {
    const name = data.name as string || '素材'
    const idx = MOCK_MATERIALS.findIndex(m => m.name === name)
    setStoryboardItems(prev => [...prev, { id: nextId + prev.length, name, materialIndex: idx >= 0 ? idx : 0 }])
  }, [nextId])

  const clearStoryboard = useCallback(() => {
    setStoryboardItems([])
    setSelectedIdx(null)
  }, [])

  const autoArrange = useCallback(() => {
    const items = MOCK_MATERIALS.map((m, i) => ({ id: i, name: m.name, materialIndex: i }))
    setStoryboardItems(items)
    setSelectedIdx(0)
  }, [])

  const sendToEditor = useCallback(() => {
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: { tab: 'editor' } }))
  }, [])

  const totalSeconds = storyboardItems.length * durationPerClip
  const totalStr = `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`

  const selectedItem = selectedIdx !== null ? storyboardItems[selectedIdx] : null
  const selectedMaterial = selectedItem ? MOCK_MATERIALS[selectedItem.materialIndex] : null

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* 左栏 — 素材列表 240px */}
      <div style={{ width: 240, borderRight: '1px solid var(--ho-border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '8px' }}>
          <Input placeholder="搜索素材..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: 11 }} />
        </div>
        <div style={{ display: 'flex', gap: 4, padding: '4px 8px' }}>
          {['全部', '视频', '图片', '音频'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '2px 12px', borderRadius: 10, fontSize: 11, height: 22,
              backgroundColor: filter === f ? 'var(--ho-accent-bg)' : 'rgba(255,255,255,0.04)',
              color: filter === f ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
              border: 'none', cursor: 'pointer'
            }}>{f}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filteredMaterials.map((m, i) => (
            <div
              key={m.name}
              draggable
              onDragStart={e => e.dataTransfer.setData('text/plain', JSON.stringify({ name: m.name, duration: m.duration, index: i }))}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', cursor: 'grab', borderBottom: '1px solid var(--ho-border)' }}
            >
              <div style={{ width: 48, height: 28, backgroundColor: '#2a2a2a', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="file" size={14} color="var(--ho-text-tertiary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--ho-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
              </div>
              <span style={{ fontSize: 10, color: 'var(--ho-text-tertiary)', flexShrink: 0 }}>{m.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 中栏 — 故事板 flex-1 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 36, borderBottom: '1px solid var(--ho-border)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, flexShrink: 0 }}>
          <Button variant="ghost" style={{ fontSize: 11, height: 28 }} onClick={autoArrange}>自动编排</Button>
          <Button variant="ghost" style={{ fontSize: 11, height: 28 }} onClick={clearStoryboard}>清空</Button>
          <div style={{ width: 1, height: 16, backgroundColor: 'var(--ho-border)' }} />
          <span style={{ fontSize: 11, color: 'var(--ho-text-secondary)' }}>单片段时长:</span>
          <Input type="number" style={{ width: 58, height: 24, padding: '0 6px', fontSize: 11 }} value={durationPerClip} onChange={e => setDurationPerClip(Number(e.target.value))} />
          <span style={{ fontSize: 11, color: 'var(--ho-text-secondary)' }}>秒</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', gap: 12, alignItems: 'flex-start', alignContent: 'flex-start', flexWrap: 'wrap' }} onDrop={onDrop(handleDropOnStoryboard)} onDragOver={onDragOver}>
          {storyboardItems.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                onClick={() => setSelectedIdx(i)}
                style={{
                  width: 200, cursor: 'pointer', borderRadius: 'var(--ho-radius-md)',
                  border: selectedIdx === i ? '2px solid var(--ho-accent)' : '1px solid var(--ho-border)',
                  overflow: 'hidden', backgroundColor: 'var(--ho-bg-secondary)'
                }}
              >
                <div style={{ aspectRatio: '16/9', backgroundColor: '#2a2a2a', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', position: 'relative', padding: '4px' }}>
                  <span style={{ fontSize: 10, color: 'var(--ho-text-tertiary)', backgroundColor: 'rgba(0,0,0,0.6)', padding: '1px 4px', borderRadius: 3 }}>
                    {String(Math.floor(durationPerClip / 60)).padStart(2, '0')}:{String(durationPerClip % 60).padStart(2, '0')}
                  </span>
                </div>
                <div style={{ height: 3, backgroundColor: 'var(--ho-border)' }} />
              </div>
              {i < storyboardItems.length - 1 && <Icon name="chevron-right" size={16} color="var(--ho-text-tertiary)" />}
            </div>
          ))}
        </div>
        <div style={{ height: 36, borderTop: '1px solid var(--ho-border)', display: 'flex', alignItems: 'center', padding: '0 12px', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--ho-text-tertiary)' }}>总时长: {totalStr}</span>
          <Button variant="primary" style={{ height: 28, fontSize: 11 }} onClick={sendToEditor}>发送到剪辑台 <Icon name="chevron-right" size={14} /></Button>
        </div>
      </div>

      {/* 右栏 — 属性 240px */}
      <div style={{ width: 240, borderLeft: '1px solid var(--ho-border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'auto' }}>
        <div style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>素材信息</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 4 }}>文件名</div>
            <div style={{ fontSize: 12, color: 'var(--ho-text-primary)' }}>{selectedMaterial?.name || '未选择'}</div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 4 }}>持续时间</div>
            <Slider value={durationPerClip} min={1} max={30} step={1} onChange={setDurationPerClip} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 4 }}>速度</div>
            <Slider value={speed} min={25} max={400} step={5} onChange={setSpeed} />
          </div>

          <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>过渡效果</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {TRANSITIONS.map(t => (
              <div key={t.name} onClick={() => setSelectedTrans(t.name)} style={{
                padding: '12px 8px', borderRadius: 'var(--ho-radius-sm)', cursor: 'pointer', textAlign: 'center',
                border: selectedTrans === t.name ? '1px solid var(--ho-accent)' : '1px solid var(--ho-border)',
                backgroundColor: selectedTrans === t.name ? 'var(--ho-accent-bg)' : 'transparent'
              }}>
                <div style={{ fontSize: 16, color: 'var(--ho-text-secondary)', marginBottom: 4 }}>{t.symbol}</div>
                <div style={{ fontSize: 11, color: 'var(--ho-text-secondary)' }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {ImportDialog}
    </div>
  )
}
