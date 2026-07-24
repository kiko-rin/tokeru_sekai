import { useState, useCallback, useMemo } from 'react'
import { Button } from '../ui/Button'
import { Panel } from '../ui/Panel'
import { Input } from '../ui/Input'
import { Icon } from '../ui/Icon'
import { useTimelineStore } from '../../stores/timelineStore'

type BitrateMode = 'CBR' | 'VCRF'
type Container = 'MP4' | 'MKV' | 'MOV' | 'WebM'

const CODEC_CONTAINERS: Record<string, Container[]> = {
  'H.264': ['MP4', 'MKV', 'MOV'],
  'H.265 (HEVC)': ['MP4', 'MKV', 'MOV'],
  'VP9': ['WebM', 'MKV'],
  'AV1': ['WebM', 'MKV', 'MP4']
}

const PRESETS = [
  { name:'YouTube 1080p', codec:'H.264', container:'MP4' as Container, res:'1920x1080', fps:30, mode:'CBR' as BitrateMode, bitrate:15 },
  { name:'YouTube 4K', codec:'H.265 (HEVC)', container:'MP4' as Container, res:'3840x2160', fps:30, mode:'CBR' as BitrateMode, bitrate:45 },
  { name:'B站 1080p', codec:'H.264', container:'MP4' as Container, res:'1920x1080', fps:30, mode:'CBR' as BitrateMode, bitrate:12 },
  { name:'抖音/快手', codec:'H.264', container:'MP4' as Container, res:'1080x1920', fps:30, mode:'CBR' as BitrateMode, bitrate:10 },
  { name:'Twitter/X', codec:'H.264', container:'MP4' as Container, res:'1280x720', fps:30, mode:'CBR' as BitrateMode, bitrate:5 },
  { name:'归档最高质量', codec:'H.265 (HEVC)', container:'MKV' as Container, res:'原始', fps:30, mode:'VCRF' as BitrateMode, crf:18 },
  { name:'快速预览', codec:'H.264', container:'MP4' as Container, res:'1280x720', fps:30, mode:'CBR' as BitrateMode, bitrate:5 },
  { name:'Web 优化', codec:'VP9', container:'WebM' as Container, res:'1920x1080', fps:30, mode:'VCRF' as BitrateMode, crf:25 },
  { name:'ProRes 代理', codec:'PCM', container:'MOV' as Container, res:'1920x1080', fps:30, mode:'CBR' as BitrateMode, bitrate:0 }
]

const RES_OPTIONS = ['1280x720', '1920x1080', '2560x1440', '3840x2160', '自定义']
const FPS_OPTIONS = ['24', '25', '30', '48', '50', '60']
const PRESETS_ENC = ['ultrafast','superfast','veryfast','faster','fast','medium','slow','slower','veryslow']
const PROFILES = ['baseline', 'main', 'high']

const BITRATE_RECS: Record<string, number> = {
  '1280x720': 8, '1920x1080': 20, '2560x1440': 32, '3840x2160': 60
}

export function PublishPanel() {
  const { tracks } = useTimelineStore()

  const [codec, setCodec] = useState('H.264')
  const [container, setContainer] = useState<Container>('MP4')
  const [resolution, setResolution] = useState('1920x1080')
  const [customW, setCustomW] = useState(1920)
  const [customH, setCustomH] = useState(1080)
  const [fps, setFps] = useState('30')
  const [bitrateMode, setBitrateMode] = useState<BitrateMode>('VCRF')
  const [bitrate, setBitrate] = useState(20)
  const [crf, setCrf] = useState(23)
  const [maxBitrate, setMaxBitrate] = useState(50)
  const [encoder, setEncoder] = useState('软件编码')
  const [selectedPreset, setSelectedPreset] = useState(-1)
  const [audioCodec, setAudioCodec] = useState('AAC')
  const [audioBitrate, setAudioBitrate] = useState('256 kbps')
  const [sampleRate, setSampleRate] = useState('48000 Hz')
  const [channels, setChannels] = useState('立体声')
  const [colorSpace, setColorSpace] = useState('Rec.709')
  const [outputPath, setOutputPath] = useState('~/Videos/')
  const [filenameTmpl, setFilenameTmpl] = useState('{project}_{date}')
  const [rendering, setRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [encPreset, setEncPreset] = useState('medium')
  const [profile, setProfile] = useState('high')
  const [bFrames, setBFrames] = useState(3)
  const [gop, setGop] = useState(250)

  const projectDuration = useMemo(() => {
    let maxEnd = 0
    for (const t of tracks) for (const c of t.clips) { const e = c.start + c.duration; if (e > maxEnd) maxEnd = e }
    return maxEnd || 30
  }, [tracks])
  const estimatedSize = Math.round(projectDuration * (bitrateMode === 'CBR' ? bitrate : 30) * 0.125)

  const handleCodecChange = (c: string) => {
    setCodec(c)
    const containers = CODEC_CONTAINERS[c] || ['MP4']
    if (!containers.includes(container)) setContainer(containers[0])
    if ((c === 'VP9' || c === 'AV1') && encoder !== '软件编码') setEncoder('软件编码')
    if (c === 'H.264' || c === 'H.265 (HEVC)') setContainer('MP4')
  }

  const handleResolutionChange = (r: string) => {
    setResolution(r)
    const rec = BITRATE_RECS[r]
    if (rec) { setBitrate(rec); setMaxBitrate(rec * 2.5) }
  }

  const applyPreset = (i: number) => {
    const p = PRESETS[i]
    if (!p) return
    setSelectedPreset(i)
    setCodec(p.codec)
    setContainer(p.container)
    setResolution(p.res === '原始' ? resolution : p.res)
    setFps(String(p.fps))
    setBitrateMode(p.mode)
    if (p.mode === 'VCRF') setCrf(p.crf || 23)
    else setBitrate(p.bitrate || 15)
  }

  return (
    <div style={{ flex:1, overflow:'auto', display:'flex', justifyContent:'center' }}>
      <div style={{ maxWidth:800, width:'100%', padding:'24px', display:'flex', flexDirection:'column', gap:16 }}>
        {/* 预览 */}
        <Panel style={{ padding:0, overflow:'hidden' }}>
          <div style={{ aspectRatio:'16/9', backgroundColor:'#000', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', backgroundColor:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name="play" size={18} color="rgba(255,255,255,0.6)" />
            </div>
          </div>
          <div style={{ padding:'6px 16px', fontSize:10, color:'var(--ho-text-tertiary)', textAlign:'right' }}>
            {rendering ? `渲染中... ${Math.round(progress)}%` : `时长: ${String(Math.floor(projectDuration/60)).padStart(2,'0')}:${String(Math.floor(projectDuration%60)).padStart(2,'0')} - 预计大小: ~${Math.max(1, estimatedSize)} MB`}
          </div>
        </Panel>

        {/* 预设 */}
        <Panel>
          <div style={{ fontSize:13, fontFamily:'var(--ho-font-family-title)', color:'var(--ho-text-primary)', marginBottom:12, fontWeight:600 }}>预设</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
            {PRESETS.map((p,i) => (
              <div key={p.name} onClick={()=>applyPreset(i)} style={{
                padding:'6px', borderRadius:'var(--ho-radius-sm)', cursor:'pointer', textAlign:'center',
                border: selectedPreset===i ? '1px solid var(--ho-accent)' : '1px solid var(--ho-border)',
                backgroundColor: selectedPreset===i ? 'var(--ho-accent-bg)' : 'transparent',
                fontSize:9, color: selectedPreset===i?'var(--ho-accent)':'var(--ho-text-secondary)'
              }}>{p.name}</div>
            ))}
          </div>
        </Panel>

        {/* 视频编码 */}
        <Panel>
          <div style={{ fontSize:13, fontFamily:'var(--ho-font-family-title)', color:'var(--ho-text-primary)', marginBottom:12, fontWeight:600 }}>视频编码</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:3 }}>编码格式</div>
              <select value={codec} onChange={e=>handleCodecChange(e.target.value)} style={{ width:'100%', height:30, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:12, padding:'0 8px', outline:'none' }}>
                <option>H.264</option><option>H.265 (HEVC)</option><option>VP9</option><option>AV1</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:3 }}>封装格式</div>
              <select value={container} onChange={e=>setContainer(e.target.value as Container)} style={{ width:'100%', height:30, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:12, padding:'0 8px', outline:'none' }}>
                {(CODEC_CONTAINERS[codec]||['MP4']).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:3 }}>分辨率</div>
              <select value={resolution} onChange={e=>handleResolutionChange(e.target.value)} style={{ width:'100%', height:30, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:12, padding:'0 8px', outline:'none' }}>
                {RES_OPTIONS.map(r => <option key={r}>{r}</option>)}
              </select>
              {resolution === '自定义' && (
                <div style={{ display:'flex', gap:6, marginTop:4 }}>
                  <Input type="number" value={customW} onChange={e=>setCustomW(Number(e.target.value))} style={{ flex:1, fontSize:11, height:26 }} />
                  <span style={{ fontSize:10, color:'var(--ho-text-tertiary)', alignSelf:'center' }}>x</span>
                  <Input type="number" value={customH} onChange={e=>setCustomH(Number(e.target.value))} style={{ flex:1, fontSize:11, height:26 }} />
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:3 }}>帧率</div>
              <select value={fps} onChange={e=>setFps(e.target.value)} style={{ width:'100%', height:30, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:12, padding:'0 8px', outline:'none' }}>
                {FPS_OPTIONS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:6 }}>码率模式</div>
            <div style={{ display:'flex', gap:6, marginBottom:6 }}>
              {(['VCRF', 'CBR'] as BitrateMode[]).map(m => (
                <button key={m} onClick={()=>setBitrateMode(m)} style={{
                  flex:1, height:28, borderRadius:4, fontSize:11,
                  backgroundColor: bitrateMode===m ? 'var(--ho-accent)' : 'var(--ho-bg-tertiary)',
                  color: bitrateMode===m ? '#0e1318' : 'var(--ho-text-secondary)',
                  border:'none', fontWeight: bitrateMode===m ? 500 : 400, cursor:'pointer'
                }}>{m === 'VCRF' ? 'VCRF (动态码率)' : 'CBR (固定码率)'}</button>
              ))}
            </div>
            {bitrateMode === 'CBR' ? (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:10, color:'var(--ho-text-tertiary)', width:54 }}>视频码率</span>
                <input type="range" min={1} max={100} step={0.5} value={bitrate} onChange={e=>setBitrate(Number(e.target.value))} style={{ flex:1, height:4, accentColor:'var(--ho-accent)' }} />
                <Input type="number" value={bitrate} onChange={e=>setBitrate(Number(e.target.value))} style={{ width:56, fontSize:11, height:26, textAlign:'right' }} />
                <span style={{ fontSize:10, fontFamily:'monospace', color:'var(--ho-accent)' }}>Mbps</span>
              </div>
            ) : (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:10, color:'var(--ho-text-tertiary)', width:54 }}>质量因子</span>
                  <input type="range" min={0} max={51} step={1} value={crf} onChange={e=>setCrf(Number(e.target.value))} style={{ flex:1, height:4, accentColor:'var(--ho-accent)' }} />
                  <Input type="number" value={crf} onChange={e=>setCrf(Number(e.target.value))} style={{ width:48, fontSize:11, height:26, textAlign:'right' }} />
                </div>
                <div style={{ fontSize:8, color:'var(--ho-text-tertiary)', lineHeight:1.6, marginBottom:6 }}>
                  {crf <= 0 ? '无损' : crf <= 18 ? '视觉无损' : crf <= 23 ? '默认质量' : crf <= 28 ? '较差' : '最差'}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:10, color:'var(--ho-text-tertiary)', width:54 }}>上限码率</span>
                  <input type="range" min={5} max={200} step={1} value={maxBitrate} onChange={e=>setMaxBitrate(Number(e.target.value))} style={{ flex:1, height:4, accentColor:'var(--ho-accent)' }} />
                  <Input type="number" value={maxBitrate} onChange={e=>setMaxBitrate(Number(e.target.value))} style={{ width:56, fontSize:11, height:26, textAlign:'right' }} />
                  <span style={{ fontSize:10, fontFamily:'monospace', color:'var(--ho-accent)' }}>Mbps</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:12 }}>
            <div>
              <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:3 }}>编码器</div>
              <select value={encoder} onChange={e=>setEncoder(e.target.value)} disabled={codec === 'VP9' || codec === 'AV1'} style={{ width:'100%', height:30, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:(codec==='VP9'||codec==='AV1')?'var(--ho-text-tertiary)':'var(--ho-text-secondary)', fontSize:12, padding:'0 8px', outline:'none' }}>
                <option>软件编码</option><option>NVIDIA NVENC</option><option>AMD AMF</option><option>Intel QSV</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:3 }}>色彩空间</div>
              <select value={colorSpace} onChange={e=>setColorSpace(e.target.value)} style={{ width:'100%', height:30, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:12, padding:'0 8px', outline:'none' }}>
                <option>Rec.709</option><option>sRGB</option><option>Rec.2020</option><option>DCI-P3</option>
              </select>
            </div>
          </div>

          {/* 高级参数折叠 */}
          <div style={{ marginTop:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:11, color:'var(--ho-text-secondary)' }} onClick={()=>setShowAdvanced(!showAdvanced)}>
              <span style={{ transform: showAdvanced ? 'rotate(90deg)' : '', transition:'transform 120ms', fontSize:10 }}>{'>'}</span>
              <span>高级参数</span>
            </div>
            {showAdvanced && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8, padding:'12px', border:'1px solid var(--ho-border)', borderRadius:'var(--ho-radius-sm)' }}>
                <div>
                  <div style={{ fontSize:9, color:'var(--ho-text-tertiary)', marginBottom:2 }}>编码 Preset</div>
                  <select value={encPreset} onChange={e=>setEncPreset(e.target.value)} style={{ width:'100%', height:26, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:10, padding:'0 6px', outline:'none' }}>
                    {PRESETS_ENC.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:9, color:'var(--ho-text-tertiary)', marginBottom:2 }}>Profile (H.264)</div>
                  <select value={profile} onChange={e=>setProfile(e.target.value)} style={{ width:'100%', height:26, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:10, padding:'0 6px', outline:'none' }}>
                    {PROFILES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:9, color:'var(--ho-text-tertiary)', marginBottom:2 }}>B 帧数</div>
                  <Input type="number" value={bFrames} onChange={e=>setBFrames(Number(e.target.value))} style={{ fontSize:10, height:26 }} />
                </div>
                <div>
                  <div style={{ fontSize:9, color:'var(--ho-text-tertiary)', marginBottom:2 }}>GOP 大小</div>
                  <Input type="number" value={gop} onChange={e=>setGop(Number(e.target.value))} style={{ fontSize:10, height:26 }} />
                </div>
              </div>
            )}
          </div>
        </Panel>

        {/* 音频编码 */}
        <Panel>
          <div style={{ fontSize:13, fontFamily:'var(--ho-font-family-title)', color:'var(--ho-text-primary)', marginBottom:12, fontWeight:600 }}>音频编码</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:3 }}>编码</div>
              <select value={audioCodec} onChange={e=>setAudioCodec(e.target.value)} style={{ width:'100%', height:30, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:12, padding:'0 8px', outline:'none' }}>
                <option>AAC</option><option>FLAC</option><option>OPUS</option><option>PCM</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:3 }}>码率</div>
              <select value={audioBitrate} onChange={e=>setAudioBitrate(e.target.value)} disabled={audioCodec === 'FLAC' || audioCodec === 'PCM'} style={{ width:'100%', height:30, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:(audioCodec==='FLAC'||audioCodec==='PCM')?'var(--ho-text-tertiary)':'var(--ho-text-secondary)', fontSize:12, padding:'0 8px', outline:'none' }}>
                <option>128 kbps</option><option>192 kbps</option><option>256 kbps</option><option>320 kbps</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:3 }}>采样率</div>
              <select value={sampleRate} onChange={e=>setSampleRate(e.target.value)} style={{ width:'100%', height:30, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:12, padding:'0 8px', outline:'none' }}>
                <option>22050 Hz</option><option>44100 Hz</option><option>48000 Hz</option><option>96000 Hz</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:3 }}>声道</div>
              <select value={channels} onChange={e=>setChannels(e.target.value)} style={{ width:'100%', height:30, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:12, padding:'0 8px', outline:'none' }}>
                <option>单声道</option><option>立体声</option><option>5.1 环绕声</option><option>7.1 环绕声</option>
              </select>
            </div>
          </div>
        </Panel>

        {/* 输出设置 */}
        <Panel>
          <div style={{ fontSize:13, fontFamily:'var(--ho-font-family-title)', color:'var(--ho-text-primary)', marginBottom:12, fontWeight:600 }}>输出设置</div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:3 }}>输出路径</div>
            <div style={{ display:'flex', gap:6 }}>
              <Input value={outputPath} onChange={e=>setOutputPath(e.target.value)} style={{ flex:1, fontSize:11 }} />
              <Button variant="default" style={{ fontSize:10, height:30 }} onClick={async ()=>{ const api=(window as any).electronAPI; if(api){const d=await api.dialog.openDirectory({title:'选择输出目录'}); if(d) setOutputPath(d) }}}>浏览</Button>
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:3 }}>文件名模板</div>
            <Input value={filenameTmpl} onChange={e=>setFilenameTmpl(e.target.value)} style={{ fontSize:11 }} />
            <div style={{ fontSize:8, color:'var(--ho-text-tertiary)', marginTop:3 }}>
              支持变量: &#123;project&#125; &#123;date&#125; &#123;time&#125; &#123;resolution&#125; &#123;fps&#125; &#123;codec&#125;
            </div>
          </div>
          <div style={{ fontSize:10, color:'var(--ho-text-tertiary)' }}>
            输出示例: {filenameTmpl.replace('{project}','项目').replace('{date}','2024-01-15')}.{container.toLowerCase()}
          </div>
        </Panel>

        {/* 操作按钮 */}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Button variant="default" style={{ fontSize:11 }}>保存预设</Button>
          <Button variant="default" style={{ fontSize:11 }}>添加到队列</Button>
          <Button variant="primary" style={{ height:40, padding:'0 24px', fontSize:13 }} disabled={rendering}>
            {rendering ? `渲染中 ${Math.round(progress)}%` : '开始渲染'}
          </Button>
        </div>
      </div>
    </div>
  )
}
