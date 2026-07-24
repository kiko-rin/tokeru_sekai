import { useState, useCallback, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Panel } from '../ui/Panel'
import { Input } from '../ui/Input'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'
import { Icon } from '../ui/Icon'
import { useSettingsStore } from '../../stores/settingsStore'
import { DevPanel } from './DevPanel'

const NAV_ITEMS = ['常规','性能','色彩管理','快捷键','存储','插件','关于']

const NAV_ITEMS_WITH_DEV = [...NAV_ITEMS, '开发']

const SHORTCUTS = [
  { action:'保存', key:'Ctrl+S' },{ action:'撤销', key:'Ctrl+Z' },{ action:'重做', key:'Ctrl+Shift+Z' },
  { action:'播放/暂停', key:'Space' },{ action:'后退1帧', key:'Left' },{ action:'前进1帧', key:'Right' },
  { action:'跳到起点', key:'Home' },{ action:'跳到终点', key:'End' },{ action:'标记入点', key:'I' },
  { action:'标记出点', key:'O' },{ action:'删除选中', key:'Delete' },{ action:'全选', key:'Ctrl+A' },
  { action:'画笔', key:'B' },{ action:'橡皮擦', key:'E' },{ action:'保存', key:'Ctrl+S' },
  { action:'新建项目', key:'Ctrl+N' }
]

export function SettingsPage() {
  const [activeNav, setActiveNav] = useState('常规')
  const [shortcutSearch, setShortcutSearch] = useState('')
  const store = useSettingsStore()
  const [showDevWarning, setShowDevWarning] = useState(false)

  const navItems = store.devMode ? NAV_ITEMS_WITH_DEV : NAV_ITEMS

  const handleBrowse = useCallback(async (currentPath: string, setter: (p: string) => void) => {
    const api = (window as any).electronAPI
    if (!api) return
    const dir = await api.dialog.openDirectory({ title:'选择目录', defaultPath: currentPath })
    if (dir) setter(dir)
  }, [])

  const handleDevToggle = (on: boolean) => {
    if (on) {
      setShowDevWarning(true)
    } else {
      store.setDevMode(false)
    }
  }

  const confirmDevMode = () => {
    store.setDevMode(true)
    setShowDevWarning(false)
  }

  const renderContent = () => {
    switch (activeNav) {
      case '常规':
        return (
          <div>
            <Section title="界面">
              <Row label="语言"><select style={{height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'12px',padding:'0 8px',outline:'none',flex:1}}><option>简体中文</option><option>English</option><option>日本語</option></select></Row>
              <Row label="主题"><div style={{display:'flex',gap:'6px'}}><button style={{padding:'4px 12px',borderRadius:'4px',fontSize:'11px',backgroundColor:store.theme==='dark'?'var(--ho-accent)':'var(--ho-bg-tertiary)',color:store.theme==='dark'?'#0e1318':'var(--ho-text-secondary)',border:'none'}} onClick={()=>store.setTheme('dark')}>深色</button><button style={{padding:'4px 12px',borderRadius:'4px',fontSize:'11px',backgroundColor:store.theme==='light'?'var(--ho-accent)':'var(--ho-bg-tertiary)',color:store.theme==='light'?'#0e1318':'var(--ho-text-secondary)',border:'none'}} onClick={()=>store.setTheme('light')}>浅色</button></div></Row>
              <Row label="界面缩放"><div style={{display:'flex',alignItems:'center',gap:'8px',flex:1}}><input type="range" min={80} max={150} value={store.uiScale} onChange={e=>store.setUiScale(Number(e.target.value))} style={{flex:1,height:'3px',accentColor:'var(--ho-accent)'}} /><span style={{fontSize:'11px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',width:'30px',textAlign:'right'}}>{store.uiScale}%</span></div></Row>
            </Section>
            <Section title="编辑">
              <Row label="自动保存"><div style={{display:'flex',alignItems:'center',gap:'8px'}}><Toggle checked={store.autoSave} onChange={(v)=>store.setAutoSave(v)} /><input type="number" value={store.autoSaveInterval} onChange={e=>store.setAutoSave(true,Number(e.target.value))} style={{width:'50px',height:'26px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-primary)',fontSize:'11px',padding:'0 6px',outline:'none'}} /><span style={{fontSize:'11px',color:'var(--ho-text-tertiary)'}}>分钟</span></div></Row>
              <Row label="撤销步数"><input type="number" value={store.undoSteps} onChange={e=>store.setUndoSteps(Number(e.target.value))} style={{width:'60px',height:'26px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-primary)',fontSize:'11px',padding:'0 6px',outline:'none'}} /></Row>
            </Section>
          </div>
        )

      case '性能':
        return (
          <div>
            <Section title="GPU">
              <Row label="GPU 加速"><Toggle checked={true} onChange={()=>{}} /></Row>
              <Row label="硬件解码"><Toggle checked={true} onChange={()=>{}} /></Row>
            </Section>
            <Section title="预览">
              <Row label="预览质量"><select style={{height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'12px',padding:'0 8px',outline:'none',flex:1}}><option>1/4</option><option>1/2</option><option>全分辨率</option></select></Row>
              <Row label="预览帧率"><select style={{height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'12px',padding:'0 8px',outline:'none',flex:1}}><option>15</option><option>24</option><option>30</option><option>60</option></select></Row>
            </Section>
            <Section title="内存">
              <Row label="内存限制"><div style={{display:'flex',alignItems:'center',gap:'8px',flex:1}}><Slider value={8} min={2} max={64} step={1} onChange={()=>{}} style={{flex:1}} /><span style={{fontSize:'11px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',width:'30px',textAlign:'right'}}>8 GB</span></div></Row>
              <Row label="缓存大小"><div style={{display:'flex',alignItems:'center',gap:'8px',flex:1}}><Slider value={20} min={1} max={200} step={1} onChange={()=>{}} style={{flex:1}} /><span style={{fontSize:'11px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',width:'36px',textAlign:'right'}}>20 GB</span><Button variant="ghost" style={{fontSize:'10px'}}>清除</Button></div></Row>
            </Section>
          </div>
        )

      case '色彩管理':
        return (
          <div>
            <Section title="自动色彩还原">
              <Row label="自动色彩还原"><Toggle checked={store.ace.autoRestore} onChange={(v)=>store.setAceSettings({autoRestore:v})} /></Row>
              <Row label="还原LUT库"><select value={store.ace.restoreLUTLibrary} onChange={e=>store.setAceSettings({restoreLUTLibrary:e.target.value as 'built-in'|'user'})} style={{height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'12px',padding:'0 8px',outline:'none',flex:1}}><option value="built-in">内置</option><option value="user">自定义</option></select></Row>
              <Row label="默认还原LUT"><select style={{height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'12px',padding:'0 8px',outline:'none',flex:1}}><option>自动匹配</option><option>S-Log3 to Linear</option><option>C-Log3 to Linear</option></select></Row>
              <Row label="强制覆盖"><Toggle checked={store.ace.forceOverwrite} onChange={(v)=>store.setAceSettings({forceOverwrite:v})} /></Row>
            </Section>
            <Section title="自动色彩统一">
              <Row label="自动色彩统一"><Toggle checked={store.ace.autoUnify} onChange={(v)=>store.setAceSettings({autoUnify:v})} /></Row>
              <SliderRow label="统一强度" value={store.ace.unifyStrength} min={0} max={100} onChange={v=>store.setAceSettings({unifyStrength:v})} />
              <SliderRow label="目标色温" value={store.ace.targetTemperature} min={2000} max={12000} onChange={v=>store.setAceSettings({targetTemperature:v})} />
              <SliderRow label="目标色调" value={store.ace.targetTint} min={-100} max={100} onChange={v=>store.setAceSettings({targetTint:v})} />
              <SliderRow label="目标饱和度" value={store.ace.targetSaturation} min={0} max={200} onChange={v=>store.setAceSettings({targetSaturation:v})} />
              <SliderRow label="目标对比度" value={store.ace.targetContrast} min={0.5} max={2} step={0.1} onChange={v=>store.setAceSettings({targetContrast:v})} />
            </Section>
            <Section title="LUT库管理">
              <Row label="LUT存储路径"><div style={{display:'flex',gap:'6px',flex:1}}><Input value={store.ace.lutStoragePath} onChange={e=>store.setAceSettings({lutStoragePath:e.target.value})} style={{flex:1,fontSize:'11px'}} /><Button variant="default" style={{fontSize:'10px',height:'28px'}} onClick={()=>handleBrowse(store.ace.lutStoragePath, p=>store.setAceSettings({lutStoragePath:p}))}>浏览</Button></div></Row>
              <Row label="导入LUT"><Button variant="default" style={{fontSize:'10px'}}>选择文件</Button></Row>
              <Row label="内置LUT数量"><span style={{fontSize:'12px',color:'var(--ho-text-primary)'}}>14 个</span></Row>
              <Row label=" "><Button variant="ghost" style={{fontSize:'10px'}}>清理未使用LUT</Button></Row>
            </Section>
            <Button variant="primary" style={{width:'100%',marginTop:'12px'}} onClick={()=>store.resetToAceStandard()}>一键统一到ACE标准</Button>
          </div>
        )

      case '快捷键':
        return (
          <div>
            <div style={{marginBottom:'12px'}}>
              <Input placeholder="搜索操作名称或快捷键..." value={shortcutSearch} onChange={e=>setShortcutSearch(e.target.value)} />
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
              <div style={{display:'flex',padding:'6px 8px',borderBottom:'1px solid var(--ho-border)',fontSize:'10px',color:'var(--ho-text-tertiary)'}}>
                <span style={{flex:1}}>操作名称</span>
                <span style={{width:'120px'}}>快捷键</span>
                <span style={{width:'50px',textAlign:'center'}}>编辑</span>
              </div>
              {SHORTCUTS.filter(s=>s.action.includes(shortcutSearch)||s.key.includes(shortcutSearch)).map(s => (
                <div key={s.action} style={{display:'flex',padding:'5px 8px',borderBottom:'1px solid var(--ho-border)',fontSize:'11px',alignItems:'center'}}>
                  <span style={{flex:1,color:'var(--ho-text-secondary)'}}>{s.action}</span>
                  <span style={{width:'120px',fontFamily:'var(--ho-font-family-mono)',fontSize:'10px',color:'var(--ho-accent)'}}>{s.key}</span>
                  <div style={{width:'50px',textAlign:'center'}}>
                    <Button variant="icon" style={{width:'22px',height:'22px'}}><Icon name="pen" size={12} color="var(--ho-text-secondary)" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case '存储':
        return (
          <div>
            <Section title="路径">
              <Row label="项目存储"><div style={{display:'flex',gap:'6px',flex:1}}><Input value={store.projectPath} onChange={e=>store.setProjectPath(e.target.value)} style={{flex:1,fontSize:'11px'}} /><Button variant="default" style={{fontSize:'10px',height:'28px'}} onClick={()=>handleBrowse(store.projectPath, store.setProjectPath)}>浏览</Button></div></Row>
              <Row label="缓存路径"><div style={{display:'flex',gap:'6px',flex:1}}><Input value={store.cachePath} onChange={e=>store.setCachePath(e.target.value)} style={{flex:1,fontSize:'11px'}} /><Button variant="default" style={{fontSize:'10px',height:'28px'}} onClick={()=>handleBrowse(store.cachePath, store.setCachePath)}>浏览</Button></div></Row>
              <Row label="导出路径"><div style={{display:'flex',gap:'6px',flex:1}}><Input value={store.exportPath} onChange={e=>store.setExportPath(e.target.value)} style={{flex:1,fontSize:'11px'}} /><Button variant="default" style={{fontSize:'10px',height:'28px'}} onClick={()=>handleBrowse(store.exportPath, store.setExportPath)}>浏览</Button></div></Row>
            </Section>
            <Section title="磁盘使用">
              <Row label="缓存"><span style={{fontSize:'11px',color:'var(--ho-text-primary)'}}>12.3 GB</span></Row>
              <Row label="备份"><span style={{fontSize:'11px',color:'var(--ho-text-primary)'}}>2.1 GB</span></Row>
              <Row label=" "><Button variant="ghost" style={{fontSize:'10px'}}>清理空间</Button></Row>
            </Section>
          </div>
        )

      case '插件':
        return (
          <div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'16px'}}>
              {[{name:'色彩增强工具箱',ver:'1.0.0',enabled:true},{name:'AI超分辨率',ver:'0.5.0',enabled:false},{name:'批量渲染队列',ver:'2.1.0',enabled:true}].map(p => (
                <div key={p.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px',border:'1px solid var(--ho-border)',borderRadius:'var(--ho-radius-md)'}}>
                  <div><div style={{fontSize:'12px',color:'var(--ho-text-primary)'}}>{p.name}</div><div style={{fontSize:'10px',color:'var(--ho-text-tertiary)'}}>v{p.ver}</div></div>
                  <Toggle checked={p.enabled} onChange={()=>{}} />
                </div>
              ))}
            </div>
            <Button variant="default" style={{width:'100%',fontSize:'11px'}}>获取更多插件</Button>
          </div>
        )

      case '关于':
        return (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'24px',textAlign:'center'}}>
            <div style={{width:'80px',height:'80px',backgroundColor:'var(--ho-accent-bg)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'24px',color:'var(--ho-accent)',fontFamily:'var(--ho-font-family-title)'}}>2D</span>
            </div>
            <div style={{fontFamily:'var(--ho-font-family-title)',fontSize:'20px',color:'var(--ho-text-primary)',marginBottom:'4px'}}>二维工坊</div>
            <div style={{fontSize:'13px',color:'var(--ho-text-secondary)',marginBottom:'16px'}}>版本 v1.0.0</div>
            <Button variant="default" style={{fontSize:'11px',marginBottom:'24px'}}>检查更新</Button>
            <div style={{fontSize:'11px',color:'var(--ho-text-tertiary)',lineHeight:2}}>
              <div>许可证: MIT License</div>
              <div>依赖: Electron 31.7.7</div>
              <div>Chromium 126.0.6478.127</div>
              <div>Node.js 20.18.0</div>
            </div>
            <div style={{ width:'100%', height:1, backgroundColor:'var(--ho-border)', margin:'16px 0' }} />
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'4px 0' }}>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:12, color:'var(--ho-text-primary)' }}>开发者模式</div>
                <div style={{ fontSize:10, color:'var(--ho-text-tertiary)' }}>启用后将在设置中显示开发工具面板</div>
              </div>
              <Toggle checked={store.devMode} onChange={handleDevToggle} />
            </div>
            <div style={{fontSize:'11px',color:'var(--ho-text-tertiary)',marginTop:'16px'}}>(C) 2024 二维工坊 保留所有权利</div>
          </div>
        )

      case '开发':
        return <DevPanel />

    }
  }

  return (
    <div style={{flex:1,display:'flex',overflow:'hidden'}}>
      <div style={{width:'200px',borderRight:'1px solid var(--ho-border)',backgroundColor:'var(--ho-bg-secondary)',padding:'8px 0',flexShrink:0}}>
        {navItems.map(item => (
          <div key={item} onClick={()=>setActiveNav(item)} style={{
            padding:'8px 16px',cursor:'pointer',fontSize:'12px',display:'flex',alignItems:'center',gap:'8px',
            color: activeNav===item ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
            backgroundColor: activeNav===item ? 'var(--ho-accent-bg)' : 'transparent',
            borderLeft: activeNav===item ? '3px solid var(--ho-accent)' : '3px solid transparent'
          }}>{item}</div>
        ))}
      </div>
      <div style={{flex:1,overflow:'auto',padding:'24px 32px',maxWidth:'700px'}}>
        <h2 style={{fontFamily:'var(--ho-font-family-title)',fontSize:'18px',color:'var(--ho-text-primary)',marginBottom:'20px',fontWeight:600}}>{activeNav}</h2>
        {renderContent()}
      </div>
      {showDevWarning && (
        <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <Panel style={{ maxWidth:420, width:'100%', padding:24 }}>
            <div style={{ fontSize:16, fontFamily:'var(--ho-font-family-title)', color:'var(--ho-warning)', marginBottom:12, fontWeight:600 }}>⚠ 开发者模式</div>
            <div style={{ fontSize:12, color:'var(--ho-text-secondary)', lineHeight:1.8, marginBottom:16 }}>
              开启开发者模式将暴露调试工具和底层系统接口。<br />
              此模式仅推荐给开发者和高级用户使用。<br /><br />
              开启后你将可以访问:
              <ul style={{ margin:'8px 0', paddingLeft:20 }}>
                <li>终端控制台 (支持基础命令)</li>
                <li>IPC 通信日志监视器</li>
                <li>系统信息面板</li>
              </ul>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <Button variant="default" onClick={() => setShowDevWarning(false)}>取消</Button>
              <Button variant="primary" onClick={confirmDevMode}>我已了解，开启</Button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}

function Section({title,children}:{title:string;children:React.ReactNode}) {
  return (
    <div style={{marginBottom:'20px'}}>
      <div style={{fontSize:'11px',color:'var(--ho-text-tertiary)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'10px',borderBottom:'1px solid var(--ho-border)',paddingBottom:'6px'}}>{title}</div>
      {children}
    </div>
  )
}

function Row({label,children}:{label:string;children:React.ReactNode}) {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0',gap:'12px'}}>
      <span style={{fontSize:'12px',color:'var(--ho-text-secondary)',width:'100px',flexShrink:0}}>{label}</span>
      <div style={{display:'flex',alignItems:'center',flex:1}}>{children}</div>
    </div>
  )
}

function SliderRow({label,value,min,max,step,onChange}:{label:string;value:number;min:number;max:number;step?:number;onChange:(v:number)=>void}) {
  return (
    <Row label={label}>
      <div style={{display:'flex',alignItems:'center',gap:'8px',flex:1}}>
        <input type="range" min={min} max={max} step={step||1} value={value} onChange={e=>onChange(Number(e.target.value))} style={{flex:1,height:'3px',accentColor:'var(--ho-accent)'}} />
        <span style={{fontSize:'11px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',width:'50px',textAlign:'right'}}>{value}</span>
      </div>
    </Row>
  )
}
