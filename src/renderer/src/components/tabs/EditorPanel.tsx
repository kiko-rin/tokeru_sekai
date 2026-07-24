import { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from '../ui/Input'
import { useTimelineStore } from '../../stores/timelineStore'

const TRACK_COLORS: Record<string,string> = { V1:'var(--ho-track-v1)', V2:'var(--ho-track-v2)', V3:'var(--ho-track-v3)', A1:'var(--ho-track-a1)', A2:'var(--ho-track-a2)' }
const TRACK_KEYS = ['V1','V2','V3','A1','A2']
const TOTAL = 30

export function EditorPanel() {
  const { currentTime, playing, selectedClipId, tracks, setCurrentTime, setPlaying, selectClip, setTracks, addClip, removeClip, addTrack, removeTrack } = useTimelineStore()
  const [propsTab, setPropsTab] = useState<'metadata'|'properties'>('properties')
  const [zoom, setZoom] = useState(60)
  const [snap, setSnap] = useState(true)
  const [align, setAlign] = useState(true)
  const [mediaCollapsed, setMediaCollapsed] = useState(false)
  const [mediaTab, setMediaTab] = useState('项目素材')
  const [mediaFilter, setMediaFilter] = useState('全部')
  const [mediaSearch, setMediaSearch] = useState('')
  const [inPoint, setInPoint] = useState(0)
  const [outPoint, setOutPoint] = useState(TOTAL)
  const [timelineH, setTimelineH] = useState(200)
  const dragRef = useRef(false)

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
    const hk = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipId) { removeClip(selectedClipId); selectClip(null) }
      if (e.key === 'i' && !e.ctrlKey && !e.metaKey) { setInPoint(useTimelineStore.getState().currentTime) }
      if (e.key === 'o' && !e.ctrlKey && !e.metaKey) { setOutPoint(useTimelineStore.getState().currentTime) }
      if (e.key === ' ') { e.preventDefault(); setPlaying(!useTimelineStore.getState().playing) }
      if (e.key === 'ArrowLeft') seek(-1/30)
      if (e.key === 'ArrowRight') seek(1/30)
    }
    window.addEventListener('keydown', hk)
    return () => window.removeEventListener('keydown', hk)
  }, [selectedClipId, removeClip, selectClip])

  const seek = useCallback((d: number) => {
    const t = useTimelineStore.getState().currentTime + d
    useTimelineStore.getState().setCurrentTime(Math.max(0, Math.min(TOTAL, t)))
  }, [])

  // Playback loop: runs on the timeline, not the control bar
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      const s = useTimelineStore.getState()
      const next = s.currentTime + 1/30
      s.setCurrentTime(next >= s.outPoint ? s.inPoint : Math.min(next, s.outPoint))
    }, 33)
    return () => clearInterval(id)
  }, [playing])

  const ft = (s: number) =>
    `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}:${String(Math.floor(s*30%30)).padStart(2,'0')}`

  const timelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - r.left) / r.width
    setCurrentTime(Math.max(0, Math.min(TOTAL, pct * TOTAL)))
  }, [setCurrentTime])

  const clipsData = tracks.flatMap(t => t.clips.map(c => ({ track:t.name, name:c.name, start:c.start, dur:c.duration })))
  const selectedClip = clipsData.find(c => c.name === selectedClipId)

  const mediaItems = [
    { n:'城市航拍.mp4', d:15, t:'video' },{ n:'日落延时.mp4', d:8, t:'video' },{ n:'公园全景.mp4', d:12, t:'video' },
    { n:'夜景灯光.mp4', d:20, t:'video' },{ n:'街道人流.mp4', d:10, t:'video' },{ n:'Logo.png', d:0, t:'image' }
  ]
  const filteredMedia = mediaItems.filter(m => (mediaFilter==='全部'||m.t===mediaFilter.toLowerCase()) && m.n.includes(mediaSearch))

  const px = (t: number) => `${(t / TOTAL) * 100 * zoom / 60}%`

  return (
    <div style={{ flex:1, display:'grid', gridTemplateColumns:`${mediaCollapsed?0:240}px 1fr 280px`, gridTemplateRows:'40px 1fr auto', gridTemplateAreas:'"toolbar toolbar toolbar" "media monitor props" "media tlprops tlprops"', overflow:'hidden' }}>
      {/* ====== 顶部工具栏 40px ====== */}
      <div style={{ gridArea:'toolbar', display:'flex', alignItems:'center', padding:'0 8px', gap:4, backgroundColor:'var(--ho-bg-secondary)', borderBottom:'1px solid var(--ho-border)' }}>
        <span style={{ fontSize:12, cursor:'pointer', color:'var(--ho-text-secondary)', padding:4 }} onClick={()=>setMediaCollapsed(!mediaCollapsed)}>{mediaCollapsed ? '>' : '<'}</span>
        <div style={{ width:1, height:16, backgroundColor:'var(--ho-border)' }} />
        <span style={{ fontSize:11, color:snap?'var(--ho-accent)':'var(--ho-text-tertiary)', cursor:'pointer', padding:'2px 6px', borderRadius:4, backgroundColor:snap?'rgba(122,158,196,0.1)':'transparent' }} onClick={()=>setSnap(!snap)}>磁吸</span>
        <span style={{ fontSize:11, color:align?'var(--ho-accent)':'var(--ho-text-tertiary)', cursor:'pointer', padding:'2px 6px', borderRadius:4, backgroundColor:align?'rgba(122,158,196,0.1)':'transparent' }} onClick={()=>setAlign(!align)}>对齐</span>
        <div style={{ flex:1 }} />
        <span style={{ fontSize:12, cursor:'pointer', color:'var(--ho-text-secondary)', padding:4 }} onClick={()=>seek(-TOTAL)}>{'|<'}</span>
        <span style={{ fontSize:12, cursor:'pointer', color:'var(--ho-text-secondary)', padding:4 }} onClick={()=>seek(-1/30)}>{'<<'}</span>
        <span style={{ fontSize:14, cursor:'pointer', color:'#fff', width:24, height:24, backgroundColor:'var(--ho-accent)', borderRadius:4, display:'inline-flex', alignItems:'center', justifyContent:'center' }} onClick={()=>setPlaying(!playing)}>{playing?'||':'>'}</span>
        <span style={{ fontSize:12, cursor:'pointer', color:'var(--ho-text-secondary)', padding:4 }} onClick={()=>seek(1/30)}>{'>>'}</span>
        <span style={{ fontSize:12, cursor:'pointer', color:'var(--ho-text-secondary)', padding:4 }} onClick={()=>seek(TOTAL)}>{'>|'}</span>
        <span style={{ fontFamily:'monospace', color:'var(--ho-accent)', fontSize:13, minWidth:110, textAlign:'center', letterSpacing:1 }}>{ft(currentTime)}</span>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
          <select value={zoom} onChange={e=>setZoom(Number(e.target.value))} style={{ height:22, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:10, padding:'0 4px', outline:'none' }}>
            <option value={25}>25%</option><option value={50}>50%</option><option value={60}>fit</option><option value={100}>100%</option><option value={200}>200%</option>
          </select>
          <div style={{ width:1, height:16, backgroundColor:'var(--ho-border)' }} />
          <span style={{ fontSize:11, cursor:'pointer', color:'var(--ho-accent)', fontWeight:600, textAlign:'center' }} onClick={()=>setInPoint(currentTime)}>I</span>
          <span style={{ fontSize:11, cursor:'pointer', color:'var(--ho-accent)', fontWeight:600, textAlign:'center' }} onClick={()=>setOutPoint(currentTime)}>O</span>
        </div>
      </div>

      {/* ====== 素材库 240px ====== */}
      <div style={{ gridArea:'media', overflow:'hidden', display:'flex', flexDirection:'column', backgroundColor:'var(--ho-bg-secondary)', borderRight:'1px solid var(--ho-border)', transition:'width 200ms' }}>
        <div style={{ display:'flex', flexShrink:0 }}>
          {['项目素材','效果库','转场'].map(t => (
            <button key={t} onClick={()=>setMediaTab(t)} style={{ flex:1, height:30, fontSize:10, cursor:'pointer', color:mediaTab===t?'var(--ho-accent)':'var(--ho-text-secondary)', backgroundColor:mediaTab===t?'var(--ho-accent-bg)':'transparent', borderBottom:mediaTab===t?'2px solid var(--ho-accent)':'2px solid transparent' }}>{t}</button>
          ))}
        </div>
        <div style={{ padding:6 }}><Input placeholder="搜索..." value={mediaSearch} onChange={e=>setMediaSearch(e.target.value)} style={{ fontSize:11, height:28 }} /></div>
        <div style={{ display:'flex', gap:4, padding:'4px 6px', flexShrink:0 }}>
          {['全部','视频','图片','音频'].map(f => (
            <button key={f} onClick={()=>setMediaFilter(f)} style={{ padding:'2px 10px', borderRadius:10, fontSize:10, cursor:'pointer', backgroundColor:mediaFilter===f?'var(--ho-accent-bg)':'rgba(255,255,255,0.04)', color:mediaFilter===f?'var(--ho-accent)':'var(--ho-text-secondary)', height:20, border:'none' }}>{f}</button>
          ))}
        </div>
        <div style={{ flex:1, overflow:'auto', padding:6, display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, alignContent:'start' }}>
          {filteredMedia.map(m => (
            <div key={m.n} draggable onDragStart={e => e.dataTransfer.setData('text/plain', JSON.stringify({ name:m.n, duration:m.d, type:m.t }))} style={{ cursor:'grab' }}>
              <div style={{ aspectRatio:'16/9', backgroundColor:'#2a2a2a', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:2 }}>
                <span style={{ fontSize:9, color:'var(--ho-text-tertiary)' }}>{m.d > 0 ? `${m.d}s` : '--'}</span>
              </div>
              <div style={{ fontSize:10, color:'var(--ho-text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.n}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:6, borderTop:'1px solid var(--ho-border)', fontSize:9, color:'var(--ho-text-tertiary)', textAlign:'center' }}>已选 0 项</div>
      </div>

      {/* ====== 实时监看区 ====== */}
      <div style={{ gridArea:'monitor', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <div style={{ width:'90%', aspectRatio:'16/9', backgroundColor:'#000', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:13, color:'var(--ho-text-tertiary)' }}>实时监看</span>
          </div>
          <div style={{ position:'absolute', bottom:16, left:20, fontFamily:'monospace', color:'var(--ho-accent)', fontSize:13 }}>{ft(currentTime)}</div>
          <div style={{ position:'absolute', bottom:16, right:20, fontSize:12, color:'var(--ho-text-tertiary)' }}>1920x1080 - 30fps</div>
        </div>
        {/* 微型音频控制台 - 位于监看区底部 */}
        <div style={{ height:28, borderTop:'1px solid var(--ho-border)', display:'flex', alignItems:'center', padding:'0 12px', gap:8, backgroundColor:'var(--ho-bg-secondary)', flexShrink:0 }}>
          <div style={{ flex:1, height:14, backgroundColor:'rgba(255,255,255,0.04)', borderRadius:7, overflow:'hidden', display:'flex' }}>
            <div style={{ width:`${(currentTime/TOTAL)*100}%`, height:'100%', background:'linear-gradient(90deg, var(--ho-safe), var(--ho-warning), var(--ho-peak))', transition:'width 0.1s' }} />
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:3 }}>
            <div style={{ width:8, height:14, background:'linear-gradient(to top, var(--ho-safe), var(--ho-warning), var(--ho-peak))', borderRadius:2 }} />
            <div style={{ width:8, height:10, background:'linear-gradient(to top, var(--ho-safe), var(--ho-warning), var(--ho-peak))', borderRadius:2 }} />
          </div>
          <span style={{ fontSize:9, cursor:'pointer', color:'var(--ho-text-secondary)' }} onClick={()=>console.log('mute')}>M</span>
          <span style={{ fontSize:9, cursor:'pointer', color:'var(--ho-text-secondary)' }} onClick={()=>console.log('solo')}>S</span>
        </div>
      </div>

      {/* ====== 控件面板 280px ====== */}
      <div style={{ gridArea:'props', display:'flex', flexDirection:'column', backgroundColor:'var(--ho-bg-secondary)', borderLeft:'1px solid var(--ho-border)' }}>
        <div style={{ display:'flex', flexShrink:0 }}>
          {['元数据','属性'].map(t => (
            <button key={t} onClick={()=>setPropsTab(t==='元数据'?'metadata':'properties')} style={{
              flex:1, height:34, fontSize:12, cursor:'pointer',
              color:propsTab===(t==='元数据'?'metadata':'properties')?'var(--ho-accent)':'var(--ho-text-secondary)',
              backgroundColor:propsTab===(t==='元数据'?'metadata':'properties')?'var(--ho-accent-bg)':'transparent',
              borderBottom:propsTab===(t==='元数据'?'metadata':'properties')?'2px solid var(--ho-accent)':'2px solid transparent'
            }}>{t}</button>
          ))}
        </div>
        <div style={{ flex:1, overflow:'auto', padding:12 }}>
          {propsTab==='metadata' ? (
            <div style={{ fontSize:11 }}>
              {[['文件名', selectedClip?.name||'开场镜头.mp4'],['分辨率','1920x1080'],['帧率','30 fps'],['编解码器','H.264'],['时长','00:00:05:00'],['文件大小','24.5 MB'],['色彩空间','Rec.709']].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'3px 0', borderBottom:'1px solid var(--ho-border)' }}>
                  <span style={{ color:'var(--ho-text-tertiary)' }}>{k}</span>
                  <span style={{ color:'var(--ho-text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>变换</div>
              {[['位置X','px'],['位置Y','px'],['缩放X','%'],['缩放Y','%'],['旋转','°']].map(([l,u]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:4, marginBottom:4 }}>
                  <span style={{ width:40, fontSize:10, color:'var(--ho-text-secondary)' }}>{l}</span>
                  <input type="number" defaultValue={0} style={{ flex:1, height:22, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-primary)', fontSize:10, padding:'0 6px', outline:'none' }} />
                  <span style={{ fontSize:9, color:'var(--ho-text-tertiary)' }}>{u}</span>
                </div>
              ))}
              <div style={{ marginTop:8 }}>
                <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>不透明度</div>
                <input type="range" min={0} max={100} defaultValue={100} style={{ width:'100%', height:3, accentColor:'var(--ho-accent)' }} />
                <select style={{ width:'100%', height:24, marginTop:4, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:10, padding:'0 6px', outline:'none' }}>
                  <option>正常</option><option>正片叠底</option><option>滤色</option>
                </select>
              </div>
              <div style={{ marginTop:8, fontSize:10, color:'var(--ho-accent)', cursor:'pointer' }} onClick={()=>console.log('add effect')}>+ 添加效果</div>
            </div>
          )}
        </div>
      </div>

      {/* ====== 多轨时间线 + 音频响度 ====== */}
      <div style={{ gridArea:'tlprops', display:'flex', overflow:'hidden', borderTop:'1px solid var(--ho-border)' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ display:'flex', height:24, flexShrink:0, borderBottom:'1px solid var(--ho-border)' }}>
            <div style={{ width:160, flexShrink:0, borderRight:'1px solid var(--ho-border)', backgroundColor:'var(--ho-bg-secondary)' }} />
            <div style={{ flex:1, position:'relative', overflow:'hidden', backgroundColor:'var(--ho-bg-primary)' }}>
              {Array.from({length:TOTAL+1}).map((_,s) => (
                <div key={s} style={{ position:'absolute', left:`${(s/TOTAL)*100*zoom/60}%`, top:0, bottom:0, borderLeft:s%5===0?'1px solid rgba(255,255,255,0.12)':'1px solid var(--ho-border)' }}>
                  {s%5===0 && <span style={{ fontSize:9, color:'var(--ho-text-tertiary)', paddingLeft:3, whiteSpace:'nowrap' }}>{s}s</span>}
                </div>
              ))}
              <div style={{ position:'absolute', left:`${(inPoint/TOTAL)*100*zoom/60}%`, top:0, bottom:0, width:2, backgroundColor:'var(--ho-marker)', opacity:0.6 }} />
              <div style={{ position:'absolute', left:`${(outPoint/TOTAL)*100*zoom/60}%`, top:0, bottom:0, width:2, backgroundColor:'var(--ho-marker)', opacity:0.6 }} />
              <div style={{ position:'absolute', left:`${12*zoom/60}%`, top:5, borderTop:'6px solid var(--ho-marker)', borderLeft:'4px solid transparent', borderRight:'4px solid transparent', zIndex:11 }} />
              <div style={{ position:'absolute', left:`${55*zoom/60}%`, top:5, borderTop:'6px solid var(--ho-marker)', borderLeft:'4px solid transparent', borderRight:'4px solid transparent', zIndex:11 }} />
              <div style={{ position:'absolute', left:`${88*zoom/60}%`, top:5, borderTop:'6px solid var(--ho-marker)', borderLeft:'4px solid transparent', borderRight:'4px solid transparent', zIndex:11 }} />
            </div>
          </div>
          <div style={{ flex:1, position:'relative', overflow:'auto', cursor:'pointer' }} onClick={timelineClick} onDrop={e => {
            e.preventDefault()
            try {
              const data = JSON.parse(e.dataTransfer.getData('text/plain'))
              const r = e.currentTarget.getBoundingClientRect()
              const dropT = ((e.clientX-r.left)/r.width)*TOTAL
              const row = Math.floor((e.clientY-r.top)/36)
              const t = tracks[Math.min(row, tracks.length-1)]
              if (data && t) { addClip(t.id, { id:`c${Date.now()}`, name:data.name, filePath:'', duration:data.duration||5, start:dropT, trackId:t.id, width:1920, height:1080, fps:30, codec:'H264' as any, colorSpace:'Rec709' as any, colorDepth:8 as any, chromaSubsampling:'YUV420' as any }) }
            } catch {}
          }} onDragOver={e=>e.preventDefault()}>
            {TRACK_KEYS.map((k,i) => (
              <div key={k} style={{ display:'flex', height:36, borderBottom:'1px solid var(--ho-border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:4, padding:'0 6px', backgroundColor:'var(--ho-bg-secondary)', borderRight:'1px solid var(--ho-border)', minWidth:160 }}>
                  <div style={{ width:4, height:20, backgroundColor:TRACK_COLORS[k], borderRadius:2, flexShrink:0 }} />
                  <span style={{ fontSize:10, color:'var(--ho-text-secondary)', flex:1 }}>{k}</span>
                  <span style={{ fontSize:9, color:'var(--ho-text-tertiary)', cursor:'pointer' }} onClick={()=>addTrack({ id:`t${Date.now()}`, name:`V${tracks.length+1}`, type:'video', muted:false, locked:false, clips:[] })}>+</span>
                  <span style={{ fontSize:9, color:'var(--ho-text-tertiary)', cursor:'pointer' }} onClick={()=>removeTrack(tracks[i]?.id)}>o</span>
                </div>
              </div>
            ))}
            {clipsData.map((c,i) => {
              const idx = TRACK_KEYS.indexOf(c.track)
              return (
                <div key={i} onClick={e=>{e.stopPropagation();selectClip(c.name)}} style={{
                  position:'absolute', top:`${idx*36+4}px`, left:px(c.start),
                  width:px(c.dur), height:28, borderRadius:4,
                  backgroundColor:`${TRACK_COLORS[c.track]}18`, borderLeft:`2px solid ${TRACK_COLORS[c.track]}`,
                  border:selectedClipId===c.name?'1px solid var(--ho-accent)':'none',
                  display:'flex', alignItems:'center', padding:'0 8px', cursor:'pointer', zIndex:1, minWidth:4
                }}>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.8)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</span>
                </div>
              )
            })}
            {/* 播放头 - 在时间线区域内 */}
            <div style={{ position:'absolute', left:px(currentTime), top:0, bottom:0, width:2, backgroundColor:'var(--ho-accent)', zIndex:10, transition:'left 0.1s' }}>
              <svg width="14" height="10" viewBox="0 0 14 10" style={{ position:'absolute', top:-10, left:-6 }}><polygon points="7,10 0,0 14,0" fill="var(--ho-accent)" /></svg>
            </div>
          </div>
        </div>
        {/* 音频响度面板 */}
        <div style={{ width:130, flexShrink:0, borderLeft:'1px solid var(--ho-border)', display:'flex', backgroundColor:'var(--ho-bg-secondary)' }}>
          <div style={{ width:65, display:'flex', flexDirection:'column', alignItems:'center', borderRight:'1px solid var(--ho-border)' }}>
            <select style={{ width:36, marginTop:12, height:22, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:3, fontSize:8, color:'var(--ho-text-secondary)', padding:'0 2px', outline:'none' }}><option>Bus</option></select>
            <div style={{ flex:1, width:28, margin:'8px 0', backgroundColor:'rgba(255,255,255,0.04)', borderRadius:4, display:'flex', overflow:'hidden' }}>
              <div style={{ flex:1, background:'linear-gradient(to top, var(--ho-safe), var(--ho-warning), var(--ho-peak))' }} />
              <div style={{ flex:1, background:'linear-gradient(to top, var(--ho-safe), var(--ho-warning), var(--ho-peak))' }} />
            </div>
          </div>
          <div style={{ width:65, display:'flex', flexDirection:'column', alignItems:'center' }}>
            <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-evenly', padding:'8px 0' }}>
              {['0','-6','-12','-18','-24','-inf'].map(l => <span key={l} style={{ fontSize:7, color:'var(--ho-text-tertiary)', textAlign:'center' }}>{l}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
