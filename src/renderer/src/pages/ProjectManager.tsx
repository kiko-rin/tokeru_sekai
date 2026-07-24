import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SideNav } from '../components/layout/SideNav'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'
import { Icon } from '../components/ui/Icon'
import { Input } from '../components/ui/Input'
import { NewProjectDialog, type NewProjectData } from '../components/tabs/NewProjectDialog'
import { ProjectSetupWizard } from '../components/tabs/ProjectSetupWizard'
import { SettingsPage } from '../components/tabs/SettingsPage'
import { DITPanel } from '../components/tabs/DITPanel'
import { useUIStore } from '../stores/uiStore'
import { useProjectStore } from '../stores/projectStore'
import type { Project } from '@shared/types'

const TYPE_CHIPS = ['全部', 'MR混合', '静态图像', '动画'] as const

function getRelativeTime(ts: number | string): string {
  const diff = Date.now() - Number(ts)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days === 1) return '1天前'
  if (days < 30) return `${days}天前`
  return `${Math.floor(days / 7)}周前`
}

function getTagColor(type: string) {
  if (type.includes('mr')) return 'accent'
  if (type.includes('animation')) return 'warning'
  return 'safe'
}

const TYPE_LABELS: Record<string, string> = { mr: 'MR混合', static: '静态图像', animation: '动画' }

export function ProjectManager() {
  const navigate = useNavigate()
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const { projects, addProject, removeProject } = useProjectStore()
  const [activeNav, setActiveNav] = useState('home')
  const [showDialog, setShowDialog] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [wizardData, setWizardData] = useState<NewProjectData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [typeFilter, setTypeFilter] = useState('全部')

  const filteredProjects = useMemo(() => {
    let list = projects
    if (typeFilter !== '全部') {
      const filterType = typeFilter === 'MR混合' ? 'mr' : typeFilter === '动画' ? 'animation' : 'static'
      list = list.filter(p => p.type === filterType)
    }
    if (searchQuery.trim()) {
      list = list.filter(p => p.name.includes(searchQuery.trim()))
    }
    return list
  }, [typeFilter, searchQuery, projects])

  const newProject = (data: NewProjectData) => {
    setWizardData(data)
    setShowWizard(true)
  }

  const handleWizardComplete = (result: any) => {
    setShowWizard(false)
    setWizardData(null)
    // Register project in store
    addProject({
      id: `p_${Date.now()}`,
      name: result.projectName,
      type: wizardData?.type || 'mr',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        resolution: result.resolution,
        fps: result.fps,
        backgroundColor: '#141414',
        description: '',
      }
    } as any)
    navigate('/project/new')
  }

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => (p as any).status === 'active').length,
    completed: projects.filter(p => (p as any).status === 'completed').length,
    archived: projects.filter(p => (p as any).status === 'archived').length
  }), [projects])

  if (activeNav === 'settings') {
    return (
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {!sidebarCollapsed && <SideNav activeItem={activeNav} onItemClick={setActiveNav} />}
        <SettingsPage />
      </div>
    )
  }

  if (activeNav === 'assets') {
    return (
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {!sidebarCollapsed && <SideNav activeItem={activeNav} onItemClick={setActiveNav} />}
        <DITPanel />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {!sidebarCollapsed && <SideNav activeItem={activeNav} onItemClick={setActiveNav} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid var(--ho-border)', flexShrink: 0, gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'var(--ho-accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--ho-accent)', fontFamily: 'var(--ho-font-family-title)' }}>2D</span>
            </div>
            <span style={{ fontFamily: 'var(--ho-font-family-title)', fontSize: 16, color: 'var(--ho-text-primary)', fontWeight: 600 }}>二维工坊</span>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Input placeholder="搜索项目..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ maxWidth: 280, fontSize: 12 }} />
          </div>
          <Button variant="primary" onClick={() => setShowDialog(true)}>
            <Icon name="plus" size={14} style={{ marginRight: 4 }} />
            新建项目
          </Button>
        </header>

        {projects.length === 0 ? (
          // Empty state - no projects
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
            <div style={{ width: 80, height: 80, borderRadius: 16, backgroundColor: 'var(--ho-accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="plus" size={36} color="var(--ho-accent)" />
            </div>
            <div style={{ fontFamily: 'var(--ho-font-family-title)', fontSize: 20, color: 'var(--ho-text-primary)' }}>还没有项目</div>
            <div style={{ fontSize: 12, color: 'var(--ho-text-tertiary)', textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
              点击下方按钮创建你的第一个项目。
              我们将引导你完成项目目录创建、素材导入和初始配置。
            </div>
            <Button variant="primary" style={{ height: 40, padding: '0 24px', fontSize: 13 }} onClick={() => setShowDialog(true)}>
              <Icon name="plus" size={14} style={{ marginRight: 6 }} />
              新建项目
            </Button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'flex', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--ho-border)', flexShrink: 0 }}>
              {[
                { label: '项目总数', value: stats.total },
                { label: '进行中', value: stats.active },
                { label: '已完成', value: stats.completed },
                { label: '已归档', value: stats.archived }
              ].map(stat => (
                <Panel key={stat.label} style={{ flex: 1, padding: '14px 16px' }}>
                  <div style={{ fontFamily: 'var(--ho-font-family-title)', fontSize: 24, color: 'var(--ho-text-primary)', lineHeight: 1.2 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginTop: 2 }}>{stat.label}</div>
                </Panel>
              ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--ho-border)', flexShrink: 0, gap: 12 }}>
              <div style={{ display: 'flex', border: '1px solid var(--ho-border)', borderRadius: 4, overflow: 'hidden' }}>
                <button onClick={() => setViewMode('grid')} style={{
                  width: 30, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
                  backgroundColor: viewMode === 'grid' ? 'var(--ho-bg-tertiary)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--ho-text-primary)' : 'var(--ho-text-tertiary)'
                }}><Icon name="list" size={14} color={viewMode === 'grid' ? 'var(--ho-text-primary)' : 'var(--ho-text-tertiary)'} /></button>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {TYPE_CHIPS.map(chip => (
                  <button key={chip} style={{
                    padding: '0 12px', height: 26, fontSize: 11, borderRadius: 13, cursor: 'pointer',
                    border: typeFilter === chip ? '1px solid var(--ho-accent)' : '1px solid var(--ho-border)',
                    backgroundColor: typeFilter === chip ? 'var(--ho-accent-bg)' : 'transparent',
                    color: typeFilter === chip ? 'var(--ho-accent)' : 'var(--ho-text-secondary)'
                  }} onClick={() => setTypeFilter(chip)}>{chip}</button>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)' }}>共 {filteredProjects.length} 个</div>
            </div>

            {/* Project Grid */}
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
              <div style={viewMode === 'grid'
                ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }
                : { display: 'flex', flexDirection: 'column', gap: 8 }
              }>
                {filteredProjects.map(project => (
                  viewMode === 'grid' ? (
                    <Panel key={project.id} style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }} onClick={() => navigate(`/project/${project.id}`)}>
                      <div style={{ height: 140, backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'var(--ho-font-family-title)', fontSize: 28, color: 'var(--ho-text-tertiary)', opacity: 0.3 }}>{project.name[0]}</span>
                      </div>
                      <div style={{ padding: 12 }}>
                        <div style={{ fontSize: 13, color: 'var(--ho-text-primary)', fontWeight: 500, marginBottom: 6 }}>{project.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 8, backgroundColor: 'var(--ho-accent-bg)', color: 'var(--ho-accent)' }}>{TYPE_LABELS[project.type] || project.type}</span>
                          <span style={{ fontSize: 10, color: 'var(--ho-text-tertiary)' }}>{getRelativeTime(project.updatedAt)}</span>
                        </div>
                      </div>
                    </Panel>
                  ) : (
                    <Panel key={project.id} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => navigate(`/project/${project.id}`)}>
                      <div style={{ fontSize: 13, color: 'var(--ho-text-primary)', flex: 1 }}>{project.name}</div>
                      <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 8, backgroundColor: 'var(--ho-accent-bg)', color: 'var(--ho-accent)' }}>{TYPE_LABELS[project.type] || project.type}</span>
                      <span style={{ fontSize: 10, color: 'var(--ho-text-tertiary)' }}>{getRelativeTime(project.updatedAt)}</span>
                    </Panel>
                  )
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <NewProjectDialog open={showDialog} onClose={() => setShowDialog(false)} onCreate={newProject} />

      {showWizard && wizardData && (
        <ProjectSetupWizard
          initialName={wizardData.name}
          initialType={wizardData.type}
          onComplete={handleWizardComplete}
          onCancel={() => { setShowWizard(false); setWizardData(null) }}
        />
      )}
    </div>
  )
}
