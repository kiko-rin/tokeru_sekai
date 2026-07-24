import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Icon } from '../ui/Icon'
import { useTimelineStore } from '../../stores/timelineStore'
import { useDragDrop } from '../../hooks/useDragDrop'

const TRACK_COLORS: Record<string,string> = { V1:'#6a8aaa', V2:'#7a9a6a', V3:'#8a7aaa', A1:'#aa8a6a', A2:'#8a6a8a' }
const TRACK_KEYS = ['V1','V2','V3','A1','A2']
const CLIPS = [
  { track:'V1',name:'开场镜头',start:0.5,dur:5.4 },{ track:'V1',name:'产品展示',start:6.2,dur:9.0 },
  { track:'V1',name:'结尾',start:22.5,dur:7.5 },{ track:'V2',name:'叠加素材',start:4.2,dur:6.0 },
  { track:'V2',name:'Logo',start:21.0,dur:3.0 },{ track:'V3',name:'字幕条',start:1.5,dur:26.0 },
  { track:'A1',name:'主音频',start:0,dur:29.0 },{ track:'A2',name:'背景音乐',start:1.5,dur:27.0 }
]
const TOTAL = 30

export function EditorPanel() {
  const { currentTime, playing, selectedClipId, setCurrentTime, setPlaying, selectClip } = useTimelineStore()
  const [propsTab, setPropsTab] = useState<'metadata'|'properties'>('metadata')
  const [zoom, setZoom] = useState(60)
  const [snap, setSnap] = useState(true)
  const { onDrop, onDragOver } = useDragDrop()

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      const t = useTimelineStore.getState().currentTime + 1/30
      useTimelineStore.getState().setCurrentTime(t >= TOTAL ? 0 : t)
    }, 33)
    return () => clearInterval(id)
  }, [playing])

  const ft = (s: number) =>
    `${String(Math.floor((s%3600)/60)).padStart(2,'0')} : ${String(Math.floor(s%60)).padStart(2,'0')} : ${String(Math.floor(s*30%30)).padStart(2,'0')}`

  const seek = (d: number) => setCurrentTime(Math.max(0,Math.min(TOTAL,currentTime+d)))

  return (
    <div style={{ flex:1, display:'flex', overflow:'hidden', backgroundColor:'var(--ho-bg-primary)' }}>
      {/* LEFT PANEL - 299px */}
      <div style={{ width:299, flexShrink:0, display:'flex', flexDirection:'column', borderRight:'1px solid var(--ho-border)', backgroundColor:'var(--ho-bg-secondary)' }}>
        {/* 素材库 top half */}
        <div style={{ flex:1, overflow:'auto', padding:16, borderBottom:'1px solid var(--ho-border)' }}>
          <Input placeholder="搜索素材..." style={{ fontSize:11, marginBottom:12, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:6, color:'var(--ho-text-primary)', height:30, padding:'0 8px', outline:'none' }} />
          <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
            {['全部','视频','图片','音频'].map(f => (
              <button key={f} style={{ padding:'3px 14px', borderRadius:12, fontSize:11, backgroundColor:'rgba(255,255,255,0.04)', color:'var(--ho-text-secondary)', border:'1px solid var(--ho-border)', cursor:'pointer' }}>{f}</button>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { n:'城市航拍.mp4',d:'00:15' },{ n:'日落延时.mp4',d:'00:08' },
              { n:'公园全景.mp4',d:'00:12' },{ n:'夜景灯光.mp4',d:'00:20' }
            ].map(m => (
              <div key={m.n} style={{ cursor:'pointer' }}>
                <div style={{ aspectRatio:'16/9', backgroundColor:'var(--ho-bg-tertiary)', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:4 }}>
                  <span style={{ fontSize:10, color:'var(--ho-text-tertiary)' }}>{m.d}</span>
                </div>
                <div style={{ fontSize:11, color:'var(--ho-text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.n}</div>
              </div>
            ))}
          </div>
        </div>
        {/* 字幕样式库 bottom half */}
        <div style={{ flex:1, overflow:'auto', padding:16 }}>
          <div style={{ fontSize:11, color:'var(--ho-text-tertiary)', marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>字幕 / 特效</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {['溶解','擦除','推拉','缩放','翻转','百叶窗'].map(t => (
              <div key={t} style={{ padding:'14px 8px', borderRadius:6, border:'1px solid var(--ho-border)', textAlign:'center', cursor:'pointer', fontSize:11, color:'var(--ho-text-secondary)' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* ROW 1: 实时监看 flex-1 | 元数据 261px */}
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <div style={{ width:'90%', aspectRatio:'16/9', backgroundColor:'#000', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:14, color:'var(--ho-text-tertiary)' }}>实时监看</span>
            </div>
            <div style={{ position:'absolute', bottom:16, left:20, fontFamily:'var(--ho-font-family-mono)', color:'var(--ho-accent)', fontSize:13 }}>{ft(currentTime)}</div>
            <div style={{ position:'absolute', bottom:16, right:20, fontSize:12, color:'var(--ho-text-tertiary)' }}>1920x1080 - 30fps</div>
          </div>
          <div style={{ width:261, flexShrink:0, borderLeft:'1px solid var(--ho-border)', display:'flex', flexDirection:'column', backgroundColor:'var(--ho-bg-secondary)' }}>
            <div style={{ display:'flex' }}>
              {['元数据','属性'].map(t => (
                <button key={t} onClick={()=>setPropsTab(t==='元数据'?'metadata':'properties')} style={{
                  flex:1, height:34, fontSize:12, cursor:'pointer',
                  color:propsTab===t?'var(--ho-accent)':'var(--ho-text-secondary)',
                  backgroundColor:propsTab===t?'var(--ho-accent-bg)':'transparent',
                  borderBottom:propsTab===t?'2px solid var(--ho-accent)':'2px solid transparent'
                }}>{t}</button>
              ))}
            </div>
            <div style={{ flex:1, overflow:'auto', padding:16 }}>
              {propsTab==='metadata' ? (
                <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:11 }}>
                  {[['文件名','开场镜头.mp4'],['分辨率','1920x1080'],['帧率','30 fps'],['编解码器','H.264'],['时长','0:00:05:00'],['文件大小','24.5 MB'],['色彩空间','Rec.709']].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid var(--ho-border)' }}>
                      <span style={{ color:'var(--ho-text-tertiary)' }}>{k}</span>
                      <span style={{ color:'var(--ho-text-primary)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize:11, color:'var(--ho-text-tertiary)' }}>变换参数</div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: 时间线工具 57px */}
        <div style={{ height:57, flexShrink:0, borderTop:'1px solid var(--ho-border)', display:'flex', alignItems:'center', padding:'0 16px', gap:6, backgroundColor:'var(--ho-bg-secondary)' }}>
          <Icon name="magnet" size={16} color={snap?'var(--ho-accent)':'var(--ho-text-secondary)'} onClick={()=>setSnap(!snap)} />
          <span style={{ fontSize:11, color:'var(--ho-text-secondary)', marginRight:12 }}>磁吸</span>
          <Icon name="razor" size={16} color="var(--ho-text-secondary)" />
          <span style={{ fontSize:11, color:'var(--ho-text-secondary)', marginRight:12 }}>切刀</span>
          <div style={{ flex:1 }} />
          <Icon name="prev" size={14} color="var(--ho-text-secondary)" onClick={()=>seek(-5)} />
          <Icon name="prev-frame" size={14} color="var(--ho-text-secondary)" onClick={()=>seek(-1/30)} />
          <div onClick={()=>setPlaying(!playing)} style={{ width:24, height:24, backgroundColor:'var(--ho-accent)', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <Icon name={playing?'pause':'play'} size={14} color="#0e1318" />
          </div>
          <Icon name="next-frame" size={14} color="var(--ho-text-secondary)" onClick={()=>seek(1/30)} />
          <Icon name="next" size={14} color="var(--ho-text-secondary)" onClick={()=>seek(5)} />
          <div style={{ fontFamily:'var(--ho-font-family-mono)', fontSize:20, color:'var(--ho-text-primary)', marginLeft:12, letterSpacing:3 }}>{ft(currentTime)}</div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4 }}>
            <Icon name="plus" size={14} color="var(--ho-accent)" />
            <Icon name="split" size={14} color="var(--ho-accent)" />
            <Icon name="flag" size={14} color="var(--ho-accent)" />
            <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:12 }}>
              <svg width={120} height={12} viewBox="0 0 120 12" style={{ cursor:'pointer' }}>
                <line x1={0} y1={6} x2={120} y2={6} stroke="var(--ho-border)" strokeWidth={2} strokeLinecap="round" />
                <circle cx={zoom/200*120} cy={6} r={6} fill="#fff" stroke="var(--ho-border)" strokeWidth={1} />
              </svg>
              <span style={{ fontSize:11, fontFamily:'var(--ho-font-family-mono)', color:'var(--ho-accent)', width:30, textAlign:'right' }}>{zoom}%</span>
            </div>
          </div>
        </div>

        {/* ROW 3: 时间线 flex-1 | 音频响度 130px */}
        <div style={{ flex:1, display:'flex', overflow:'hidden', borderTop:'1px solid var(--ho-border)' }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ display:'flex', height:32, flexShrink:0, borderBottom:'1px solid var(--ho-border)' }}>
              <div style={{ width:80, flexShrink:0, borderRight:'1px solid var(--ho-border)', backgroundColor:'var(--ho-bg-secondary)' }} />
              <div style={{ flex:1, position:'relative', overflow:'hidden', backgroundColor:'var(--ho-bg-primary)' }}>
                {Array.from({length:TOTAL+1}).map((_,s) => (
                  <div key={s} style={{ position:'absolute', left:`${(s/TOTAL)*100}%`, top:0, bottom:0, borderLeft:s%5===0?'1px solid rgba(255,255,255,0.12)':'1px solid var(--ho-border)' }}>
                    {s%5===0 && <span style={{ fontSize:9, color:'var(--ho-text-tertiary)', paddingLeft:3, whiteSpace:'nowrap' }}>{s}s</span>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex:1, position:'relative', overflow:'auto' }} onDrop={onDrop(d=>console.log(d))} onDragOver={onDragOver}>
              {Array.from({length:5}).map((_,i) => (
                <div key={i} style={{ height:40, borderBottom:'1px solid var(--ho-border)' }} />
              ))}
              {CLIPS.map((c,i) => {
                const idx = TRACK_KEYS.indexOf(c.track)
                return (
                  <div key={i} onClick={()=>selectClip(c.name)} style={{
                    position:'absolute', top:`${idx*40+4}px`, left:`${(c.start/TOTAL)*100}%`,
                    width:`${(c.dur/TOTAL)*100}%`, height:32, borderRadius:4,
                    backgroundColor:`${TRACK_COLORS[c.track]}18`, borderLeft:`3px solid ${TRACK_COLORS[c.track]}`,
                    border:selectedClipId===c.name?'1px solid var(--ho-accent)':'none',
                    display:'flex', alignItems:'center', padding:'0 8px', cursor:'pointer', zIndex:1
                  }}>
                    <span style={{ fontSize:10, color:'var(--ho-text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</span>
                  </div>
                )
              })}
              <div style={{ position:'absolute', left:`${(currentTime/TOTAL)*100}%`, top:0, bottom:0, width:2, backgroundColor:'var(--ho-accent)', zIndex:10, transition:'left 0.1s' }}>
                <div style={{ width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderTop:'10px solid var(--ho-accent)', margin:'0 auto' }} />
              </div>
            </div>
          </div>

          {/* 音频响度面板 - 130px */}
          <div style={{ width:130, flexShrink:0, borderLeft:'1px solid var(--ho-border)', display:'flex', backgroundColor:'var(--ho-bg-secondary)' }}>
            <div style={{ width:65, display:'flex', flexDirection:'column', alignItems:'center', borderRight:'1px solid var(--ho-border)' }}>
              <select style={{ width:36, marginTop:12, height:22, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:3, fontSize:8, color:'var(--ho-text-secondary)', padding:'0 2px', outline:'none' }}>
                <option>Bus</option>
              </select>
              <div style={{ flex:1, width:28, margin:'8px 0', backgroundColor:'rgba(255,255,255,0.04)', borderRadius:4, display:'flex', overflow:'hidden' }}>
                <div style={{ flex:1, background:'linear-gradient(to top, var(--ho-safe), var(--ho-warning), var(--ho-peak))' }} />
                <div style={{ flex:1, background:'linear-gradient(to top, var(--ho-safe), var(--ho-warning), var(--ho-peak))' }} />
              </div>
              <input type="range" min={0} max={100} defaultValue={80} style={{ width:40, height:3, accentColor:'var(--ho-accent)', marginBottom:8 }} />
            </div>
            <div style={{ width:65, display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'8px 0' }}>
                {['0','-6','-12','-18','-24','-30','-inf'].map(l => (
                  <span key={l} style={{ fontSize:7, color:'var(--ho-text-tertiary)', textAlign:'center' }}>{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
