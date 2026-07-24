import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Panel } from '../components/ui/Panel'
import { Tag } from '../components/ui/Tag'
import { SideNav } from '../components/layout/SideNav'
import { NewProjectDialog, type NewProjectData } from '../components/tabs/NewProjectDialog'
import { SettingsPage } from '../components/tabs/SettingsPage'
import { useProjectStore } from '../stores/projectStore'
import type { Project } from '@shared/types'

const PROJECT_TYPES = ['MR混合', '静态图像', '动画'] as const

const MOCK_PROJECTS: Project[] = [
  { id:'p1', name:'城市宣传片', type:'mr', resolution:'1920x1080', fps:30, backgroundColor:'#141414', description:'', createdAt:Date.now()-86400000*3, updatedAt:Date.now()-86400000, status:'active' },
  { id:'p2', name:'产品展示动画', type:'animation', resolution:'1920x1080', fps:30, backgroundColor:'#141414', description:'', createdAt:Date.now()-86400000*7, updatedAt:Date.now()-86400000*2, status:'active' },
  { id:'p3', name:'品牌Logo设计', type:'static', resolution:'1920x1080', fps:30, backgroundColor:'#141414', description:'', createdAt:Date.now()-86400000*14, updatedAt:Date.now()-86400000*5, status:'completed' },
  { id:'p4', name:'音乐MV', type:'animation', resolution:'3840x2160', fps:60, backgroundColor:'#141414', description:'', createdAt:Date.now()-86400000*30, updatedAt:Date.now()-86400000*10, status:'active' },
  { id:'p5', name:'游戏过场', type:'animation', resolution:'1920x1080', fps:30, backgroundColor:'#141414', description:'', createdAt:Date.now()-86400000*60, updatedAt:Date.now()-86400000*20, status:'active' },
  { id:'p6', name:'教程视频', type:'mr', resolution:'1920x1080', fps:30, backgroundColor:'#141414', description:'', createdAt:Date.now()-86400000*90, updatedAt:Date.now()-86400000*30, status:'archived' },
  { id:'p7', name:'广告短片', type:'mr', resolution:'1920x1080', fps:30, backgroundColor:'#141414', description:'', createdAt:Date.now()-86400000*120, updatedAt:Date.now()-86400000*60, status:'completed' },
  { id:'p8', name:'绘本故事', type:'static', resolution:'1920x1080', fps:30, backgroundColor:'#141414', description:'', createdAt:Date.now()-86400000*180, updatedAt:Date.now()-86400000*90, status:'archived' }
]

export function ProjectManager() {
  const navigate = useNavigate()
  const { projects, setProjects, addProject, removeProject, searchQuery, setSearchQuery } = useProjectStore()
  const [showDialog, setShowDialog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState('全部')
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid')

  useEffect(() => {
    setProjects(MOCK_PROJECTS)
  }, [setProjects])

  const filtered = projects.filter(p => {
    if (filter !== '全部' && !p.type.includes(filter === 'MR混合' ? 'mr' : filter === '静态图像' ? 'static' : 'animation')) return false
    if (searchQuery && !p.name.includes(searchQuery)) return false
    return true
  })

  const handleCreate = useCallback((data: NewProjectData) => {
    const now = Date.now()
    const project: Project = {
      id: `p${now}`,
      name: data.name,
      type: data.type,
      resolution: data.resolution,
      fps: data.fps,
      backgroundColor: data.backgroundColor,
      description: data.description,
      createdAt: now,
      updatedAt: now,
      status: 'active'
    }
    addProject(project)
    navigate(`/project/${project.id}`)
  }, [addProject, navigate])

  const now = Date.now()
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    archived: projects.filter(p => p.status === 'archived').length
  }

  return (
    <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
      <SideNav activeItem={showSettings ? 'settings' : 'home'} onItemClick={(item) => {
        if (item === 'settings') setShowSettings(true)
        else { setShowSettings(false) }
      }} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {showSettings ? (
          <div style={{ flex:1, overflow:'auto', display:'flex' }}>
            <div style={{ flex:1, maxWidth:700, margin:'0 auto', padding:'24px' }}>
              <div style={{ display:'flex', alignItems:'center', marginBottom:24, gap:12 }}>
                <Button variant="ghost" onClick={() => setShowSettings(false)} style={{ fontSize:12 }}>{'<-'} 返回</Button>
                <h2 style={{ fontFamily:'var(--ho-font-family-title)', fontSize:18, color:'var(--ho-text-primary)', margin:0 }}>设置</h2>
              </div>
              <SettingsPage />
            </div>
          </div>
        ) : (
          <>
            <div style={{ height:48, borderBottom:'1px solid var(--ho-border)', display:'flex', alignItems:'center', padding:'0 16px', gap:12, flexShrink:0 }}>
              <div style={{ width:28, height:28, backgroundColor:'var(--ho-accent-bg)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:14, color:'var(--ho-accent)', fontFamily:'var(--ho-font-family-title)' }}>2D</span>
              </div>
              <span style={{ fontFamily:'var(--ho-font-family-title)', fontSize:16, color:'var(--ho-text-primary)', fontWeight:600 }}>二维工坊</span>
              <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
                <Input placeholder="搜索项目..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ maxWidth:360, fontSize:12 }} />
              </div>
              <Button variant="primary" onClick={() => setShowDialog(true)}>+ 新建项目</Button>
              <div style={{ width:32, height:32, borderRadius:'50%', backgroundColor:'var(--ho-bg-tertiary)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <span style={{ fontSize:12, color:'var(--ho-text-secondary)' }}>U</span>
              </div>
            </div>

            <div style={{ display:'flex', gap:12, padding:'16px 16px 0' }}>
              {[['项目总数', stats.total], ['进行中', stats.active], ['已完成', stats.completed], ['已归档', stats.archived]].map(([label, count]) => (
                <div key={label} style={{ flex:1, padding:'12px 16px', borderRadius:'var(--ho-radius-md)', border:'1px solid var(--ho-border)', backgroundColor:'var(--ho-bg-secondary)' }}>
                  <div style={{ fontSize:24, fontFamily:'var(--ho-font-family-title)', color:'var(--ho-accent)', marginBottom:4 }}>{count}</div>
                  <div style={{ fontSize:11, color:'var(--ho-text-tertiary)' }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', alignItems:'center', padding:'12px 16px', gap:8, flexShrink:0 }}>
              <div style={{ display:'flex', gap:4 }}>
                {['全部', 'MR混合', '静态图像', '动画'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding:'3px 14px', borderRadius:12, fontSize:11, cursor:'pointer',
                    backgroundColor: filter === f ? 'var(--ho-accent-bg)' : 'rgba(255,255,255,0.04)',
                    color: filter === f ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
                    border: filter === f ? '1px solid var(--ho-accent)' : '1px solid transparent',
                    borderColor: filter === f ? 'var(--ho-accent)' : 'var(--ho-border)'
                  }}>{f}</button>
                ))}
              </div>
              <div style={{ flex:1 }} />
              <span style={{ fontSize:11, color:'var(--ho-text-tertiary)' }}>共 {filtered.length} 个</span>
              <div style={{ width:1, height:16, backgroundColor:'var(--ho-border)' }} />
              <Button variant="icon" style={{ fontSize:12, color:viewMode==='grid'?'var(--ho-accent)':'var(--ho-text-secondary)' }} onClick={() => setViewMode('grid')}>[=]</Button>
              <Button variant="icon" style={{ fontSize:12, color:viewMode==='list'?'var(--ho-accent)':'var(--ho-text-secondary)' }} onClick={() => setViewMode('list')}>[=]</Button>
            </div>

            <div style={{ flex:1, overflow:'auto', padding:16, display:'grid', gridTemplateColumns: viewMode==='grid' ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr', gap:16, alignContent:'start' }}>
              {filtered.map(p => (
                <div key={p.id} onClick={() => navigate(`/project/${p.id}`)} style={{
                  borderRadius:'var(--ho-radius-md)', border:'1px solid var(--ho-border)', overflow:'hidden', cursor:'pointer', backgroundColor:'var(--ho-bg-secondary)'
                }}>
                  <div style={{ aspectRatio:'16/9', backgroundColor: p.backgroundColor, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:11, color:'var(--ho-text-tertiary)' }}>{p.name[0]}</span>
                  </div>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ fontSize:13, color:'var(--ho-text-primary)', marginBottom:4, fontWeight:500 }}>{p.name}</div>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <Tag variant={p.type === 'mr' ? 'accent' : p.type === 'animation' ? 'warning' : 'safe'}>{PROJECT_TYPES[['mr','static','animation'].indexOf(p.type)]}</Tag>
                      <span style={{ fontSize:10, color:'var(--ho-text-tertiary)' }}>{Math.floor((now - p.createdAt) / 86400000)} 天前</span>
                    </div>
                  </div>
                </div>
              ))}
              <div onClick={() => setShowDialog(true)} style={{
                borderRadius:'var(--ho-radius-md)', border:'2px dashed var(--ho-border)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', minHeight:200, backgroundColor:'var(--ho-bg-secondary)'
              }}>
                <span style={{ fontSize:32, color:'var(--ho-text-tertiary)' }}>+</span>
              </div>
            </div>
          </>
        )}
      </div>
      <NewProjectDialog open={showDialog} onClose={() => setShowDialog(false)} onCreate={handleCreate} />
    </div>
  )
}
