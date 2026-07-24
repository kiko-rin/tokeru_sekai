import { useState, useRef, useEffect, useCallback } from 'react'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'
import { Panel } from '../ui/Panel'
import { Button } from '../ui/Button'
import { useColorStore } from '../../stores/colorStore'
import { ColorGrade } from '../../lib/color/ColorGrade'
import type { ColorGradeParams } from '@shared/types'

const PRESETS = ['默认','电影','复古','黑白','日系','赛博','胶片','HDR 模拟','梦幻','冷峻']
const LUT_PRESETS = ['电影冷调','复古暖调','高对比','黑白经典','日系清新','赛博朋克']
const THUMBS = ['开场镜头','产品展示','结尾','叠加素材','Logo','字幕条']

export function ColorPanel() {
  const {
    params, activeTab, splitView, setParams, setSplitView, setActiveTab, undo, redo
  } = useColorStore()

  const [curveChannel, setCurveChannel] = useState<'rgb'|'r'|'g'|'b'>('rgb')
  const [lutSelected, setLutSelected] = useState(0)
  const [selectedThumb, setSelectedThumb] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gradeRef = useRef<ColorGrade | null>(null)

  useEffect(() => {
    if (canvasRef.current && !gradeRef.current) {
      try {
        gradeRef.current = new ColorGrade(canvasRef.current)
      } catch {}
    }
    return () => { gradeRef.current?.destroy(); gradeRef.current = null }
  }, [])

  useEffect(() => {
    gradeRef.current?.setParams(params)
  }, [params])

  const handleLutImport = async () => {
    const api = (window as any).electronAPI
    if (!api) return
    const files = await api.dialog.openFile({
      title: '导入LUT文件',
      filters: [{ name:'LUT 文件', extensions:['cube','3dl','csp'] }]
    })
    if (files?.[0]) {
      const content = await api.fs.readTextFile(files[0])
      console.log('LUT loaded:', files[0], content.length, 'bytes')
    }
  }

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{height:'40px',borderBottom:'1px solid var(--ho-border)',display:'flex',alignItems:'center',padding:'0 8px',gap:'6px',flexShrink:0}}>
        <Button variant="ghost" style={{fontSize:'12px'}}>{'<-'} 返回</Button>
        <div style={{width:'1px',height:'16px',backgroundColor:'var(--ho-border)'}} />
        <Toggle checked={splitView} onChange={setSplitView} />
        <span style={{fontSize:'10px',color:'var(--ho-text-secondary)'}}>分屏</span>
        <select style={{height:'24px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'10px',padding:'0 6px',outline:'none'}}>
          {PRESETS.map(p => <option key={p}>{p}</option>)}
        </select>
        <Button variant="ghost" style={{fontSize:'11px'}} onClick={() => { setParams({...params, exposure:0, contrast:0, saturation:1}) }}>重置</Button>
        <Button variant="ghost" style={{fontSize:'11px'}}>A/B</Button>
        <div style={{flex:1}} />
        <Button variant="ghost" style={{fontSize:'11px'}}>截图</Button>
        <Button variant="ghost" style={{fontSize:'11px'}}>导出LUT</Button>
      </div>

      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{flex:1,backgroundColor:'var(--ho-bg-primary)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
            <canvas ref={canvasRef} width={800} height={450} style={{maxWidth:'100%',maxHeight:'100%',backgroundColor:'#000',borderRadius:'4px'}} />
            {splitView && <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:'2px',backgroundColor:'var(--ho-accent)',cursor:'col-resize',zIndex:5}} />}
            <div style={{position:'absolute',bottom:'8px',left:'12px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',fontSize:'10px'}}>00:00:15:12</div>
            <div style={{position:'absolute',bottom:'8px',right:'12px',fontSize:'10px',color:'var(--ho-text-tertiary)'}}>1920x1080 - 30fps</div>
          </div>
          <div style={{height:'60px',borderTop:'1px solid var(--ho-border)',display:'flex',alignItems:'center',padding:'0 12px',gap:'8px',backgroundColor:'var(--ho-bg-secondary)'}}>
            <canvas width={320} height={44} style={{flex:1,height:'44px',backgroundColor:'rgba(255,255,255,0.02)',borderRadius:'4px'}} />
            <div style={{width:'80px',height:'36px',backgroundColor:'rgba(255,255,255,0.02)',borderRadius:'4px'}} />
          </div>
          <div style={{height:'48px',borderTop:'1px solid var(--ho-border)',display:'flex',alignItems:'center',gap:'8px',padding:'0 12px',overflowX:'auto',flexShrink:0}}>
            {THUMBS.map((t,i) => (
              <div key={t} onClick={()=>setSelectedThumb(i)} style={{width:'64px',height:'36px',borderRadius:'4px',cursor:'pointer',flexShrink:0,backgroundColor:'#2a2a2a',display:'flex',alignItems:'center',justifyContent:'center',border:selectedThumb===i?'2px solid var(--ho-accent)':'2px solid transparent',fontSize:'8px',color:'var(--ho-text-tertiary)'}}>{t}</div>
            ))}
          </div>
        </div>

        <div style={{width:'320px',borderLeft:'1px solid var(--ho-border)',display:'flex',flexDirection:'column',flexShrink:0,backgroundColor:'var(--ho-bg-secondary)'}}>
          <div style={{display:'flex',borderBottom:'1px solid var(--ho-border)'}}>
            {(['基础校色','曲线','色轮HSL','LUT'] as const).map(t => (
              <button key={t} onClick={()=>setActiveTab(t==='基础校色'?'basic':t==='曲线'?'curve':t==='色轮HSL'?'hsl':'lut')} style={{
                flex:1,height:'32px',fontSize:'11px',
                color:activeTab===(t==='基础校色'?'basic':t==='曲线'?'curve':t==='色轮HSL'?'hsl':'lut')?'var(--ho-accent)':'var(--ho-text-secondary)',
                backgroundColor:activeTab===(t==='基础校色'?'basic':t==='曲线'?'curve':t==='色轮HSL'?'hsl':'lut')?'var(--ho-accent-bg)':'transparent',
                borderBottom:activeTab===(t==='基础校色'?'basic':t==='曲线'?'curve':t==='色轮HSL'?'hsl':'lut')?'2px solid var(--ho-accent)':'2px solid transparent'
              }}>{t}</button>
            ))}
          </div>

          <div style={{flex:1,overflow:'auto',padding:'12px'}}>
            {activeTab==='basic' && (
              <div>
                <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>
                  <canvas width={140} height={140} style={{borderRadius:'50%',border:'2px solid var(--ho-border)'}} />
                </div>
                {[
                  {label:'亮度',key:'exposure' as keyof ColorGradeParams, value: params.exposure, min:-100, max:100},
                  {label:'对比度',key:'contrast' as keyof ColorGradeParams, value: params.contrast, min:-100, max:100},
                  {label:'饱和度',key:'saturation' as keyof ColorGradeParams, value: params.saturation, min:-100, max:100},
                  {label:'色温',key:'temperature' as keyof ColorGradeParams, value: params.temperature, min:-100, max:100},
                  {label:'色调',key:'tint' as keyof ColorGradeParams, value: params.tint, min:-100, max:100},
                  {label:'曝光',key:'exposure' as keyof ColorGradeParams, value: params.exposure, min:-100, max:100},
                  {label:'高光',key:'highlights' as keyof ColorGradeParams, value: params.highlights, min:-100, max:100},
                  {label:'阴影',key:'shadows' as keyof ColorGradeParams, value: params.shadows, min:-100, max:100}
                ].map(s => (
                  <div key={s.label} style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px'}}>
                    <span style={{width:'56px',fontSize:'11px',color:'var(--ho-text-secondary)',flexShrink:0}}>{s.label}</span>
                    <input type="range" min={s.min} max={s.max} value={s.value as number} onChange={e=>setParams({[s.key]: Number(e.target.value)})} style={{flex:1,height:'4px',accentColor:'var(--ho-accent)'}} />
                    <span style={{width:'36px',fontSize:'10px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',textAlign:'right'}}>{s.value as number}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab==='curve' && (
              <div>
                <div style={{display:'flex',gap:'4px',marginBottom:'12px'}}>
                  {(['RGB','R','G','B'] as const).map(ch => (
                    <button key={ch} onClick={()=>setCurveChannel(ch.toLowerCase() as 'rgb'|'r'|'g'|'b')} style={{
                      flex:1,height:'24px',borderRadius:'4px',fontSize:'11px',
                      backgroundColor:curveChannel===ch.toLowerCase()?'var(--ho-accent-bg)':'rgba(255,255,255,0.04)',
                      color:curveChannel===ch.toLowerCase()?'var(--ho-accent)':'var(--ho-text-secondary)'
                    }}>{ch}</button>
                  ))}
                </div>
                <div style={{height:'160px',backgroundColor:'var(--ho-bg-tertiary)',borderRadius:'var(--ho-radius-sm)',position:'relative',overflow:'hidden',marginBottom:'12px'}}>
                  <svg width='100%' height='100%' style={{position:'absolute'}}>
                    <defs><pattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'><path d='M 20 0 L 0 0 0 20' fill='none' stroke='rgba(255,255,255,0.06)' strokeWidth='0.5'/></pattern></defs>
                    <rect width='100%' height='100%' fill='url(#grid)'/>
                    <line x1='0' y1='160' x2='160' y2='0' stroke='var(--ho-border)' strokeWidth='1' strokeDasharray='4,4'/>
                    <path d='M 0,160 Q 40,120 80,80 Q 120,40 160,0' stroke='var(--ho-accent)' strokeWidth='1.5' fill='none'/>
                    <circle cx='80' cy='80' r='3' fill='#fff' stroke='var(--ho-accent)' strokeWidth='1'/>
                    <circle cx='0' cy='160' r='4' fill='var(--ho-accent)'/>
                    <circle cx='160' cy='0' r='4' fill='var(--ho-accent)'/>
                  </svg>
                </div>
              </div>
            )}

            {activeTab==='hsl' && (
              <div>
                <div style={{display:'flex',gap:'12px',justifyContent:'center',marginBottom:'16px'}}>
                  {[['高光','h'],['中间调','m'],['阴影','s']].map(([label]) => (
                    <div key={label} style={{textAlign:'center'}}>
                      <canvas width={80} height={80} style={{borderRadius:'50%',border:'2px solid var(--ho-border)'}} />
                      <div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginTop:'4px'}}>{label}</div>
                    </div>
                  ))}
                </div>
                {['H 偏移','S 偏移','L 偏移'].map(label => (
                  <div key={label} style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px'}}>
                    <span style={{width:'56px',fontSize:'11px',color:'var(--ho-text-secondary)'}}>{label}</span>
                    <input type='range' min={-180} max={180} defaultValue={0} style={{flex:1,height:'4px',accentColor:'var(--ho-accent)'}} />
                    <span style={{width:'36px',fontSize:'10px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',textAlign:'right'}}>0</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab==='lut' && (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'16px'}}>
                  {LUT_PRESETS.map((lut,i) => (
                    <div key={lut} onClick={()=>setLutSelected(i)} style={{padding:'12px 4px',borderRadius:'var(--ho-radius-sm)',cursor:'pointer',textAlign:'center',border:lutSelected===i?'2px solid var(--ho-accent)':'1px solid var(--ho-border)',backgroundColor:lutSelected===i?'var(--ho-accent-bg)':'rgba(255,255,255,0.02)'}}>
                      <div style={{height:'36px',backgroundColor:'#2a2a2a',borderRadius:'4px',marginBottom:'4px'}} />
                      <div style={{fontSize:'10px',color:'var(--ho-text-secondary)'}}>{lut}</div>
                    </div>
                  ))}
                </div>
                <Button variant="default" style={{width:'100%'}} onClick={handleLutImport}>+ 导入自定义 LUT</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
