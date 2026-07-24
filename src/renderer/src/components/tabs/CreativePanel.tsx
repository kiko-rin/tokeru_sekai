import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Toggle } from '../ui/Toggle'
import { useCreativeStore } from '../../stores/creativeStore'
import { DrawingCanvas } from './drawing/DrawingCanvas'
import { ToolBar } from './drawing/ToolBar'
import { LayerPanel } from './drawing/LayerPanel'
import { BrushPanel } from './drawing/BrushPanel'
import { MRPanel } from './drawing/MRPanel'
import { KeyframeTimeline } from './drawing/KeyframeTimeline'
import { PuppetCanvas } from './puppet/PuppetCanvas'
import { PuppetControls } from './puppet/PuppetControls'
import { SkinSelector } from './puppet/SkinSelector'
import { AnimationList } from './puppet/AnimationList'
import { SpineLoader } from './puppet/SpineLoader'
import { SpineSetupGuide } from './puppet/SpineSetupGuide'
import { spineRuntime } from '../../lib/spine/SpineRuntime'

export function CreativePanel() {
  const {
    mode, activeTool, activeLayerId, brushParams, mrEnabled,
    zoom, panX, panY, spineLoaded,
    setMode, setActiveTool, setActiveLayer, setBrushParams,
    setMrEnabled, setZoom, setPan, setSpineLoaded
  } = useCreativeStore()

  const [drawingTab, setDrawingTab] = useState<'tools'|'brushes'|'mr'>('tools')
  const [puppetTab, setPuppetTab] = useState<'properties'|'keyframes'>('properties')
  const [puppetLeftTab, setPuppetLeftTab] = useState<'resources'|'skins'|'animations'>('resources')
  const [puppetPlaying, setPuppetPlaying] = useState(false)
  const [statusInfo, setStatusInfo] = useState({ tool:'画笔', zoom:100, x:0, y:0 })
  const [spineStartup, setSpineStartup] = useState(false)

  useEffect(() => {
    if (mode === 'puppet' && !spineStartup) {
      setSpineStartup(true)
      spineRuntime.load().then(() => {
        setSpineLoaded(true)
      }).catch(() => {
        setSpineLoaded(false)
      })
    }
  }, [mode, spineStartup, setSpineLoaded])

  const handleFileLoad = useCallback((skel: File, atlas: File) => {
    console.log('Skeleton:', skel.name, 'Atlas:', atlas.name)
  }, [])

  const handleSkinChange = useCallback((skin: string) => {
    console.log('Skin:', skin)
  }, [])

  const handleAnimChange = useCallback((anim: string) => {
    console.log('Animation:', anim)
  }, [])

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{height:'40px',borderBottom:'1px solid var(--ho-border)',display:'flex',alignItems:'center',padding:'0 8px',gap:'8px',flexShrink:0}}>
        <Button variant="icon" style={{fontSize:'12px'}}><Icon name="back" size={14} color="var(--ho-text-secondary)" /></Button>
        <div style={{width:'1px',height:'16px',backgroundColor:'var(--ho-border)'}} />
        <div style={{flex:1,display:'flex',justifyContent:'center'}}>
          <div style={{display:'flex',backgroundColor:'var(--ho-bg-tertiary)',borderRadius:'14px',padding:'2px',position:'relative',width:'180px'}}>
            <div style={{position:'absolute',top:'2px',bottom:'2px',left:mode==='drawing'?'2px':'calc(50% + 0px)',width:'calc(50% - 2px)',backgroundColor:'#fff',borderRadius:'12px',transition:'left 250ms cubic-bezier(0.4,0,0.2,1)'}} />
            <button onClick={()=>{setMode('drawing');setSpineStartup(false)}} style={{flex:1,height:'22px',borderRadius:'12px',fontSize:'10px',color:mode==='drawing'?'#333':'var(--ho-text-secondary)',position:'relative',zIndex:1}}>手绘模式</button>
            <button onClick={()=>setMode('puppet')} style={{flex:1,height:'22px',borderRadius:'12px',fontSize:'10px',color:mode==='puppet'?'#333':'var(--ho-text-secondary)',position:'relative',zIndex:1}}>人偶模式</button>
          </div>
        </div>
        <div style={{width:'1px',height:'16px',backgroundColor:'var(--ho-border)'}} />
        {mode === 'drawing' ? (
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <span style={{fontSize:'9px',color:'var(--ho-text-secondary)'}}>大小</span>
            <input type="range" min={1} max={500} value={brushParams.size} onChange={e=>setBrushParams({size:Number(e.target.value)})} style={{width:'50px',height:'3px'}} />
            <span style={{fontSize:'9px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',width:'20px',textAlign:'right'}}>{brushParams.size}</span>
            <span style={{fontSize:'9px',color:'var(--ho-text-secondary)'}}>不透明度</span>
            <input type="range" min={0} max={100} value={brushParams.opacity*100} onChange={e=>setBrushParams({opacity:Number(e.target.value)/100})} style={{width:'50px',height:'3px'}} />
            <span style={{fontSize:'9px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',width:'20px',textAlign:'right'}}>{Math.round(brushParams.opacity*100)}</span>
          </div>
        ) : (
          <PuppetControls playing={puppetPlaying} onPlayToggle={()=>setPuppetPlaying(!puppetPlaying)} />
        )}
        <Button variant="icon" style={{fontSize:'10px'}}><Icon name="eye" size={14} color="var(--ho-text-secondary)" /></Button>
      </div>

      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        <div style={{width:'200px',borderRight:'1px solid var(--ho-border)',display:'flex',flexDirection:'column',flexShrink:0,backgroundColor:'var(--ho-bg-secondary)'}}>
          {mode === 'drawing' ? (
            <LayerPanel activeLayerId={activeLayerId} onLayerSelect={setActiveLayer} />
          ) : (
            <>
              <div style={{display:'flex'}}>
                {['资源','皮肤','动画'].map(t => (
                  <button key={t} onClick={()=>setPuppetLeftTab(t==='资源'?'resources':t==='皮肤'?'skins':'animations')} style={{
                    flex:1,height:'28px',fontSize:'9px',
                    color:puppetLeftTab===(t==='资源'?'resources':t==='皮肤'?'skins':'animations')?'var(--ho-accent)':'var(--ho-text-secondary)',
                    backgroundColor:puppetLeftTab===(t==='资源'?'resources':t==='皮肤'?'skins':'animations')?'var(--ho-accent-bg)':'transparent',
                    borderBottom:puppetLeftTab===(t==='资源'?'resources':t==='皮肤'?'skins':'animations')?'2px solid var(--ho-accent)':'2px solid transparent'
                  }}>{t}</button>
                ))}
              </div>
              <div style={{flex:1,overflow:'auto'}}>
                {puppetLeftTab==='resources' && (spineLoaded ? <SpineLoader onFilesLoaded={handleFileLoad} /> : <SpineSetupGuide />)}
                {puppetLeftTab==='skins' && <SkinSelector skins={[]} currentSkin="" onSkinChange={handleSkinChange} />}
                {puppetLeftTab==='animations' && <AnimationList animations={[]} currentAnimation="" onAnimationChange={handleAnimChange} />}
              </div>
            </>
          )}
        </div>

        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {mode === 'drawing' ? (
            <DrawingCanvas brushSize={brushParams.size} brushOpacity={brushParams.opacity*100} activeTool={activeTool} onStatusChange={setStatusInfo} />
          ) : (
            <PuppetCanvas />
          )}
          <div style={{height:'28px',borderTop:'1px solid var(--ho-border)',display:'flex',alignItems:'center',padding:'0 12px',gap:'10px',flexShrink:0,fontSize:'9px',color:'var(--ho-text-tertiary)'}}>
            <span>{statusInfo.tool}</span>
            <div style={{width:'1px',height:'10px',backgroundColor:'var(--ho-border)'}} />
            <span>1920x1080</span>
            <div style={{width:'1px',height:'10px',backgroundColor:'var(--ho-border)'}} />
            <span>{zoom}%</span>
            <div style={{width:'1px',height:'10px',backgroundColor:'var(--ho-border)'}} />
            <span>x:{statusInfo.x} y:{statusInfo.y}</span>
            <div style={{flex:1}} />
            <input type="range" min={25} max={400} value={zoom} onChange={e=>setZoom(Number(e.target.value))} style={{width:'50px',height:'3px'}} />
            <span style={{fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',width:'24px',textAlign:'right'}}>{zoom}%</span>
          </div>
        </div>

        <div style={{width:'280px',borderLeft:'1px solid var(--ho-border)',display:'flex',flexDirection:'column',flexShrink:0}}>
          {mode === 'drawing' ? (
            <>
              <div style={{display:'flex'}}>
                {['工具','笔刷','MR合成'].map(t => (
                  <button key={t} onClick={()=>setDrawingTab(t==='工具'?'tools':t==='笔刷'?'brushes':'mr')} style={{
                    flex:1,height:'28px',fontSize:'9px',
                    color:drawingTab===(t==='工具'?'tools':t==='笔刷'?'brushes':'mr')?'var(--ho-accent)':'var(--ho-text-secondary)',
                    backgroundColor:drawingTab===(t==='工具'?'tools':t==='笔刷'?'brushes':'mr')?'var(--ho-accent-bg)':'transparent',
                    borderBottom:drawingTab===(t==='工具'?'tools':t==='笔刷'?'brushes':'mr')?'2px solid var(--ho-accent)':'2px solid transparent'
                  }}>{t}</button>
                ))}
              </div>
              <div style={{flex:1,overflow:'auto',padding:'12px'}}>
                {drawingTab==='tools' && <ToolBar activeTool={activeTool} onToolChange={setActiveTool} />}
                {drawingTab==='brushes' && <BrushPanel brushSize={brushParams.size} brushOpacity={brushParams.opacity*100} onSizeChange={v=>setBrushParams({size:v})} onOpacityChange={v=>setBrushParams({opacity:v/100})} />}
                {drawingTab==='mr' && <MRPanel />}
              </div>
            </>
          ) : (
            <>
              <div style={{display:'flex'}}>
                {['属性','K帧'].map(t => (
                  <button key={t} onClick={()=>setPuppetTab(t==='属性'?'properties':'keyframes')} style={{
                    flex:1,height:'28px',fontSize:'9px',
                    color:puppetTab===(t==='属性'?'properties':'keyframes')?'var(--ho-accent)':'var(--ho-text-secondary)',
                    backgroundColor:puppetTab===(t==='属性'?'properties':'keyframes')?'var(--ho-accent-bg)':'transparent',
                    borderBottom:puppetTab===(t==='属性'?'properties':'keyframes')?'2px solid var(--ho-accent)':'2px solid transparent'
                  }}>{t}</button>
                ))}
              </div>
              <div style={{flex:1,overflow:'auto',padding:'12px'}}>
                {puppetTab==='properties' ? (
                  <div>
                    <div style={{fontSize:'9px',color:'var(--ho-text-tertiary)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'6px'}}>变换</div>
                    {[['位置 X',0],['位置 Y',0],['缩放 X',100],['缩放 Y',100],['旋转',0]].map(([label,val]) => (
                      <div key={String(label)} style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'4px'}}>
                        <span style={{width:'44px',fontSize:'9px',color:'var(--ho-text-secondary)'}}>{String(label)}</span>
                        <input type="number" defaultValue={Number(val)} style={{flex:1,height:'20px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-primary)',fontSize:'9px',padding:'0 6px',outline:'none'}} />
                      </div>
                    ))}
                    <div style={{marginTop:'8px'}}>
                      <div style={{fontSize:'9px',color:'var(--ho-text-tertiary)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'6px'}}>效果</div>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'4px'}}>
                        <span style={{fontSize:'9px',color:'var(--ho-text-secondary)'}}>阴影</span>
                        <Toggle checked={false} onChange={()=>{}} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <KeyframeTimeline />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
