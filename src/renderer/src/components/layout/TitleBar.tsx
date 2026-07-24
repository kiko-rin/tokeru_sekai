import { useCallback, useState, useEffect } from 'react'
import { Icon } from '../ui/Icon'

const win = window as any

export function TitleBar() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    const check = async () => {
      try { setMaximized(await win.electronAPI?.window.isMaximized() ?? false) } catch {}
    }
    check()
    const interval = setInterval(check, 1000)
    return () => clearInterval(interval)
  }, [])

  const h = useCallback((fn: () => Promise<void>) => () => fn(), [])

  return (
    <div style={{ height:48, backgroundColor:'var(--ho-bg-secondary)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px', borderBottom:'1px solid var(--ho-border)', flexShrink:0, WebkitAppRegion:'drag', userSelect:'none' } as any}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:28, height:28, backgroundColor:'var(--ho-accent-bg)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:14, color:'var(--ho-accent)', fontFamily:'var(--ho-font-family-title)' }}>2D</span>
        </div>
        <span style={{ fontFamily:'var(--ho-font-family-title)', fontSize:16, color:'var(--ho-text-primary)', fontWeight:600 }}>二维工坊</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:4, WebkitAppRegion:'no-drag' } as any}>
        <Icon name="minimize" size={14} color="var(--ho-text-secondary)" onClick={h(win.electronAPI?.window.minimize)} />
        <Icon name={maximized ? 'restore' : 'maximize'} size={14} color="var(--ho-text-secondary)" onClick={h(win.electronAPI?.window.maximize)} />
        <Icon name="close" size={14} color="var(--ho-text-secondary)" onClick={h(win.electronAPI?.window.close)} />
      </div>
    </div>
  )
}
