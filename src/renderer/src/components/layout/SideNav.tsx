import React from 'react'
import { Icon, type IconName } from '../ui/Icon'

interface SideNavProps {
  activeItem: string
  onItemClick: (item: string) => void
}

const TOP_ITEMS: { id: string; label: string; icon: IconName }[] = [
  { id: 'home', label: '首页', icon: 'home' },
  { id: 'projects', label: '项目', icon: 'folder' },
  { id: 'assets', label: '素材库', icon: 'folder' },
  { id: 'templates', label: '模板', icon: 'copy' }
]

const BOTTOM_ITEMS: { id: string; label: string; icon: IconName }[] = [
  { id: 'settings', label: '设置', icon: 'settings' },
  { id: 'help', label: '帮助', icon: 'help' }
]

function NavButton({ icon, label, active, onClick }: {
  icon: IconName
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      style={{
        width: '48px',
        height: '48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        border: 'none',
        borderLeft: active ? '3px solid var(--ho-accent)' : '3px solid transparent',
        backgroundColor: active ? 'var(--ho-accent-bg)' : 'transparent',
        color: active ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
        fontSize: 'var(--ho-font-size-xs)',
        cursor: 'pointer',
        transition: 'var(--ho-transition-fast)',
        position: 'relative'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
    >
      <Icon name={icon} size={18} color={active ? 'var(--ho-accent)' : 'var(--ho-text-secondary)'} />
      <span style={{ fontSize: '10px', color: active ? 'var(--ho-accent)' : 'var(--ho-text-secondary)', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  )
}

export function SideNav({ activeItem, onItemClick }: SideNavProps) {
  return (
    <nav style={{
      width: '48px',
      backgroundColor: 'var(--ho-bg-secondary)',
      borderRight: '1px solid var(--ho-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '4px'
      }}>
        {TOP_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.id}
            onClick={() => onItemClick(item.id)}
          />
        ))}
      </div>
      <div style={{
        width: '28px',
        height: '1px',
        backgroundColor: 'var(--ho-border)',
        margin: '4px 0'
      }} />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '8px'
      }}>
        {BOTTOM_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.id}
            onClick={() => onItemClick(item.id)}
          />
        ))}
      </div>
    </nav>
  )
}
