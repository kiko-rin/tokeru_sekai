import { useState, useEffect, useCallback } from 'react'
import { Input } from '../ui/Input'
import { Icon } from '../ui/Icon'
import { useTimelineStore } from '../../stores/timelineStore'
import { useDragDrop } from '../../hooks/useDragDrop'

const TRACK_COLORS: Record<string,string> = { V1:'var(--ho-track-v1)', V2:'var(--ho-track-v2)', V3:'var(--ho-track-v3)', A1:'var(--ho-track-a1)', A2:'var(--ho-track-a2)' }
const TRACK_KEYS = ['V1','V2','V3','A1','A2']
const TOTAL = 30
const LEFT_W = 299

export function EditorPanel() {
  const { currentTime, playing, selectedClipId, tracks, setCurrentTime, setPlaying, selectClip, setTracks } = useTimelineStore()
  const [propsTab, setPropsTab] = useState<'metadata'|'properties'>('metadata')
  const [zoom, setZoom] = useState(60)
  const [snap, setSnap] = useState(true)
  const { onDrop, onDragOver } = useDragDrop()

  useEffect(() => {
    if (tracks.length > 0) return
    setTracks([
      { id:'t1', name:'V1', type:'video' as const, muted:false, locked:false, clips:[
        { id:'c1', name:'开场镜头', filePath:'', duration:5.4, start:0.5, trackId:'t1', width:1920, height:1080, fps:30, codec:'H264' as any, colorSpace:'Rec709' as any, colorDepth:8 as any, chromaSubsampling:'YUV420' as any },
        { id:'c2', name:'产品展示', filePath:'', duration:9.0, start:6.2, trackId:'t1', width:1920, height:1080, fps:30, codec:'H264' as any, colorSpace:'Rec709' as any, colorDepth:8 as any, chromaSubsampling:'YUV420' as any },
        { id:'c3', name:'结尾', filePath:'', duration:7.5, start:22.5, trackId:'t1', width:1920, height:1080, fps:30, codec:'H264' as any, colorSpace:'Rec709' as any, colorDepth:8 as any, chromaSubsampling:'YUV420' as any }
      ]},
      { id:'t2', name:'V2', type:'video' as const, muted:false, locked:false, clips:[] },
      { id:'t3', name:'V3', type:'video' as const, muted:false, locked:false, clips:[] },
      { id:'t4', name:'A1', type:'audio' as const, muted:false, locked:false, clips:[] },
      { id:'t5', name:'A2', type:'audio' as const, muted:false, locked:false, clips:[] }
    ])
  }, [tracks, setTracks])

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

  const seek = (d: number) => setCurrentTime(Math.max(0, Math.min(TOTAL, currentTime + d)))

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCurrentTime(((e.clientX - rect.left) / rect.width) * TOTAL)
  }, [setCurrentTime])

  const clipsData = tracks.length > 0
    ? tracks.flatMap(t => t.clips.map(c => ({ track:t.name, name:c.name, start:c.start, dur:c.duration })))
    : []

  const metaFile = selectedClipId
    ? (clipsData.find(c => c.name === selectedClipId)?.name || '开场镜头.mp4')
    : '开场镜头.mp4'

  return (
    <div style={{ flex:1, display:'flex', overflow:'hidden', backgroundColor:'var(--ho-bg-primary)' }}>
      {/* LEFT: 素材库 + 字幕样式 */}
      <div style={{ width:LEFT_W, flexShrink:0, display:'flex', flexDirection:'column', borderRight:'1px solid var(--ho-border)', backgroundColor:'var(--ho-bg-secondary)' }}>
        <div style={{ flex:1, overflow:'auto', padding:16, borderBottom:'1px solid var(--ho-border)' }}>
          <Input placeholder="搜索素材..." style={{ fontSize:11, height:30, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:6, color:'var(--ho-text-primary)', padding:'0 8px', outline:'none' }} />
        </div>
        <div style={{ flex:1, overflow:'auto', padding:16 }}>
          <div style={{ fontSize:11, color:'var(--ho-text-tertiary)', marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>字幕 / 特效</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {['溶解','擦除','推拉','缩放','翻转','百叶窗'].map(t => (
              <div key={t} style={{ padding:'14px 8px', borderRadius:6, border:'1px solid var(--ho-border)', textAlign:'center', cursor:'pointer', fontSize:11, color:'var(--ho-text-secondary)' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* ROW 1: MONITOR + METADATA */}
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <div style={{ width:'88%', aspectRatio:'16/9', backgroundColor:'#000', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:13, color:'var(--ho-text-tertiary)' }}>实时监看</span>
            </div>
            <div style={{ position:'absolute', bottom:16, left:20, fontFamily:'var(--ho-font-family-mono)', color:'var(--ho-accent)', fontSize:13 }}>{ft(currentTime)}</div>
            <div style={{ position:'absolute', bottom:16, right:20, fontSize:12, color:'var(--ho-text-tertiary)' }}>1920x1080 - 30fps</div>
          </div>
          {/* 元数据面板 261px */}
          <div style={{ width:261, flexShrink:0, borderLeft:'1px solid var(--ho-border)', display:'flex', flexDirection:'column', backgroundColor:'var(--ho-bg-secondary)' }}>
            <div style={{ display:'flex' }}>
              {['元数据','属性'].map(t => (
                <button key={t} onClick={()=>setPropsTab(t==='元数据'?'metadata':'properties')} style={{
                  flex:1, height:34, fontSize:12, cursor:'pointer',
                  color:propsTab===(t==='元数据'?'metadata':'properties')?'var(--ho-accent)':'var(--ho-text-secondary)',
                  backgroundColor:propsTab===(t==='元数据'?'metadata':'properties')?'var(--ho-accent-bg)':'transparent',
                  borderBottom:propsTab===(t==='元数据'?'metadata':'properties')?'2px solid var(--ho-accent)':'2px solid transparent'
                }}>{t}</button>
              ))}
            </div>
            <div style={{ flex:1, overflow:'auto', padding:16 }}>
              {propsTab==='metadata' ? (
                <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:11 }}>
                  {[['文件名',metaFile],['分辨率','1920x1080'],['帧率','30 fps'],['编解码器','H.264'],['时长','0:00:05:00'],['文件大小','24.5 MB'],['色彩空间','Rec.709']].map(([k,v]) => (
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

        {/* 底部音频控制条 28px */}
        <div style={{ height:28, borderTop:'1px solid var(--ho-border)', borderBottom:'1px solid var(--ho-border)', display:'flex', alignItems:'center', padding:'0 12px', gap:8, backgroundColor:'var(--ho-bg-secondary)', flexShrink:0 }}>
          <div style={{ flex:1, height:14, backgroundColor:'rgba(255,255,255,0.04)', borderRadius:7, overflow:'hidden', display:'flex' }}>
            <div style={{ width:`${(currentTime/TOTAL)*100}%`, height:'100%', background:'linear-gradient(90deg, var(--ho-safe), var(--ho-warning), var(--ho-peak))', transition:'width 0.1s' }} />
          </div>
          <div style={{ width:8, height:20, background:'linear-gradient(to top, var(--ho-safe), var(--ho-warning), var(--ho-peak))', borderRadius:2 }} />
          <div style={{ width:8, height:20, background:'linear-gradient(to top, var(--ho-safe), var(--ho-warning), var(--ho-peak))', borderRadius:2 }} />
          <Icon name="mute" size={12} color="var(--ho-text-tertiary)" />
          <Icon name="solo" size={12} color="var(--ho-text-tertiary)" />
        </div>

        {/* ROW 2: TOOLBAR 57px */}
        <div style={{ height:57, flexShrink:0, display:'flex', alignItems:'center', padding:'0 16px', gap:6, backgroundColor:'var(--ho-bg-secondary)' }}>
          <Icon name="magnet" size={18} color={snap?'var(--ho-accent)':'var(--ho-text-secondary)'} onClick={()=>setSnap(!snap)} />
          <span style={{ fontSize:11, color:'var(--ho-text-secondary)', marginRight:16 }}>磁吸</span>
          <Icon name="razor" size={18} color="var(--ho-text-secondary)" />
          <span style={{ fontSize:11, color:'var(--ho-text-secondary)', marginRight:16 }}>切刀</span>
          <div style={{ flex:1 }} />
          <Icon name="prev" size={16} color="var(--ho-text-secondary)" onClick={()=>seek(-5)} />
          <Icon name="prev-frame" size={16} color="var(--ho-text-secondary)" onClick={()=>seek(-1/30)} />
          <div onClick={()=>setPlaying(!playing)} style={{ width:28, height:28, backgroundColor:'var(--ho-accent)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <Icon name={playing?'pause':'play'} size={16} color="#0e1318" />
          </div>
          <Icon name="next-frame" size={16} color="var(--ho-text-secondary)" onClick={()=>seek(1/30)} />
          <Icon name="next" size={16} color="var(--ho-text-secondary)" onClick={()=>seek(5)} />
          <div style={{ fontFamily:'var(--ho-font-family-mono)', fontSize:22, color:'var(--ho-text-primary)', marginLeft:16, letterSpacing:3, minWidth:130, textAlign:'center' }}>{ft(currentTime)}</div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
            <Icon name="plus" size={14} color="var(--ho-accent)" />
            <Icon name="split" size={14} color="var(--ho-accent)" />
            <Icon name="flag" size={14} color="var(--ho-accent)" />
            <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:8 }}>
              <svg width={120} height={14} viewBox="0 0 120 14" style={{ cursor:'pointer' }} onClick={e => {
                const r = e.currentTarget.getBoundingClientRect()
                const pct = (e.clientX - r.left) / r.width
                setZoom(Math.round(Math.max(10, Math.min(200, pct * 200))))
              }}>
                <line x1={0} y1={7} x2={120} y2={7} stroke="var(--ho-border)" strokeWidth={2} strokeLinecap="round" />
                <circle cx={(zoom/200)*120} cy={7} r={6} fill="#fff" stroke="var(--ho-border)" strokeWidth={1} />
              </svg>
              <span style={{ fontSize:11, fontFamily:'var(--ho-font-family-mono)', color:'var(--ho-accent)', width:32, textAlign:'right' }}>{zoom}%</span>
            </div>
          </div>
        </div>

        {/* ROW 3: TIMELINE + AUDIO */}
        <div style={{ flex:1, display:'flex', overflow:'hidden', borderTop:'1px solid var(--ho-border)' }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* 时码刻度 32px */}
            <div style={{ display:'flex', height:32, flexShrink:0, borderBottom:'1px solid var(--ho-border)' }}>
              <div style={{ width:80, flexShrink:0, borderRight:'1px solid var(--ho-border)', backgroundColor:'var(--ho-bg-secondary)' }} />
              <div style={{ flex:1, position:'relative', overflow:'hidden', backgroundColor:'var(--ho-bg-primary)' }}>
                {Array.from({length:TOTAL+1}).map((_,s) => (
                  <div key={s} style={{ position:'absolute', left:`${(s/TOTAL)*100*zoom/60}%`, top:0, bottom:0, borderLeft:s%5===0?'1px solid rgba(255,255,255,0.12)':'1px solid var(--ho-border)' }}>
                    {s%5===0 && <span style={{ fontSize:9, color:'var(--ho-text-tertiary)', paddingLeft:3, whiteSpace:'nowrap' }}>{s}s</span>}
                  </div>
                ))}
                <div style={{ position:'absolute', left:`${12*zoom/60}%`, top:6, borderTop:'8px solid var(--ho-marker)', borderLeft:'5px solid transparent', borderRight:'5px solid transparent', zIndex:11 }} />
                <div style={{ position:'absolute', left:`${55*zoom/60}%`, top:6, borderTop:'8px solid var(--ho-marker)', borderLeft:'5px solid transparent', borderRight:'5px solid transparent', zIndex:11 }} />
              </div>
            </div>
            {/* 轨道 + 片段 */}
            <div style={{ flex:1, position:'relative', overflow:'auto', cursor:'pointer' }} onClick={handleTimelineClick} onDrop={onDrop(d=>console.log(d))} onDragOver={onDragOver}>
              {TRACK_KEYS.map((_,i) => (
                <div key={i} style={{ height:40, borderBottom:'1px solid var(--ho-border)' }} />
              ))}
              {clipsData.map((c,i) => {
                const idx = TRACK_KEYS.indexOf(c.track)
                return (
                  <div key={i} onClick={e=>{e.stopPropagation();selectClip(c.name)}} style={{
                    position:'absolute', top:`${idx*40+4}px`,
                    left:`${(c.start/TOTAL)*100*zoom/60}%`,
                    width:`${(c.dur/TOTAL)*100*zoom/60}%`, height:32, borderRadius:4,
                    backgroundColor:`${TRACK_COLORS[c.track]}18`,
                    borderLeft:`3px solid ${TRACK_COLORS[c.track]}`,
                    border:selectedClipId===c.name?'1px solid var(--ho-accent)':'none',
                    display:'flex', alignItems:'center', padding:'0 8px', cursor:'pointer', zIndex:1, minWidth:4
                  }}>
                    <span style={{ fontSize:10, color:'var(--ho-text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</span>
                  </div>
                )
              })}
              {/* 播放头 */}
              <div style={{ position:'absolute', left:`${(currentTime/TOTAL)*100*zoom/60}%`, top:0, bottom:0, width:2, backgroundColor:'var(--ho-accent)', zIndex:10, transition:'left 0.1s' }}>
                <svg width="14" height="10" viewBox="0 0 14 10" style={{ position:'absolute', top:-10, left:-6 }}>
                  <polygon points="7,10 0,0 14,0" fill="var(--ho-accent)" />
                </svg>
              </div>
              {/* 缩略图预览 */}
              <div style={{ position:'absolute', right:8, bottom:8, width:167, height:73, backgroundColor:'rgba(255,255,255,0.04)', borderRadius:4, border:'1px solid var(--ho-border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:9, color:'var(--ho-text-tertiary)' }}>帧预览</span>
              </div>
            </div>
          </div>

          {/* 音频响度面板 130px */}
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
