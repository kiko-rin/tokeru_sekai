import { useState, useCallback, useMemo } from 'react'
import { Button } from '../ui/Button'
import { Panel } from '../ui/Panel'
import { Input } from '../ui/Input'
import { useTimelineStore } from '../../stores/timelineStore'
import { Icon } from '../ui/Icon'

const BUILTIN_PRESETS = [
  { name:'YouTube 1080p', codec:'H.264', container:'MP4', res:'1920x1080', fps:30, bitrate:15 },
  { name:'B站 1080p', codec:'H.264', container:'MP4', res:'1920x1080', fps:30, bitrate:12 },
  { name:'抖音/快手', codec:'H.264', container:'MP4', res:'1080x1920', fps:30, bitrate:10 },
  { name:'归档最高质量', codec:'H.265', container:'MKV', res:'原始', fps:30, bitrateMode:'VCRF' as const, crf:18 },
  { name:'快速预览', codec:'H.264', container:'MP4', res:'1280x720', fps:30, bitrate:5 },
  { name:'Web 优化', codec:'VP9', container:'WebM', res:'1920x1080', fps:30, bitrateMode:'VCRF' as const, crf:25 }
]

const codecContainerMap: Record<string,string[]> = {
  'H.264': ['MP4','MKV','MOV'],
  'H.265 (HEVC)': ['MP4','MKV','MOV'],
  'VP9': ['WebM','MKV'],
  'AV1': ['WebM','MKV','MP4']
}

export function PublishPanel() {
  const [codec, setCodec] = useState('H.264')
  const [container, setContainer] = useState('MP4')
  const [resolution, setResolution] = useState('1920x1080')
  const [fps, setFps] = useState('30')
  const [bitrateMode, setBitrateMode] = useState<'CBR'|'VCRF'>('CBR')
  const [bitrate, setBitrate] = useState(20)
  const [crf, setCrf] = useState(23)
  const [encoder, setEncoder] = useState('软件编码')
  const [audioCodec, setAudioCodec] = useState('AAC')
  const [audioBitrate, setAudioBitrate] = useState('256 kbps')
  const [sampleRate, setSampleRate] = useState('48000 Hz')
  const [channels, setChannels] = useState('立体声')
  const [outputPath, setOutputPath] = useState('~/Videos/')
  const [filenameTmpl, setFilenameTmpl] = useState('{project}_{date}')
  const [selectedPreset, setSelectedPreset] = useState(-1)
  const [rendering, setRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const { tracks } = useTimelineStore()

  const projectDuration = useMemo(() => {
    let maxEnd = 0
    for (const t of tracks) for (const c of t.clips) {
      const end = c.start + c.duration
      if (end > maxEnd) maxEnd = end
    }
    return maxEnd || 30
  }, [tracks])

  const estimatedSize = Math.round(projectDuration * bitrate * 0.125) // MB

  const handleCodecChange = (c: string) => {
    setCodec(c)
    const containers = codecContainerMap[c] || ['MP4']
    if (!containers.includes(container)) setContainer(containers[0])
  }

  const applyPreset = (i: number) => {
    const p = BUILTIN_PRESETS[i]
    if (!p) return
    setSelectedPreset(i)
    setCodec(p.codec); setContainer(p.container); setResolution(p.res); setFps(String(p.fps))
    if ('bitrateMode' in p && p.bitrateMode === 'VCRF') {
      setBitrateMode('VCRF'); setCrf(p.crf || 23)
    } else { setBitrateMode('CBR'); setBitrate(p.bitrate || 15) }
  }

  const handleBrowseOutput = async () => {
    const api = (window as any).electronAPI
    if (!api) return
    const dir = await api.dialog.openDirectory({ title:'选择输出目录' })
    if (dir) setOutputPath(dir)
  }

  const handleRender = useCallback(async () => {
    const api = (window as any).electronAPI
    if (!api) return
    const savePath = await api.dialog.saveFile({
      title: '保存渲染结果',
      defaultPath: `${filenameTmpl.replace('{project}','项目').replace('{date}','2024-01-15')}.${container.toLowerCase()}`,
      filters: [{ name:'视频文件', extensions:['mp4','mkv','mov','webm'] }]
    })
    if (!savePath) return

    setRendering(true); setProgress(0)
    try {
      const api = (window as any).electronAPI
      if (api) {
        await api.fs.writeTextFile(savePath, JSON.stringify({
          codec, container, resolution, fps, bitrate, audioCodec, audioBitrate, sampleRate, channels
        }, null, 2))
      }
      // simulate progress
      for (let p = 0; p <= 100; p += 5) {
        await new Promise(r => setTimeout(r, 50))
        setProgress(p)
      }
    } catch (err) {
      console.error('Render failed:', err)
    } finally {
      setRendering(false)
    }
  }, [codec, container, resolution, fps, bitrate, filenameTmpl])

  return (
    <div style={{flex:1,overflow:'auto',display:'flex',justifyContent:'center'}}>
      <div style={{maxWidth:'800px',width:'100%',padding:'24px',display:'flex',flexDirection:'column',gap:'16px'}}>
        <Panel style={{padding:0,overflow:'hidden'}}>
          <div style={{aspectRatio:'16/9',backgroundColor:'#000',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:'48px',height:'48px',borderRadius:'50%',backgroundColor:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="play" size={18} color="rgba(255,255,255,0.6)" />
            </div>
          </div>
          <div style={{padding:'6px 16px',fontSize:'10px',color:'var(--ho-text-tertiary)',textAlign:'right'}}>
            {rendering ? `渲染中... ${Math.round(progress)}%` : `时长: ${String(Math.floor(projectDuration/60)).padStart(2,'0')}:${String(Math.floor(projectDuration%60)).padStart(2,'0')} - 预计大小: ~${Math.max(1, estimatedSize)} MB`}
          </div>
        </Panel>

        <Panel>
          <h3 style={{fontFamily:'var(--ho-font-family-title)',fontSize:'14px',color:'var(--ho-text-primary)',marginBottom:'12px',fontWeight:600}}>预设</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginBottom:'12px'}}>
            {BUILTIN_PRESETS.map((p,i) => (
              <div key={p.name} onClick={()=>applyPreset(i)} style={{
                padding:'6px',borderRadius:'var(--ho-radius-sm)',cursor:'pointer',textAlign:'center',
                border:selectedPreset===i?'1px solid var(--ho-accent)':'1px solid var(--ho-border)',
                backgroundColor:selectedPreset===i?'var(--ho-accent-bg)':'transparent',
                fontSize:'9px',color:selectedPreset===i?'var(--ho-accent)':'var(--ho-text-secondary)'
              }}>{p.name}</div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h3 style={{fontFamily:'var(--ho-font-family-title)',fontSize:'14px',color:'var(--ho-text-primary)',marginBottom:'12px',fontWeight:600}}>视频编码</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <div><div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'3px'}}>编码格式</div>
              <select value={codec} onChange={e=>handleCodecChange(e.target.value)} style={{width:'100%',height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'11px',padding:'0 6px',outline:'none'}}><option>H.264</option><option>H.265 (HEVC)</option><option>VP9</option><option>AV1</option></select></div>
            <div><div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'3px'}}>封装格式</div>
              <select value={container} onChange={e=>setContainer(e.target.value)} style={{width:'100%',height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'11px',padding:'0 6px',outline:'none'}}>{(codecContainerMap[codec]||['MP4']).map(c=><option key={c}>{c}</option>)}</select></div>
            <div><div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'3px'}}>分辨率</div>
              <select value={resolution} onChange={e=>setResolution(e.target.value)} style={{width:'100%',height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'11px',padding:'0 6px',outline:'none'}}><option>1920x1080</option><option>3840x2160</option><option>1280x720</option><option>自定义</option></select></div>
            <div><div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'3px'}}>帧率</div>
              <select value={fps} onChange={e=>setFps(e.target.value)} style={{width:'100%',height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'11px',padding:'0 6px',outline:'none'}}><option>24</option><option>25</option><option>30</option><option>60</option></select></div>
          </div>
          <div style={{marginTop:'10px'}}>
            <div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'6px'}}>码率模式</div>
            <div style={{display:'flex',gap:'6px',marginBottom:'6px'}}>
              <button onClick={()=>setBitrateMode('CBR')} style={{flex:1,height:'26px',borderRadius:'4px',fontSize:'10px',backgroundColor:bitrateMode==='CBR'?'var(--ho-accent)':'var(--ho-bg-tertiary)',color:bitrateMode==='CBR'?'#0e1318':'var(--ho-text-secondary)'}}>CBR</button>
              <button onClick={()=>setBitrateMode('VCRF')} style={{flex:1,height:'26px',borderRadius:'4px',fontSize:'10px',backgroundColor:bitrateMode==='VCRF'?'var(--ho-accent)':'var(--ho-bg-tertiary)',color:bitrateMode==='VCRF'?'#0e1318':'var(--ho-text-secondary)'}}>VCRF</button>
            </div>
            {bitrateMode==='CBR' ? (
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <span style={{fontSize:'10px',color:'var(--ho-text-secondary)',width:'54px'}}>视频码率</span>
                <input type="range" min={1} max={100} step={0.5} value={bitrate} onChange={e=>setBitrate(Number(e.target.value))} style={{flex:1,height:'3px',accentColor:'var(--ho-accent)'}} />
                <span style={{fontSize:'10px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',width:'44px',textAlign:'right'}}>{bitrate} Mbps</span>
              </div>
            ) : (
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <span style={{fontSize:'10px',color:'var(--ho-text-secondary)',width:'54px'}}>质量因子</span>
                <input type="range" min={0} max={51} step={1} value={crf} onChange={e=>setCrf(Number(e.target.value))} style={{flex:1,height:'3px',accentColor:'var(--ho-accent)'}} />
                <span style={{fontSize:'10px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',width:'44px',textAlign:'right'}}>{crf}</span>
              </div>
            )}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginTop:'10px'}}>
            <div>
              <div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'3px'}}>编码器</div>
              <select value={encoder} onChange={e=>setEncoder(e.target.value)} style={{width:'100%',height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'11px',padding:'0 6px',outline:'none'}}><option>软件编码</option><option>NVIDIA NVENC</option><option>AMD AMF</option><option>Intel QSV</option></select>
            </div>
            <div>
              <div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'3px'}}>色彩空间</div>
              <select style={{width:'100%',height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'11px',padding:'0 6px',outline:'none'}}><option>Rec.709</option><option>Rec.2020</option><option>sRGB</option></select>
            </div>
          </div>
        </Panel>

        <Panel>
          <h3 style={{fontFamily:'var(--ho-font-family-title)',fontSize:'14px',color:'var(--ho-text-primary)',marginBottom:'12px',fontWeight:600}}>音频编码</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <div><div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'3px'}}>编码</div>
              <select value={audioCodec} onChange={e=>setAudioCodec(e.target.value)} style={{width:'100%',height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'11px',padding:'0 6px',outline:'none'}}><option>AAC</option><option>FLAC</option><option>OPUS</option><option>PCM</option></select></div>
            <div><div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'3px'}}>码率</div>
              <select value={audioBitrate} onChange={e=>setAudioBitrate(e.target.value)} style={{width:'100%',height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'11px',padding:'0 6px',outline:'none'}}><option>128 kbps</option><option>192 kbps</option><option>256 kbps</option><option>320 kbps</option></select></div>
            <div><div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'3px'}}>采样率</div>
              <select value={sampleRate} onChange={e=>setSampleRate(e.target.value)} style={{width:'100%',height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'11px',padding:'0 6px',outline:'none'}}><option>44100 Hz</option><option>48000 Hz</option><option>96000 Hz</option></select></div>
            <div><div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'3px'}}>声道</div>
              <select value={channels} onChange={e=>setChannels(e.target.value)} style={{width:'100%',height:'28px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'11px',padding:'0 6px',outline:'none'}}><option>单声道</option><option>立体声</option><option>5.1 环绕声</option><option>7.1 环绕声</option></select></div>
          </div>
        </Panel>

        <Panel>
          <h3 style={{fontFamily:'var(--ho-font-family-title)',fontSize:'14px',color:'var(--ho-text-primary)',marginBottom:'12px',fontWeight:600}}>输出设置</h3>
          <div style={{marginBottom:'10px'}}>
            <div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'3px'}}>输出路径</div>
            <div style={{display:'flex',gap:'6px'}}>
              <Input value={outputPath} onChange={e=>setOutputPath(e.target.value)} style={{flex:1,fontSize:'11px'}} />
              <Button variant="default" style={{fontSize:'10px',height:'28px'}} onClick={handleBrowseOutput}>浏览</Button>
            </div>
          </div>
          <div>
            <div style={{fontSize:'10px',color:'var(--ho-text-tertiary)',marginBottom:'3px'}}>文件名模板</div>
            <Input value={filenameTmpl} onChange={e=>setFilenameTmpl(e.target.value)} style={{fontSize:'11px'}} />
          </div>
        </Panel>

        <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
          <Button variant="default" style={{fontSize:'11px'}}>保存预设</Button>
          <Button variant="default" style={{fontSize:'11px'}}>添加到队列</Button>
          <Button variant="primary" style={{height:'38px',padding:'0 20px',fontSize:'13px'}} onClick={handleRender} disabled={rendering}>
            {rendering ? `渲染中 ${Math.round(progress)}%` : '开始渲染'}
          </Button>
        </div>
      </div>
    </div>
  )
}
