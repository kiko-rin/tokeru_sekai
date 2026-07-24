import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Tag } from '../components/ui/Tag'
import { TabBar } from '../components/layout/TabBar'
import { ColorPanel } from '../components/tabs/ColorPanel'
import { OutlinePanel } from '../components/tabs/OutlinePanel'
import { QuickEditPanel } from '../components/tabs/QuickEditPanel'
import { EditorPanel } from '../components/tabs/EditorPanel'
import { CreativePanel } from '../components/tabs/CreativePanel'
import { AudioPanel } from '../components/tabs/AudioPanel'
import { PublishPanel } from '../components/tabs/PublishPanel'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

const TAB_ORDER = ['outline','quick-edit','editor','creative','color','audio','publish']

export function ProjectView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('outline')
  const [projectName, setProjectName] = useState('示例项目')

  const switchTab = useCallback((delta: number) => {
    const idx = TAB_ORDER.indexOf(activeTab)
    if (idx === -1) return
    const next = TAB_ORDER[(idx + delta + TAB_ORDER.length) % TAB_ORDER.length]
    setActiveTab(next)
  }, [activeTab])

  useKeyboardShortcuts({
    'ctrl-s': () => console.log('save'),
    'ctrl-z': () => console.log('undo'),
    'ctrl-shift-z': () => console.log('redo'),
    'ctrl-[': () => navigate('/'),
    'ctrl-tab': () => switchTab(1),
    'ctrl-shift-tab': () => switchTab(-1)
  })

  const renderTabContent = () => {
    switch (activeTab) {
      case 'color':
        return <ColorPanel />
      case 'outline':
        return <OutlinePanel />
      case 'quick-edit':
        return <QuickEditPanel />
      case 'editor':
        return <EditorPanel />
      case 'creative':
        return <CreativePanel />
      case 'audio':
        return <AudioPanel />
      case 'publish':
        return <PublishPanel />
      default:
        return <OutlinePanel />
    }
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        borderBottom: '1px solid var(--ho-border)',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Button variant="ghost" onClick={() => navigate('/')}>
            返回
          </Button>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setProjectName(e.currentTarget.textContent || '')}
            style={{
              fontFamily: 'var(--ho-font-family-title)',
              fontSize: 'var(--ho-font-size-lg)',
              color: 'var(--ho-text-primary)',
              fontWeight: 600,
              outline: 'none',
              padding: '2px 8px',
              borderRadius: '4px'
            }}
          >
            {projectName}
          </div>
          <Tag color="accent">MR混合</Tag>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Button variant="ghost">保存</Button>
          <Button variant="ghost">撤销</Button>
          <Button variant="ghost">重做</Button>
          <Button variant="primary">导出</Button>
          <Button variant="ghost">设置</Button>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {renderTabContent()}
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
