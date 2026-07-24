import { useState, useRef, useEffect, useCallback } from 'react'
import { Toggle } from '../ui/Toggle'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { useColorStore } from '../../stores/colorStore'
import { ColorGrade } from '../../lib/color/ColorGrade'
import { Vectorscope, Waveform, Histogram } from '../../lib/color/Scopes'
import { parseLUT, applyLUT } from '../../lib/color/LUTParser'
import type { ColorGradeParams } from '@shared/types'

const PRESETS = ['默认','电影','复古','黑白','日系','赛博','胶片','HDR模拟','梦幻','冷峻']
const LUT_PRESETS = ['电影冷调','复古暖调','高对比','黑白经典','日系清新','赛博朋克']

export function ColorPanel() {
  const { params, activeTab, splitView, setParams, setSplitView, setActiveTab, undo, redo, setActiveLUT, activeLUT } = useColorStore()
  const [curveChannel, setCurveChannel] = useState<'rgb'|'r'|'g'|'b'>('rgb')
  const [lutSelected, setLutSelected] = useState(0)
  const [lutOpacity, setLutOpacity] = useState(100)
  const [selectedThumb, setSelectedThumb] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scopeVecRef = useRef<HTMLCanvasElement>(null)
  const scopeWavRef = useRef<HTMLCanvasElement>(null)
  const scopeHistRef = useRef<HTMLCanvasElement>(null)
  const gradeRef = useRef<ColorGrade | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || gradeRef.current) return
    try {
      gradeRef.current = new ColorGrade(canvas)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#222'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#7a9ec4'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('监看窗口', canvas.width / 2, canvas.height / 2)
      }
    } catch {}
    return () => { gradeRef.current?.destroy(); gradeRef.current = null }
  }, [])

  useEffect(() => {
    gradeRef.current?.setParams(params)
  }, [params])

  useEffect(() => {
    try {
      const v = scopeVecRef.current
      if (v) {
        const ctx = v.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, v.width, v.height)
          ctx.fillStyle = '#0d1117'
          ctx.fillRect(0, 0, v.width, v.height)
          ctx.strokeStyle = 'rgba(122,158,196,0.3)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(v.width/2, v.height/2, v.width/2-12, 0, Math.PI*2)
          ctx.stroke()
          ctx.fillStyle = 'rgba(122,158,196,0.5)'
          ctx.font = '9px sans-serif'
          ctx.textAlign = 'center'
          const labels = [['R',0],['G',2],['B',4],['C',1],['M',3],['Y',5]]
          labels.forEach(([l,i]) => {
            const a = (i as number) * Math.PI / 3
            ctx.fillText(l as string, v.width/2+Math.cos(a)*(v.width/2-8), v.height/2+Math.sin(a)*(v.height/2-8))
          })
        }
      }
    } catch {}
  }, [])

  const handleLutImport = async () => {
    const api = (window as any).electronAPI
    if (!api) return
    const files = await api.dialog.openFile({
      title: '导入LUT文件',
      filters: [{ name:'LUT文件', extensions:['cube','3dl','csp'] }]
    })
    if (files?.[0]) {
      try {
        const text = await api.fs.readTextFile(files[0])
        const name = files[0].split(/[/\\]/).pop() || 'custom'
        const lutData = parseLUT(name, text)
        setActiveLUT({ id:'custom', name, fileName:name, colorSpace:'Rec709', data:lutData } as any)
      } catch (e) {
        console.error('LUT parse failed:', e)
      }
    }
  }

  const ft = (s: number) =>
    `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}:${String(Math.floor(s*30%30)).padStart(2,'0')}`

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ height:40, borderBottom:'1px solid var(--ho-border)', display:'flex', alignItems:'center', padding:'0 8px', gap:6, flexShrink:0 }}>
        <Icon name="back" size={14} color="var(--ho-text-secondary)" />
        <span style={{ fontSize:11, color:'var(--ho-text-secondary)' }}>返回</span>
        <div style={{ width:1, height:16, backgroundColor:'var(--ho-border)' }} />
        <Toggle checked={splitView} onChange={setSplitView} />
        <span style={{ fontSize:10, color:'var(--ho-text-secondary)' }}>分屏</span>
        <select onChange={e => { const idx=e.target.selectedIndex-1; if(idx>=0) console.log('preset:',PRESETS[idx]) }} style={{ height:24, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:10, padding:'0 6px', outline:'none' }}>
          <option>预设...</option>
          {PRESETS.map(p => <option key={p}>{p}</option>)}
        </select>
        <Button variant="ghost" style={{ fontSize:11 }} onClick={() => setParams({ exposure:0, contrast:0, saturation:1, highlights:0, shadows:0, temperature:6500, tint:0, vibrance:0, lift:{r:0,g:0,b:0}, gamma:{r:1,g:1,b:1}, gain:{r:1,g:1,b:1} } as any)}>重置</Button>
        <Button variant="ghost" style={{ fontSize:11 }} onClick={undo}>撤销</Button>
        <Button variant="ghost" style={{ fontSize:11 }} onClick={redo}>重做</Button>
        <div style={{ flex:1 }} />
        <Icon name="screenshot" size={14} color="var(--ho-text-secondary)" />
        <span style={{ fontSize:10, color:'var(--ho-text-secondary)', marginLeft:4 }}>截图</span>
        <Icon name="export" size={14} color="var(--ho-text-secondary)" />
        <span style={{ fontSize:10, color:'var(--ho-text-secondary)', marginLeft:4 }}>导出LUT</span>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ flex:1, backgroundColor:'var(--ho-bg-primary)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <canvas ref={canvasRef} width={800} height={450} style={{ maxWidth:'100%', maxHeight:'100%', backgroundColor:'#000', borderRadius:4 }} />
            {splitView && <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:2, backgroundColor:'var(--ho-accent)', cursor:'col-resize', zIndex:5 }} />}
            <div style={{ position:'absolute', bottom:8, left:12, fontFamily:'var(--ho-font-family-mono)', color:'var(--ho-accent)', fontSize:10 }}>{ft(15)}</div>
            <div style={{ position:'absolute', bottom:8, right:12, fontSize:10, color:'var(--ho-text-tertiary)' }}>1920x1080 - 30fps</div>
          </div>
          <div style={{ height:60, borderTop:'1px solid var(--ho-border)', display:'flex', alignItems:'center', padding:'0 12px', gap:8, backgroundColor:'var(--ho-bg-secondary)' }}>
            <canvas ref={scopeVecRef} width={120} height={44} style={{ height:44, backgroundColor:'rgba(0,0,0,0.3)', borderRadius:4 }} />
            <canvas ref={scopeWavRef} width={160} height={44} style={{ height:44, backgroundColor:'rgba(0,0,0,0.3)', borderRadius:4 }} />
            <canvas ref={scopeHistRef} width={80} height={44} style={{ height:44, backgroundColor:'rgba(0,0,0,0.3)', borderRadius:4 }} />
          </div>
          <div style={{ height:48, borderTop:'1px solid var(--ho-border)', display:'flex', alignItems:'center', gap:8, padding:'0 12px', overflowX:'auto', flexShrink:0 }}>
            {['开场镜头','产品展示','结尾','叠加素材','Logo','字幕条'].map((t,i) => (
              <div key={t} onClick={()=>setSelectedThumb(i)} style={{ width:64, height:36, borderRadius:4, cursor:'pointer', flexShrink:0, backgroundColor:'#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', border:selectedThumb===i?'2px solid var(--ho-accent)':'2px solid transparent', fontSize:8, color:'var(--ho-text-tertiary)' }}>{t}</div>
            ))}
          </div>
        </div>

        <div style={{ width:320, borderLeft:'1px solid var(--ho-border)', display:'flex', flexDirection:'column', flexShrink:0, backgroundColor:'var(--ho-bg-secondary)' }}>
          <div style={{ display:'flex', borderBottom:'1px solid var(--ho-border)' }}>
            {(['基础校色','曲线','色轮HSL','LUT'] as const).map(t => (
              <button key={t} onClick={()=>setActiveTab(t==='基础校色'?'basic':t==='曲线'?'curve':t==='色轮HSL'?'hsl':'lut')} style={{
                flex:1, height:32, fontSize:11, cursor:'pointer',
                color:activeTab===(t==='基础校色'?'basic':t==='曲线'?'curve':t==='色轮HSL'?'hsl':'lut')?'var(--ho-accent)':'var(--ho-text-secondary)',
                backgroundColor:activeTab===(t==='基础校色'?'basic':t==='曲线'?'curve':t==='色轮HSL'?'hsl':'lut')?'var(--ho-accent-bg)':'transparent',
                borderBottom:activeTab===(t==='基础校色'?'basic':t==='曲线'?'curve':t==='色轮HSL'?'hsl':'lut')?'2px solid var(--ho-accent)':'2px solid transparent'
              }}>{t}</button>
            ))}
          </div>

          <div style={{ flex:1, overflow:'auto', padding:12 }}>
            {activeTab==='basic' && (
              <div>
                <canvas width={140} height={140} style={{ display:'block', margin:'0 auto 16px', borderRadius:'50%', border:'2px solid var(--ho-border)' }} />
                {[
                  {label:'曝光',key:'exposure' as keyof ColorGradeParams, min:-100, max:100},
                  {label:'对比度',key:'contrast' as keyof ColorGradeParams, min:-100, max:100},
                  {label:'高光',key:'highlights' as keyof ColorGradeParams, min:-100, max:100},
                  {label:'阴影',key:'shadows' as keyof ColorGradeParams, min:-100, max:100},
                  {label:'饱和度',key:'saturation' as keyof ColorGradeParams, min:-100, max:100},
                  {label:'色温',key:'temperature' as keyof ColorGradeParams, min:-100, max:100},
                  {label:'色调',key:'tint' as keyof ColorGradeParams, min:-100, max:100}
                ].map(s => (
                  <div key={s.label} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    <span style={{ width:50, fontSize:11, color:'var(--ho-text-secondary)', flexShrink:0 }}>{s.label}</span>
                    <input type="range" min={s.min} max={s.max} value={Number(params[s.key])||0} onChange={e=>setParams({[s.key]: Number(e.target.value)})} style={{ flex:1, height:4, accentColor:'var(--ho-accent)' }} />
                    <span style={{ width:32, fontSize:10, fontFamily:'var(--ho-font-family-mono)', color:'var(--ho-accent)', textAlign:'right' }}>{Number(params[s.key])||0}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab==='curve' && (
              <div>
                <div style={{ display:'flex', gap:4, marginBottom:12 }}>
                  {(['RGB','R','G','B'] as const).map(ch => (
                    <button key={ch} onClick={()=>setCurveChannel(ch.toLowerCase() as 'rgb'|'r'|'g'|'b')} style={{
                      flex:1, height:24, borderRadius:4, fontSize:11, cursor:'pointer',
                      backgroundColor:curveChannel===ch.toLowerCase()?'var(--ho-accent-bg)':'rgba(255,255,255,0.04)',
                      color:curveChannel===ch.toLowerCase()?'var(--ho-accent)':'var(--ho-text-secondary)',
                      border:'none'
                    }}>{ch}</button>
                  ))}
                </div>
                <div style={{ height:160, backgroundColor:'var(--ho-bg-tertiary)', borderRadius:'var(--ho-radius-sm)', position:'relative', overflow:'hidden' }}>
                  <svg width='100%' height='100%' style={{ position:'absolute' }}>
                    <defs><pattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'><path d='M 20 0 L 0 0 0 20' fill='none' stroke='rgba(255,255,255,0.06)' strokeWidth='0.5'/></pattern></defs>
                    <rect width='100%' height='100%' fill='url(#grid)'/>
                    <line x1='0' y1='160' x2='160' y2='0' stroke='var(--ho-border)' strokeWidth='1' strokeDasharray='4,4'/>
                    <path d='M 0,160 Q 40,120 80,80 Q 120,40 160,0' stroke='var(--ho-accent)' strokeWidth='1.5' fill='none'/>
                  </svg>
                </div>
              </div>
            )}

            {activeTab==='hsl' && (
              <div>
                <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:16 }}>
                  {['高光','中间调','阴影'].map(label => (
                    <div key={label} style={{ textAlign:'center' }}>
                      <canvas width={80} height={80} style={{ borderRadius:'50%', border:'2px solid var(--ho-border)' }} />
                      <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginTop:4 }}>{label}</div>
                    </div>
                  ))}
                </div>
                {['H偏移','S偏移','L偏移'].map(label => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    <span style={{ width:50, fontSize:11, color:'var(--ho-text-secondary)' }}>{label}</span>
                    <input type="range" min={-180} max={180} value={0} style={{ flex:1, height:4, accentColor:'var(--ho-accent)' }} />
                    <span style={{ width:32, fontSize:10, fontFamily:'var(--ho-font-family-mono)', color:'var(--ho-accent)', textAlign:'right' }}>0</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab==='lut' && (
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
                  {LUT_PRESETS.map((lut,i) => (
                    <div key={lut} onClick={()=>{setLutSelected(i)}} style={{ padding:'12px 4px', borderRadius:'var(--ho-radius-sm)', cursor:'pointer', textAlign:'center', border:lutSelected===i?'2px solid var(--ho-accent)':'1px solid var(--ho-border)', backgroundColor:lutSelected===i?'var(--ho-accent-bg)':'rgba(255,255,255,0.02)' }}>
                      <div style={{ height:36, backgroundColor:'#2a2a2a', borderRadius:4, marginBottom:4 }} />
                      <div style={{ fontSize:10, color:'var(--ho-text-secondary)' }}>{lut}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:11, color:'var(--ho-text-secondary)' }}>强度</span>
                  <input type="range" min={0} max={100} value={lutOpacity} onChange={e=>setLutOpacity(Number(e.target.value))} style={{ flex:1, height:4, accentColor:'var(--ho-accent)' }} />
                  <span style={{ fontSize:10, fontFamily:'var(--ho-font-family-mono)', color:'var(--ho-accent)', width:24, textAlign:'right' }}>{lutOpacity}</span>
                </div>
                <Button variant="default" style={{ width:'100%', fontSize:11 }} onClick={handleLutImport}><Icon name="plus" size={12} /> 导入自定义LUT</Button>
                {activeLUT && <div style={{ marginTop:8, fontSize:10, color:'var(--ho-accent)', textAlign:'center' }}>已加载: {activeLUT.name}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
