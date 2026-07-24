import { useState, useCallback } from 'react'
import { Button } from '../ui/Button'
import { Panel } from '../ui/Panel'
import { Input } from '../ui/Input'
import { Slider } from '../ui/Slider'
import { Tag } from '../ui/Tag'
import { Icon } from '../ui/Icon'
import { useDragDrop } from '../../hooks/useDragDrop'

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
  const [duration, setDuration] = useState(5)
  const [speed, setSpeed] = useState(100)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [storyboardItems, setStoryboardItems] = useState<number[]>([0, 1, 2, 3])
  const { onDragStart, onDrop, onDragOver } = useDragDrop()

  const handleDropOnStoryboard = useCallback((data: Record<string,unknown>) => {
    console.log('Dropped on storyboard:', data)
    setSelectedIndex(storyboardItems.length)
    setStoryboardItems(prev => [...prev, prev.length])
  }, [storyboardItems])

  const clearStoryboard = () => {
    setStoryboardItems([])
    setSelectedIndex(null)
  }

  const autoArrange = () => {
    setStoryboardItems([0, 1, 2, 3, 4, 5])
    setSelectedIndex(0)
  }

  const sendToEditor = () => {
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: { tab: 'editor' } }))
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: '240px', borderRight: '1px solid var(--ho-border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '8px' }}>
          <Input placeholder="搜索素材..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', borderBottom: '1px solid var(--ho-border)' }}>
          {['全部', '视频', '图片', '音频'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '2px 10px', borderRadius: '10px', fontSize: 'var(--ho-font-size-xs)',
                backgroundColor: filter === f ? 'var(--ho-accent-bg)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
                height: '22px'
              }}
            >{f}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {MOCK_MATERIALS.map((m) => (
            <div
              key={m.name}
              draggable
              onDragStart={onDragStart({ name: m.name, duration: m.duration })}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', cursor: 'grab', borderBottom: '1px solid var(--ho-border)' }}
            >
              <div style={{ width: '48px', height: '28px', backgroundColor: '#2a2a2a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '10px', color: 'var(--ho-text-tertiary)' }}>#</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--ho-text-tertiary)', flexShrink: 0 }}>{m.duration}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: '36px', borderBottom: '1px solid var(--ho-border)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px', flexShrink: 0 }}>
          <Button variant="ghost" onClick={autoArrange}>自动编排</Button>
          <Button variant="ghost" onClick={clearStoryboard}>清空</Button>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--ho-border)' }} />
          <span style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-secondary)' }}>单片段时长:</span>
          <Input type="number" style={{ width: '60px', height: '24px', padding: '0 6px' }} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          <span style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-secondary)' }}>秒</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start', alignContent: 'flex-start', flexWrap: 'wrap' }} onDrop={onDrop(handleDropOnStoryboard)} onDragOver={onDragOver}>
          {storyboardItems.map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                onClick={() => setSelectedIndex(i)}
                style={{
                  width: '200px', cursor: 'pointer', borderRadius: 'var(--ho-radius-md)',
                  border: selectedIndex === i ? '2px solid var(--ho-accent)' : '1px solid var(--ho-border)',
                  overflow: 'hidden', backgroundColor: 'var(--ho-bg-secondary)'
                }}
              >
                <div style={{ aspectRatio: '16/9', backgroundColor: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-tertiary)' }}>00:05</span>
                </div>
                <div style={{ height: '3px', backgroundColor: 'var(--ho-border)', margin: '0' }} />
              </div>
              {i < storyboardItems.length - 1 && <Icon name="chevron-right" size={16} color="var(--ho-text-tertiary)" />}
            </div>
          ))}
        </div>
        <div style={{ height: '36px', borderTop: '1px solid var(--ho-border)', display: 'flex', alignItems: 'center', padding: '0 12px', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-tertiary)' }}>总时长: 00:45</span>
          <Button variant="primary" onClick={sendToEditor}>发送到剪辑台 <Icon name="chevron-right" size={14} /></Button>
        </div>
      </div>

      <div style={{ width: '240px', borderLeft: '1px solid var(--ho-border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'auto' }}>
        <div style={{ padding: '12px' }}>
          <div style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>素材信息</div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-tertiary)', marginBottom: '4px' }}>文件名</div>
            <div style={{ fontSize: 'var(--ho-font-size-sm)', color: 'var(--ho-text-primary)' }}>城市航拍.mp4</div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-tertiary)', marginBottom: '4px' }}>持续时间</div>
            <Slider value={duration} min={1} max={30} step={1} onChange={setDuration} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-tertiary)', marginBottom: '4px' }}>速度</div>
            <Slider value={speed} min={25} max={400} step={5} onChange={setSpeed} />
          </div>

          <div style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>过渡效果</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {TRANSITIONS.map((t) => (
              <div
                key={t.name}
                onClick={() => setSelectedTrans(t.name)}
                style={{
                  padding: '12px 8px', borderRadius: 'var(--ho-radius-sm)', cursor: 'pointer', textAlign: 'center',
                  border: selectedTrans === t.name ? '1px solid var(--ho-accent)' : '1px solid var(--ho-border)',
                  backgroundColor: selectedTrans === t.name ? 'var(--ho-accent-bg)' : 'transparent'
                }}
              >
                <div style={{ fontSize: '16px', color: 'var(--ho-text-secondary)', marginBottom: '4px' }}>{t.symbol}</div>
                <div style={{ fontSize: 'var(--ho-font-size-xs)', color: 'var(--ho-text-secondary)' }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
