import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SideNav } from '../components/layout/SideNav'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'
import { Tag } from '../components/ui/Tag'
import { Input } from '../components/ui/Input'
import { NewProjectDialog } from '../components/tabs/NewProjectDialog'
import { SettingsPage } from '../components/tabs/SettingsPage'
import { useUIStore } from '../stores/uiStore'

interface Project {
  id: string
  name: string
  type: 'MR混合' | '静态图像' | '动画'
  hoursAgo: number
}

const MOCK_PROJECTS: Project[] = [
  { id: '1', name: '城市宣传片', type: 'MR混合', hoursAgo: 2 },
  { id: '2', name: '产品展示动画', type: '动画', hoursAgo: 5 },
  { id: '3', name: '品牌Logo设计', type: '静态图像', hoursAgo: 12 },
  { id: '4', name: '音乐MV', type: '动画', hoursAgo: 24 },
  { id: '5', name: '游戏过场', type: '动画', hoursAgo: 50 },
  { id: '6', name: '教程视频', type: 'MR混合', hoursAgo: 72 },
  { id: '7', name: '广告短片', type: 'MR混合', hoursAgo: 120 },
  { id: '8', name: '绘本故事', type: '静态图像', hoursAgo: 168 }
]

const TYPE_CHIPS = ['全部', 'MR混合', '静态图像', '动画'] as const

const STATS = [
  { label: '项目总数', value: 12 },
  { label: '进行中', value: 3 },
  { label: '已完成', value: 8 },
  { label: '已归档', value: 1 }
]

function getRelativeTime(hoursAgo: number): string {
  if (hoursAgo < 1) return '刚刚'
  if (hoursAgo < 24) return `${hoursAgo}小时前`
  const days = Math.floor(hoursAgo / 24)
  if (days === 1) return '1天前'
  if (days < 30) return `${days}天前`
  return `${Math.floor(days / 7)}周前`
}

function getTagColor(type: Project['type']) {
  switch (type) {
    case 'MR混合': return 'accent'
    case '静态图像': return 'safe'
    case '动画': return 'warning'
  }
}

export function ProjectManager() {
  const navigate = useNavigate()
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const [activeNav, setActiveNav] = useState('home')
  const [showDialog, setShowDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [typeFilter, setTypeFilter] = useState<string>('全部')

  const filteredProjects = useMemo(() => {
    let list = MOCK_PROJECTS
    if (typeFilter !== '全部') {
      list = list.filter((p) => p.type === typeFilter)
    }
    if (searchQuery.trim()) {
      list = list.filter((p) => p.name.includes(searchQuery.trim()))
    }
    return list
  }, [typeFilter, searchQuery])

  if (activeNav === 'settings') {
    return (
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {!sidebarCollapsed && (
          <SideNav activeItem={activeNav} onItemClick={setActiveNav} />
        )}
        <SettingsPage />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {!sidebarCollapsed && (
        <SideNav activeItem={activeNav} onItemClick={setActiveNav} />
      )}

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <header style={{
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid var(--ho-border)',
          flexShrink: 0,
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--ho-radius-sm)',
              backgroundColor: 'var(--ho-accent-bg)',
              color: 'var(--ho-accent)',
              fontSize: '16px',
              fontFamily: 'var(--ho-font-family-body)'
            }}>
              [=]
            </span>
            <span style={{
              fontFamily: 'var(--ho-font-family-title)',
              fontSize: 'var(--ho-font-size-lg)',
              color: 'var(--ho-text-primary)',
              fontWeight: 600
            }}>
              二维工坊
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              position: 'relative',
              width: '280px'
            }}>
              <Input
                placeholder="搜索项目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  borderRadius: '15px',
                  paddingLeft: '32px'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--ho-text-tertiary)',
                fontSize: 'var(--ho-font-size-sm)',
                pointerEvents: 'none'
              }}>
                [-]
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}>
            <Button variant="primary" onClick={() => setShowDialog(true)}>
              <span>+</span>
              新建项目
            </Button>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--ho-bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ho-text-tertiary)',
              fontSize: 'var(--ho-font-size-xs)'
            }}>
              U
            </div>
          </div>
        </header>

        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--ho-border)',
          flexShrink: 0
        }}>
          {STATS.map((stat) => (
            <Panel key={stat.label} style={{
              flex: 1,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--ho-font-family-title)',
                  fontSize: 'var(--ho-font-size-2xl)',
                  color: 'var(--ho-text-primary)',
                  lineHeight: 1.2
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: 'var(--ho-font-size-xs)',
                  color: 'var(--ho-text-tertiary)',
                  marginTop: '2px'
                }}>
                  {stat.label}
                </div>
              </div>
              <span style={{
                fontSize: '18px',
                color: 'var(--ho-text-tertiary)'
              }}>
                [#]
              </span>
            </Panel>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          borderBottom: '1px solid var(--ho-border)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              border: '1px solid var(--ho-border)',
              borderRadius: 'var(--ho-radius-sm)',
              overflow: 'hidden'
            }}>
              <button
                style={{
                  width: '30px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? 'var(--ho-bg-tertiary)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--ho-text-primary)' : 'var(--ho-text-tertiary)',
                  fontSize: 'var(--ho-font-size-xs)',
                  cursor: 'pointer',
                  transition: 'var(--ho-transition-fast)'
                }}
                onClick={() => setViewMode('grid')}
              >
                [#]
              </button>
              <button
                style={{
                  width: '30px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? 'var(--ho-bg-tertiary)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--ho-text-primary)' : 'var(--ho-text-tertiary)',
                  fontSize: 'var(--ho-font-size-xs)',
                  cursor: 'pointer',
                  transition: 'var(--ho-transition-fast)'
                }}
                onClick={() => setViewMode('list')}
              >
                [=]
              </button>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {TYPE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  style={{
                    padding: '0 10px',
                    height: '26px',
                    fontSize: 'var(--ho-font-size-xs)',
                    borderRadius: '13px',
                    border: typeFilter === chip
                      ? '1px solid var(--ho-accent)'
                      : '1px solid var(--ho-border)',
                    backgroundColor: typeFilter === chip
                      ? 'var(--ho-accent-bg)'
                      : 'transparent',
                    color: typeFilter === chip
                      ? 'var(--ho-accent)'
                      : 'var(--ho-text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--ho-transition-fast)'
                  }}
                  onClick={() => setTypeFilter(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            fontSize: 'var(--ho-font-size-xs)',
            color: 'var(--ho-text-tertiary)'
          }}>
            共 {filteredProjects.length} 个
          </div>
        </div>

        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px'
        }}>
          <div style={
            viewMode === 'grid'
              ? {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '16px'
                }
              : {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }
          }>
            <Panel
              style={{
                padding: 0,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '2px dashed var(--ho-border-active)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: viewMode === 'grid' ? '200px' : '60px',
                transition: 'var(--ho-transition-normal)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '2px solid var(--ho-accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '2px dashed var(--ho-border-active)'
              }}
              onClick={() => setShowDialog(true)}
            >
              <span style={{
                fontSize: viewMode === 'grid' ? '32px' : '16px',
                color: 'var(--ho-text-tertiary)',
                marginBottom: viewMode === 'grid' ? '8px' : 0
              }}>
                +
              </span>
              {viewMode === 'grid' && (
                <span style={{
                  fontSize: 'var(--ho-font-size-sm)',
                  color: 'var(--ho-text-tertiary)'
                }}>
                  新建项目
                </span>
              )}
            </Panel>

            {filteredProjects.map((project) => (
              viewMode === 'grid' ? (
                <Panel
                  key={project.id}
                  style={{
                    cursor: 'pointer',
                    transition: 'var(--ho-transition-normal)',
                    padding: 0,
                    overflow: 'hidden'
                  }}
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <div style={{
                    height: '140px',
                    backgroundColor: '#222',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <span style={{
                      fontSize: '20px',
                      color: 'var(--ho-text-tertiary)',
                      opacity: 0.3
                    }}>
                      [=]
                    </span>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: 'var(--ho-font-size-md)',
                        color: 'var(--ho-text-primary)',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        marginRight: '8px'
                      }}>
                        {project.name}
                      </span>
                      <Tag color={getTagColor(project.type)}>
                        {project.type}
                      </Tag>
                    </div>
                    <div style={{
                      fontSize: 'var(--ho-font-size-xs)',
                      color: 'var(--ho-text-tertiary)'
                    }}>
                      {getRelativeTime(project.hoursAgo)}
                    </div>
                  </div>
                </Panel>
              ) : (
                <Panel
                  key={project.id}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'var(--ho-transition-normal)'
                  }}
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <div style={{
                    width: '48px',
                    height: '27px',
                    backgroundColor: '#222',
                    borderRadius: 'var(--ho-radius-sm)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--ho-text-tertiary)',
                      opacity: 0.3
                    }}>
                      [=]
                    </span>
                  </div>
                  <span style={{
                    flex: 1,
                    fontSize: 'var(--ho-font-size-sm)',
                    color: 'var(--ho-text-primary)'
                  }}>
                    {project.name}
                  </span>
                  <Tag color={getTagColor(project.type)}>
                    {project.type}
                  </Tag>
                  <span style={{
                    fontSize: 'var(--ho-font-size-xs)',
                    color: 'var(--ho-text-tertiary)',
                    flexShrink: 0
                  }}>
                    {getRelativeTime(project.hoursAgo)}
                  </span>
                </Panel>
              )
            ))}
          </div>
        </div>
      </div>

      <NewProjectDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onCreate={(data) => {
          navigate('/project/new')
        }}
      />
    </div>
  )
}
