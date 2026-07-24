import { useState, useCallback, useRef } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Icon } from '../ui/Icon'
import { useDITImport } from '../../hooks/useDITImport'

interface Shot {
  id: string; name: string; script: string; paragraphType: string
}

interface Scene {
  id: string; name: string; expanded: boolean; shots: Shot[]
}

const PARAGRAPH_TYPES = ['场景描述', '对白', '动作指示', '镜头指示']

const MOCK_SCENES: Scene[] = []

const MOCK_MATERIALS: { name: string; duration: string; type: string }[] = []

export function OutlinePanel() {
  const [scenes, setScenes] = useState(MOCK_SCENES)
  const [selectedShot, setSelectedShot] = useState('sh1')
  const [materialTab, setMaterialTab] = useState('视频')
  const [materialSearch, setMaterialSearch] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const { importMedia, ImportDialog } = useDITImport()

  const currentShot = scenes.flatMap(s => s.shots).find(sh => sh.id === selectedShot)
  const sceneIdx = scenes.findIndex(s => s.shots.some(sh => sh.id === selectedShot))
  const shotIdx = currentShot ? scenes.find(s => s.shots.some(sh => sh.id === selectedShot))?.shots.indexOf(currentShot) ?? -1 : -1
  const paragraphType = currentShot?.paragraphType || '场景描述'

  const updateShotScript = useCallback((shotId: string, script: string) => {
    setScenes(prev => prev.map(s => ({ ...s, shots: s.shots.map(sh => sh.id === shotId ? { ...sh, script } : sh) })))
  }, [])

  const updateShotParagraphType = useCallback((shotId: string, pt: string) => {
    setScenes(prev => prev.map(s => ({ ...s, shots: s.shots.map(sh => sh.id === shotId ? { ...sh, paragraphType: pt } : sh) })))
  }, [])

  const toggleScene = useCallback((id: string) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s))
  }, [])

  const addScene = useCallback(() => {
    const id = `s${Date.now()}`
    setScenes(prev => [...prev, { id, name: `场景${prev.length + 1}`, expanded: true, shots: [{ id: `sh${id}`, name: `镜头${prev.length + 1}.1`, script: '', paragraphType: '场景描述' }] }])
    setSelectedShot(`sh${id}`)
  }, [])

  const addShot = useCallback(() => {
    const activeScene = scenes.find(s => s.shots.some(sh => sh.id === selectedShot))
    if (!activeScene) return
    const sIdx = scenes.indexOf(activeScene) + 1
    const shNum = activeScene.shots.length + 1
    const id = `sh${Date.now()}`
    setScenes(prev => prev.map(s => s.id === activeScene.id ? { ...s, shots: [...s.shots, { id, name: `镜头${sIdx}.${shNum}`, script: '', paragraphType: '场景描述' }] } : s))
    setSelectedShot(id)
  }, [scenes, selectedShot])

  const deleteShot = useCallback((shotId: string) => {
    let next = ''
    const allShots = scenes.flatMap(s => s.shots)
    const idx = allShots.findIndex(sh => sh.id === shotId)
    if (idx > 0) next = allShots[idx - 1].id
    else if (allShots.length > 1) next = allShots[idx + 1].id
    setScenes(prev => prev.map(s => ({ ...s, shots: s.shots.filter(sh => sh.id !== shotId) })))
    if (next) setSelectedShot(next)
  }, [scenes])

  const handleEditorInput = useCallback(() => {
    if (editorRef.current && currentShot) {
      updateShotScript(currentShot.id, editorRef.current.innerHTML)
    }
  }, [currentShot, updateShotScript])

  const execFormat = useCallback((cmd: string) => {
    document.execCommand(cmd, false)
    editorRef.current?.focus()
  }, [])

  const importMaterial = async () => {
    const files = await importMedia()
    if (files.length > 0) console.log('DIT imported:', files.length)
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* 左栏 — 项目结构树 240px */}
      <div style={{ width: 240, borderRight: '1px solid var(--ho-border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '12px 16px', fontSize: 14, fontFamily: 'var(--ho-font-family-title)', color: 'var(--ho-text-primary)', borderBottom: '1px solid var(--ho-border)' }}>项目大纲</div>
        <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
          {scenes.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: 'var(--ho-text-tertiary)' }}>
              暂无场景，点击下方按钮添加
            </div>
          ) : (
          scenes.map((scene) => (
            <div key={scene.id}>
              <div
                onClick={() => toggleScene(scene.id)}
                onMouseEnter={e => { (e.currentTarget.style.color = 'var(--ho-text-primary)') }}
                onMouseLeave={e => { (e.currentTarget.style.color = 'var(--ho-text-secondary)') }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 16px', cursor: 'pointer', fontSize: 12, color: 'var(--ho-text-secondary)', borderRadius: 0 }}
              >
                <Icon name="chevron-right" size={10} color="var(--ho-text-tertiary)" style={{ transition: 'transform 120ms', transform: scene.expanded ? 'rotate(90deg)' : '' }} />
                <Icon name="folder" size={12} color="var(--ho-text-tertiary)" />
                <span style={{ fontSize: 12 }}>{scene.name}</span>
              </div>
              {scene.expanded && scene.shots.map((shot) => (
                <div
                  key={shot.id}
                  onClick={() => setSelectedShot(shot.id)}
                  onMouseEnter={e => { if (shot.id !== selectedShot) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--ho-text-primary)' } }}
                  onMouseLeave={e => { if (shot.id !== selectedShot) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--ho-text-secondary)' } }}
                  onContextMenu={e => { e.preventDefault(); deleteShot(shot.id) }}
                  style={{
                    padding: '5px 16px 5px 36px', cursor: 'pointer', fontSize: 12,
                    color: selectedShot === shot.id ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
                    backgroundColor: selectedShot === shot.id ? 'var(--ho-accent-bg)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  <Icon name="chevron-right" size={10} color="var(--ho-text-tertiary)" /><span>{shot.name}</span>
                </div>
              ))}
            </div>
          ))
        )}
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid var(--ho-border)', display: 'flex', gap: 6 }}>
          <Button variant="ghost" style={{ fontSize: 11, height: 28 }} onClick={addScene}><Icon name="plus" size={12} /> 场景</Button>
          <Button variant="ghost" style={{ fontSize: 11, height: 28 }} onClick={addShot}><Icon name="plus" size={12} /> 镜头</Button>
        </div>
      </div>

      {/* 中栏 — 脚本编辑器 flex-1 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '6px 16px', borderBottom: '1px solid var(--ho-border)', fontSize: 12, color: 'var(--ho-text-secondary)', display: 'flex', gap: 16, flexShrink: 0 }}>
          <span>{currentShot ? currentShot.name : '未选择镜头'}</span>
          <span>时长: 00:05:00</span>
          <span>1920 x 1080</span>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          style={{
            flex: 1, padding: 16, outline: 'none', overflow: 'auto', lineHeight: 1.8,
            ...(paragraphType === '场景描述' ? { fontSize: 14, color: 'var(--ho-text-primary)' } :
               paragraphType === '对白' ? { fontSize: 13, color: 'var(--ho-text-primary)' } :
               paragraphType === '动作指示' ? { fontSize: 13, color: 'var(--ho-text-secondary)', fontStyle: 'italic' } :
               { fontSize: 12, color: 'var(--ho-text-secondary)', backgroundColor: 'rgba(122,158,196,0.06)', padding: '8px 12px', borderRadius: 6 })
          }}
          dangerouslySetInnerHTML={{ __html: currentShot?.script || '' }}
          key={selectedShot}
        />
        <div style={{ height: 36, borderTop: '1px solid var(--ho-border)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 4, flexShrink: 0 }}>
          <button onClick={() => execFormat('bold')} style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid var(--ho-border)', background: 'none', color: 'var(--ho-text-secondary)', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>B</button>
          <button onClick={() => execFormat('italic')} style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid var(--ho-border)', background: 'none', color: 'var(--ho-text-secondary)', cursor: 'pointer', fontStyle: 'italic', fontSize: 12 }}>I</button>
          <button onClick={() => execFormat('underline')} style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid var(--ho-border)', background: 'none', color: 'var(--ho-text-secondary)', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}>U</button>
          <div style={{ width: 1, height: 16, backgroundColor: 'var(--ho-border)', margin: '0 8px' }} />
          <select value={paragraphType} onChange={e => currentShot && updateShotParagraphType(currentShot.id, e.target.value)} style={{ backgroundColor: 'var(--ho-bg-tertiary)', border: '1px solid var(--ho-border)', borderRadius: 4, color: 'var(--ho-text-secondary)', fontSize: 11, padding: '2px 8px', height: 24, outline: 'none' }}>
            {PARAGRAPH_TYPES.map(pt => <option key={pt}>{pt}</option>)}
          </select>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'var(--ho-text-tertiary)' }}>字数: {currentShot?.script.replace(/<[^>]*>/g, '').length || 0}</span>
        </div>
      </div>

      {/* 右栏 — 素材库 280px */}
      <div style={{ width: 280, borderLeft: '1px solid var(--ho-border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--ho-border)' }}>
          {['视频', '图片', '音频', '特效'].map((tab) => (
            <button key={tab} onClick={() => setMaterialTab(tab)} style={{
              flex: 1, height: 32, fontSize: 11,
              color: materialTab === tab ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
              backgroundColor: materialTab === tab ? 'var(--ho-accent-bg)' : 'transparent',
              borderBottom: materialTab === tab ? '2px solid var(--ho-accent)' : '2px solid transparent'
            }}>{tab}</button>
          ))}
        </div>
        <div style={{ padding: 8 }}>
          <Input placeholder="搜索素材..." value={materialSearch} onChange={e => setMaterialSearch(e.target.value)} style={{ fontSize: 11 }} />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignContent: 'start' }}>
          {MOCK_MATERIALS.filter(m => m.name.includes(materialSearch) || materialTab === '全部' || m.type === materialTab.substring(0, 1).toLowerCase() + materialTab.substring(1)).map((m) => (
            <div key={m.name} draggable onDragStart={e => e.dataTransfer.setData('text/plain', JSON.stringify(m))} style={{ cursor: 'grab' }}>
              <div style={{ aspectRatio: '16/9', backgroundColor: '#222', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--ho-text-tertiary)' }}>{m.duration}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ho-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--ho-border)' }}>
          <Button variant="default" style={{ width: '100%' }} onClick={importMaterial}><Icon name="plus" size={12} /> 导入素材</Button>
        </div>
      </div>
      {ImportDialog}
    </div>
  )
}
