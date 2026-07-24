import { useState, useEffect, useCallback } from 'react'
import { Input } from '../ui/Input'
import { useTimelineStore } from '../../stores/timelineStore'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'

const TC: Record<string,string> = { V1:'var(--ho-track-v1)', V2:'var(--ho-track-v2)', V3:'var(--ho-track-v3)', A1:'var(--ho-track-a1)', A2:'var(--ho-track-a2)' }
const TK = ['V1','V2','V3','A1','A2']
const TOTAL = 30

export function EditorPanel() {
  const { currentTime, playing, selectedClipId, tracks, setCurrentTime, setPlaying, selectClip, setTracks, addClip, removeClip, addTrack, removeTrack } = useTimelineStore()
  const [zoom, setZoom] = useState(60)
  const [snap, setSnap] = useState(true)
  const [mediaCollapsed, setMediaCollapsed] = useState(false)
  const [mediaTab, setMediaTab] = useState('项目素材')
  const [mediaSearch, setMediaSearch] = useState('')
  const [mediaFilter, setMediaFilter] = useState('全部')
  const [propsTab, setPropsTab] = useState<'metadata'|'properties'>('metadata')
  const [inPoint, setInPoint] = useState(0)
  const [outPoint, setOutPoint] = useState(TOTAL)

  useEffect(() => {
    if (tracks.length > 0) return
    setTracks([
      { id:'t1', name:'V1', type:'video', muted:false, locked:false, clips:[
        { id:'c1', name:'开场镜头', filePath:'', duration:5.4, start:0.5, trackId:'t1', width:1920, height:1080, fps:30, codec:'H264' as any, colorSpace:'Rec709' as any, colorDepth:8 as any, chromaSubsampling:'YUV420' as any },
        { id:'c2', name:'产品展示', filePath:'', duration:9.0, start:6.2, trackId:'t1', width:1920, height:1080, fps:30, codec:'H264' as any, colorSpace:'Rec709' as any, colorDepth:8 as any, chromaSubsampling:'YUV420' as any },
        { id:'c3', name:'结尾', filePath:'', duration:7.5, start:22.5, trackId:'t1', width:1920, height:1080, fps:30, codec:'H264' as any, colorSpace:'Rec709' as any, colorDepth:8 as any, chromaSubsampling:'YUV420' as any }
      ]},
      { id:'t2', name:'V2', type:'video', muted:false, locked:false, clips:[] },
      { id:'t3', name:'V3', type:'video', muted:false, locked:false, clips:[] },
      { id:'t4', name:'A1', type:'audio', muted:false, locked:false, clips:[] },
      { id:'t5', name:'A2', type:'audio', muted:false, locked:false, clips:[] }
    ])
  }, [tracks, setTracks])

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      const s = useTimelineStore.getState()
      const next = s.currentTime + 1/30
      s.setCurrentTime(next >= (s.outPoint||TOTAL) ? (s.inPoint||0) : Math.min(next, s.outPoint||TOTAL))
    }, 33)
    return () => clearInterval(id)
  }, [playing])

  useKeyboardShortcuts({
    'delete': () => { if (selectedClipId) { removeClip(selectedClipId); selectClip(null) } },
    'backspace': () => { if (selectedClipId) { removeClip(selectedClipId); selectClip(null) } },
    'i': () => setInPoint(useTimelineStore.getState().currentTime),
    'o': () => setOutPoint(useTimelineStore.getState().currentTime),
    'ctrl-i': () => setInPoint(useTimelineStore.getState().currentTime),
    'ctrl-o': () => setOutPoint(useTimelineStore.getState().currentTime),
    'Space': () => setPlaying(!useTimelineStore.getState().playing),
    'arrowleft': () => useTimelineStore.getState().setCurrentTime(Math.max(0, useTimelineStore.getState().currentTime - 1/30)),
    'arrowright': () => useTimelineStore.getState().setCurrentTime(Math.min(TOTAL, useTimelineStore.getState().currentTime + 1/30)),
  })

  const ft = (s: number) =>
    `${String(Math.floor(s/3600)).padStart(2,'0')} : ${String(Math.floor((s%3600)/60)).padStart(2,'0')} : ${String(Math.floor(s%60)).padStart(2,'0')}`

  const seek = (d: number) => setCurrentTime(Math.max(0, Math.min(TOTAL, currentTime + d)))

  const tlClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setCurrentTime(Math.max(0, Math.min(TOTAL, ((e.clientX - r.left) / r.width) * TOTAL)))
  }, [setCurrentTime])

  const clipsData = tracks.flatMap(t => t.clips.map(c => ({ track:t.name, name:c.name, start:c.start, dur:c.duration })))
  const selectedClip = clipsData.find(c => c.name === selectedClipId)

  const px = (t: number) => `${(t/TOTAL)*100*zoom/60}%`

  return (
    <div style={{ flex:1, display:'grid', gridTemplateColumns:'299px 1fr', overflow:'hidden', backgroundColor:'var(--ho-bg-primary)' }}>
      {/* ====== 左栏 299px 全高 ====== */}
      <div style={{ display:'flex', flexDirection:'column', borderRight:'1px solid var(--ho-border)', backgroundColor:'var(--ho-bg-secondary)' }}>
        {/* 素材库 512px (spec) */}
        <div style={{ height:512, display:'flex', flexDirection:'column', overflow:'hidden', borderBottom:'1px solid var(--ho-border)' }}>
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
            {[
              { n:'城市航拍.mp4', d:15 },{ n:'日落延时.mp4', d:8 },{ n:'公园全景.mp4', d:12 },
              { n:'夜景灯光.mp4', d:20 },{ n:'街道人流.mp4', d:10 },{ n:'Logo.png', d:0 }
            ].filter(m => (mediaFilter==='全部'||(mediaFilter==='视频'?m.d>0:mediaFilter==='图片'?m.d===0:true)) && m.n.includes(mediaSearch)).map(m => (
              <div key={m.n} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',JSON.stringify(m))} style={{ cursor:'grab' }}>
                <div style={{ aspectRatio:'16/9', backgroundColor:'var(--ho-bg-tertiary)', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:2 }}>
                  <span style={{ fontSize:9, color:'var(--ho-text-tertiary)' }}>{m.d>0?`${m.d}s`:'--'}</span>
                </div>
                <div style={{ fontSize:10, color:'var(--ho-text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.n}</div>
              </div>
            ))}
          </div>
        </div>
        {/* 字幕样式库 512px (spec: x:0, y:512) */}
        <div style={{ flex:1, overflow:'auto', padding:12 }}>
          <div style={{ fontSize:11, color:'var(--ho-text-tertiary)', marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>字幕 / 特效</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {['溶解','擦除','推拉','缩放','翻转','百叶窗'].map(t => (
              <div key={t} style={{ padding:'14px 8px', borderRadius:6, border:'1px solid var(--ho-border)', textAlign:'center', cursor:'pointer', fontSize:11, color:'var(--ho-text-secondary)' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== 右栏 ====== */}
      <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* ROW 1: 监看区(881px spec) + 元数据(261px spec) = 512px */}
        <div style={{ display:'flex', height:512, flexShrink:0, overflow:'hidden', borderBottom:'1px solid var(--ho-border)' }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <div style={{ width:'90%', aspectRatio:'16/9', backgroundColor:'#000', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:13, color:'var(--ho-text-tertiary)' }}>实时监看</span>
            </div>
            <div style={{ position:'absolute', bottom:16, left:20, fontFamily:'monospace', color:'var(--ho-accent)', fontSize:13 }}>{ft(currentTime)}</div>
            <div style={{ position:'absolute', bottom:16, right:20, fontSize:12, color:'var(--ho-text-tertiary)' }}>1920x1080 - 30fps</div>
          </div>
          {/* 元数据及属性面板 261px */}
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
            <div style={{ flex:1, overflow:'auto', padding:12 }}>
              {propsTab==='metadata' ? (
                <div style={{ fontSize:11 }}>
                  {[['文件名',selectedClip?.name||'开场镜头.mp4'],['分辨率','1920x1080'],['帧率','30 fps'],['编解码器','H.264'],['时长','00:00:05:00'],['文件大小','24.5 MB'],['色彩空间','Rec.709']].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'3px 0', borderBottom:'1px solid var(--ho-border)' }}>
                      <span style={{ color:'var(--ho-text-tertiary)' }}>{k}</span><span style={{ color:'var(--ho-text-primary)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize:10, color:'var(--ho-text-tertiary)' }}>变换参数</div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: 时间线工具 57px (spec: x:299, y:512, w:1141, h:57) */}
        <div style={{ height:57, flexShrink:0, display:'flex', alignItems:'center', padding:'0 24px', gap:8, backgroundColor:'var(--ho-bg-secondary)', borderBottom:'1px solid var(--ho-border)', position:'relative' }}>
          {/* 磁吸 x:31 — 从左侧 24px padding + 7px offset */}
          <span style={{ fontSize:11, cursor:'pointer', color:snap?'var(--ho-accent)':'var(--ho-text-tertiary)', padding:'3px 6px', borderRadius:4, backgroundColor:snap?'rgba(122,158,196,0.1)':'transparent' }} onClick={()=>setSnap(!snap)}>磁吸</span>
          {/* 切刀 x:67 — offset */}
          <span style={{ fontSize:11, cursor:'pointer', color:'var(--ho-text-tertiary)', padding:'3px 6px' }} onClick={()=>console.log('razor')}>切刀</span>
          <div style={{ flex:1 }} />
          {/* 跳到开始 */}
          <span style={{ fontSize:12, cursor:'pointer', color:'var(--ho-text-secondary)', padding:4 }} onClick={()=>seek(-TOTAL)}>{'|<'}</span>
          <span style={{ fontSize:12, cursor:'pointer', color:'var(--ho-text-secondary)', padding:4 }} onClick={()=>seek(-1/30)}>{'<<'}</span>
          {/* 暂停or继续 x:420 */}
          <span style={{ fontSize:14, cursor:'pointer', color:'#fff', width:18, height:18, backgroundColor:'var(--ho-accent)', borderRadius:3, display:'inline-flex', alignItems:'center', justifyContent:'center' }} onClick={()=>setPlaying(!playing)}>{playing?'||':'>'}</span>
          <span style={{ fontSize:12, cursor:'pointer', color:'var(--ho-text-secondary)', padding:4 }} onClick={()=>seek(1/30)}>{'>>'}</span>
          <span style={{ fontSize:12, cursor:'pointer', color:'var(--ho-text-secondary)', padding:4 }} onClick={()=>seek(TOTAL)}>{'>|'}</span>
          {/* 旗标按钮组 x:515-571 */}
          <span style={{ fontSize:11, cursor:'pointer', color:'var(--ho-accent)', padding:4 }} onClick={()=>setInPoint(currentTime)}>I</span>
          <span style={{ fontSize:11, cursor:'pointer', color:'var(--ho-accent)', padding:4 }} onClick={()=>{ setInPoint(0); setOutPoint(TOTAL) }}>x</span>
          <span style={{ fontSize:11, cursor:'pointer', color:'var(--ho-accent)', padding:4 }} onClick={()=>setOutPoint(currentTime)}>O</span>
          {/* 时间线缩放滑条 x:714, w:181 (spec) */}
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <svg width={120} height={14} viewBox="0 0 120 14" style={{ cursor:'pointer' }} onClick={e=>{const r=e.currentTarget.getBoundingClientRect(); setZoom(Math.round(Math.max(10,Math.min(200,((e.clientX-r.left)/r.width)*200)))) }}>
              <line x1={0} y1={7} x2={120} y2={7} stroke="var(--ho-border)" strokeWidth={2} strokeLinecap="round" />
              <circle cx={(zoom/200)*120} cy={7} r={6} fill="#fff" stroke="var(--ho-border)" strokeWidth={1} />
            </svg>
            <span style={{ fontSize:10, fontFamily:'monospace', color:'var(--ho-accent)', width:28, textAlign:'right' }}>{zoom}%</span>
          </div>
          {/* 播放头时码 x:910, w:190 (spec: 01 : 00 : 00) */}
          <span style={{ fontFamily:'monospace', color:'var(--ho-text-primary)', fontSize:22, letterSpacing:2, minWidth:140, textAlign:'center' }}>{ft(currentTime)}</span>
        </div>

        {/* ROW 3: 时间线(1012px spec) + 音频响度(130px spec) */}
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* 时码刻度 32px (spec) + 轨道控制台 80px (spec) */}
            <div style={{ display:'flex', height:32, flexShrink:0, borderBottom:'1px solid var(--ho-border)' }}>
              <div style={{ width:80, flexShrink:0, borderRight:'1px solid var(--ho-border)', backgroundColor:'var(--ho-bg-secondary)' }} />
              <div style={{ flex:1, position:'relative', overflow:'hidden', backgroundColor:'var(--ho-bg-primary)' }}>
                {Array.from({length:TOTAL+1}).map((_,s) => (
                  <div key={s} style={{ position:'absolute', left:`${(s/TOTAL)*100*zoom/60}%`, top:0, bottom:0, borderLeft:s%5===0?'1px solid rgba(255,255,255,0.15)':'1px solid var(--ho-border)' }}>
                    {s%5===0 && <span style={{ fontSize:9, color:'var(--ho-text-tertiary)', paddingLeft:3, whiteSpace:'nowrap' }}>{s}s</span>}
                  </div>
                ))}
                <div style={{ position:'absolute', left:`${(inPoint/TOTAL)*100*zoom/60}%`, top:0, bottom:0, width:2, backgroundColor:'var(--ho-marker)', opacity:0.5 }} />
                <div style={{ position:'absolute', left:`${(outPoint/TOTAL)*100*zoom/60}%`, top:0, bottom:0, width:2, backgroundColor:'var(--ho-marker)', opacity:0.5 }} />
                <div style={{ position:'absolute', left:`${12*zoom/60}%`, top:6, borderTop:'6px solid var(--ho-marker)', borderLeft:'4px solid transparent', borderRight:'4px solid transparent', zIndex:11 }} />
                <div style={{ position:'absolute', left:`${55*zoom/60}%`, top:6, borderTop:'6px solid var(--ho-marker)', borderLeft:'4px solid transparent', borderRight:'4px solid transparent', zIndex:11 }} />
              </div>
            </div>
            {/* 轨道区域 */}
            <div style={{ flex:1, position:'relative', overflow:'auto', cursor:'pointer' }} onClick={tlClick} onDrop={e=>{
              e.preventDefault()
              try {
                const d = JSON.parse(e.dataTransfer.getData('text/plain'))
                const r = e.currentTarget.getBoundingClientRect()
                const dt = ((e.clientX-r.left)/r.width)*TOTAL
                const row = Math.floor((e.clientY-r.top)/36)
                const t = tracks[Math.min(row,tracks.length-1)]
                if (d&&t) addClip(t.id,{ id:`c${Date.now()}`,name:d.n||d.name,filePath:'',duration:d.d||5,start:dt,trackId:t.id,width:1920,height:1080,fps:30,codec:'H264' as any,colorSpace:'Rec709' as any,colorDepth:8 as any,chromaSubsampling:'YUV420' as any })
              } catch(e){}
            }} onDragOver={e=>e.preventDefault()}>
              {TK.map((k,i) => (
                <div key={k} style={{ height:36, borderBottom:'1px solid var(--ho-border)', display:'flex', position:'relative' }}>
                  <div style={{ width:80, flexShrink:0, display:'flex', alignItems:'center', gap:4, padding:'0 6px', backgroundColor:'var(--ho-bg-secondary)', borderRight:'1px solid var(--ho-border)', position:'sticky', left:0, zIndex:2 }}>
                    <div style={{ width:4, height:18, backgroundColor:TC[k], borderRadius:2, flexShrink:0 }} />
                    <span style={{ fontSize:10, color:'var(--ho-text-secondary)', flex:1 }}>{k}</span>
                    <span style={{ fontSize:8, color:'var(--ho-text-tertiary)', cursor:'pointer' }} onClick={()=>addTrack({ id:`t${Date.now()}`,name:`V${tracks.length+1}`,type:'video',muted:false,locked:false,clips:[] })}>+</span>
                    <span style={{ fontSize:8, color:'var(--ho-text-tertiary)', cursor:'pointer' }} onClick={()=>i>0&&removeTrack(tracks[i]?.id)}>o</span>
                  </div>
                  <div style={{ flex:1 }} />
                </div>
              ))}
              {clipsData.map((c,i) => {
                const idx = TK.indexOf(c.track)
                return (
                  <div key={i} onClick={e=>{e.stopPropagation();selectClip(c.name)}} style={{
                    position:'absolute', top:`${idx*36+4}px`, left:px(c.start),
                    width:px(c.dur), height:28, borderRadius:4,
                    backgroundColor:`${TC[c.track]}18`, borderLeft:`3px solid ${TC[c.track]}`,
                    border:selectedClipId===c.name?'1px solid var(--ho-accent)':'none',
                    display:'flex', alignItems:'center', padding:'0 8px', cursor:'pointer', zIndex:1, minWidth:4,
                    boxShadow:selectedClipId===c.name?'0 0 0 1px rgba(122,158,196,0.15)':'none'
                  }}>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.8)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</span>
                  </div>
                )
              })}
              {/* 播放头 */}
              <div style={{ position:'absolute', left:px(currentTime), top:0, bottom:0, width:2, backgroundColor:'var(--ho-accent)', zIndex:10, transition:'left 0.1s' }}>
                <svg width="34" height="20" viewBox="0 0 34 20" style={{ position:'absolute', top:-20, left:-16 }}><polygon points="17,20 0,0 34,0" fill="var(--ho-accent)" /></svg>
              </div>
              {/* 缩略图预览 */}
              <div style={{ position:'absolute', right:8, bottom:8, width:167, height:73, backgroundColor:'rgba(255,255,255,0.04)', borderRadius:4, border:'1px solid var(--ho-border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:9, color:'var(--ho-text-tertiary)' }}>帧预览</span>
              </div>
            </div>
          </div>

          {/* 音频响度uv及控制 130px (spec) */}
          <div style={{ width:130, flexShrink:0, borderLeft:'1px solid var(--ho-border)', display:'flex', backgroundColor:'var(--ho-bg-secondary)' }}>
            {/* 左侧 65px: 轨道切换 + 响度滑块 (spec) */}
            <div style={{ width:65, display:'flex', flexDirection:'column', alignItems:'center', borderRight:'1px solid var(--ho-border)' }}>
              <select style={{ width:35, marginTop:12, height:24, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:3, fontSize:8, color:'var(--ho-text-secondary)', padding:'0 2px', outline:'none' }}>
                <option>Bus</option>
              </select>
              <div style={{ width:35, flex:1, margin:'8px 0', backgroundColor:'rgba(255,255,255,0.04)', borderRadius:4, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                <input type="range" min={0} max={100} defaultValue={80} style={{ width:3, height:'100%', accentColor:'var(--ho-accent)', alignSelf:'center' }} />
              </div>
            </div>
            {/* 右侧 65px: 响度UV + 数字标识 (spec) */}
            <div style={{ width:65, display:'flex', flexDirection:'column', padding:'8px 0', alignItems:'center' }}>
              <div style={{ display:'flex', gap:1, height:'70%', alignItems:'flex-end' }}>
                <div style={{ width:15, background:'linear-gradient(to top, var(--ho-safe), var(--ho-warning), var(--ho-peak))', borderRadius:'2px 2px 0 0', height:'60%' }} />
                <div style={{ width:15, background:'linear-gradient(to top, var(--ho-safe), var(--ho-warning), var(--ho-peak))', borderRadius:'2px 2px 0 0', height:'80%' }} />
              </div>
              <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-evenly' }}>
                {['0','-12','-24','-inf'].map(l => <span key={l} style={{ fontSize:7, color:'var(--ho-text-tertiary)', textAlign:'center' }}>{l}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
