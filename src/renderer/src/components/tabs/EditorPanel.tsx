import { useState, useEffect, useCallback } from 'react'
import { Input } from '../ui/Input'
import { Icon } from '../ui/Icon'
import { useTimelineStore } from '../../stores/timelineStore'
import { useDragDrop } from '../../hooks/useDragDrop'

const TRACK_COLORS: Record<string,string> = { V1:'#6a8aaa', V2:'#7a9a6a', V3:'#8a7aaa', A1:'#aa8a6a', A2:'#8a6a8a' }
const TRACK_KEYS = ['V1','V2','V3','A1','A2']
const TOTAL = 30

export function EditorPanel() {
  const { currentTime, playing, selectedClipId, tracks, setCurrentTime, setPlaying, selectClip, setTracks, addTrack, addClip } = useTimelineStore()
  const [propsTab, setPropsTab] = useState<'metadata'|'properties'>('metadata')
  const [zoom, setZoom] = useState(60)
  const [snap, setSnap] = useState(true)
  const { onDrop, onDragOver } = useDragDrop()

  const PX = (t: number) => `${(t / TOTAL) * 100}%`

  useEffect(() => {
    const now = Date.now()
    setTracks([
      { id:'t1', name:'V1', type:'video' as const, muted:false, locked:false, clips:[
        { id:'c1', name:'开场镜头', filePath:'', duration:5.4, start:0.5, trackId:'t1', width:1920, height:1080, fps:30, codec:'H264' as any, colorSpace:'Rec709' as any, colorDepth:8 as any, chromaSubsampling:'YUV420' as any, thumbnailPath:'', proxyPath:'' },
        { id:'c2', name:'产品展示', filePath:'', duration:9.0, start:6.2, trackId:'t1', width:1920, height:1080, fps:30, codec:'H264' as any, colorSpace:'Rec709' as any, colorDepth:8 as any, chromaSubsampling:'YUV420' as any },
        { id:'c3', name:'结尾', filePath:'', duration:7.5, start:22.5, trackId:'t1', width:1920, height:1080, fps:30, codec:'H264' as any, colorSpace:'Rec709' as any, colorDepth:8 as any, chromaSubsampling:'YUV420' as any }
      ]},
      { id:'t2', name:'V2', type:'video' as const, muted:false, locked:false, clips:[] },
      { id:'t3', name:'V3', type:'video' as const, muted:false, locked:false, clips:[] },
      { id:'t4', name:'A1', type:'audio' as const, muted:false, locked:false, clips:[] },
      { id:'t5', name:'A2', type:'audio' as const, muted:false, locked:false, clips:[] }
    ])
  }, [setTracks])

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
    const x = (e.clientX - rect.left) / rect.width
    setCurrentTime(x * TOTAL)
  }, [setCurrentTime])

  const CLIPS = tracks.flatMap(t => t.clips.map(c => ({ track:t.name, ...c })))

  const clipsData = tracks.length > 0
    ? tracks.flatMap(t => t.clips.map(c => ({ track:t.name, name:c.name, start:c.start, dur:c.duration })))
    : [{ track:'V1', name:'开场镜头', start:0.5, dur:5.4 }, { track:'V1', name:'产品展示', start:6.2, dur:9.0 }, { track:'V1', name:'结尾', start:22.5, dur:7.5 }]

  return (
    <div style={{ flex:1, display:'flex', overflow:'hidden', backgroundColor:'var(--ho-bg-primary)' }}>
      <div style={{ width:299, flexShrink:0, display:'flex', flexDirection:'column', borderRight:'1px solid var(--ho-border)', backgroundColor:'var(--ho-bg-secondary)' }}>
        <div style={{ flex:1, overflow:'auto', padding:16, borderBottom:'1px solid var(--ho-border)' }}>
          <Input placeholder="搜索素材..." style={{ fontSize:11, marginBottom:12, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:6, color:'var(--ho-text-primary)', height:30, padding:'0 8px', outline:'none' }} />
          <div style={{ fontSize:11, color:'var(--ho-text-secondary)' }}>素材列表</div>
        </div>
        <div style={{ flex:1, overflow:'auto', padding:16 }}>
          <div style={{ fontSize:11, color:'var(--ho-text-tertiary)', marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>字幕 / 特效</div>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <div style={{ width:'90%', aspectRatio:'16/9', backgroundColor:'#000', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:14, color:'var(--ho-text-tertiary)' }}>实时监看</span>
          </div>
          <div style={{ position:'absolute', bottom:16, left:20, fontFamily:'var(--ho-font-family-mono)', color:'var(--ho-accent)', fontSize:13 }}>{ft(currentTime)}</div>
          <div style={{ position:'absolute', bottom:16, right:20, fontSize:12, color:'var(--ho-text-tertiary)' }}>1920x1080 - 30fps</div>
        </div>

        <div style={{ height:28, borderTop:'1px solid var(--ho-border)', display:'flex', alignItems:'center', padding:'0 12px', gap:8, backgroundColor:'var(--ho-bg-secondary)', flexShrink:0 }}>
          <div style={{ flex:1, height:14, backgroundColor:'rgba(255,255,255,0.04)', borderRadius:7, overflow:'hidden', display:'flex' }}>
            <div style={{ width:`${(currentTime/TOTAL)*100}%`, height:'100%', background:'linear-gradient(90deg, var(--ho-safe), var(--ho-warning), var(--ho-peak))', transition:'width 0.1s' }} />
          </div>
        </div>

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
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
            <Icon name="plus" size={14} color="var(--ho-accent)" />
            <Icon name="split" size={14} color="var(--ho-accent)" />
            <Icon name="flag" size={14} color="var(--ho-accent)" />
            <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:12 }}>
              <input type="range" min={10} max={200} value={zoom} onChange={e=>setZoom(Number(e.target.value))} style={{ width:80, height:3, accentColor:'var(--ho-accent)', cursor:'pointer' }} />
              <span style={{ fontSize:11, fontFamily:'var(--ho-font-family-mono)', color:'var(--ho-accent)', width:30, textAlign:'right' }}>{zoom}%</span>
            </div>
          </div>
        </div>

        <div style={{ flex:1, display:'flex', overflow:'hidden', borderTop:'1px solid var(--ho-border)' }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ display:'flex', height:32, flexShrink:0, borderBottom:'1px solid var(--ho-border)' }}>
              <div style={{ width:80, flexShrink:0, borderRight:'1px solid var(--ho-border)', backgroundColor:'var(--ho-bg-secondary)' }} />
              <div style={{ flex:1, position:'relative', overflow:'hidden', backgroundColor:'var(--ho-bg-primary)' }}>
                {Array.from({length:TOTAL+1}).map((_,s) => (
                  <div key={s} style={{ position:'absolute', left:`${(s/TOTAL)*100*zoom/60}%`, top:0, bottom:0, borderLeft:s%5===0?'1px solid rgba(255,255,255,0.12)':'1px solid var(--ho-border)' }}>
                    {s%5===0 && <span style={{ fontSize:9, color:'var(--ho-text-tertiary)', paddingLeft:3, whiteSpace:'nowrap' }}>{s}s</span>}
                  </div>
                ))}
                <div style={{ position:'absolute', left:`${12*zoom/60}%`, top:'6px', borderTop:'8px solid var(--ho-marker)', borderLeft:'5px solid transparent', borderRight:'5px solid transparent', zIndex:11 }} />
                <div style={{ position:'absolute', left:`${55*zoom/60}%`, top:'6px', borderTop:'8px solid var(--ho-marker)', borderLeft:'5px solid transparent', borderRight:'5px solid transparent', zIndex:11 }} />
              </div>
            </div>
            <div style={{ flex:1, position:'relative', overflow:'auto', cursor:'pointer' }} onClick={handleTimelineClick} onDrop={onDrop(d=>console.log('drop',d))} onDragOver={onDragOver}>
              {TRACK_KEYS.map((_,i) => (
                <div key={i} style={{ height:40, borderBottom:'1px solid var(--ho-border)' }} />
              ))}
              {clipsData.map((c,i) => {
                const idx = TRACK_KEYS.indexOf(c.track)
                return (
                  <div key={i} onClick={e => { e.stopPropagation(); selectClip(c.name) }} style={{
                    position:'absolute', top:`${idx*40+4}px`,
                    left:`${(c.start/TOTAL)*100*zoom/60}%`,
                    width:`${(c.dur/TOTAL)*100*zoom/60}%`,
                    height:32, borderRadius:4,
                    backgroundColor:`${TRACK_COLORS[c.track]}18`,
                    borderLeft:`3px solid ${TRACK_COLORS[c.track]}`,
                    border:selectedClipId===c.name?'1px solid var(--ho-accent)':'none',
                    display:'flex', alignItems:'center', padding:'0 8px', cursor:'pointer', zIndex:1, minWidth:4
                  }}>
                    <span style={{ fontSize:10, color:'var(--ho-text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</span>
                  </div>
                )
              })}
              <div style={{ position:'absolute', left:`${(currentTime/TOTAL)*100*zoom/60}%`, top:0, bottom:0, width:2, backgroundColor:'var(--ho-accent)', zIndex:10, transition:'left 0.1s' }}>
                <div style={{ width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderTop:'10px solid var(--ho-accent)', margin:'0 auto' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
