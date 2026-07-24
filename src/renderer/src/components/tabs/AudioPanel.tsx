import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Toggle } from '../ui/Toggle'
import { useAudioStore } from '../../stores/audioStore'
import { useTimelineStore } from '../../stores/timelineStore'

const EFFECTS_LIBRARY = [
  { name:'降噪',desc:'去除背景噪声' },{ name:'去齿音',desc:'消除齿音嘶声' },
  { name:'去嗡嗡声',desc:'消除低频嗡声' },{ name:'均衡器',desc:'频率均衡调节' },
  { name:'压缩器',desc:'动态范围压缩' },{ name:'混响',desc:'空间混响效果' },
  { name:'延迟',desc:'时间延迟效果' },{ name:'合唱',desc:'合唱镶边效果' },
  { name:'失真',desc:'过载失真效果' },{ name:'限制器',desc:'峰值限制保护' }
]

const LOUDNESS_STANDARDS = ['EBU R128','ATSC A/85','YouTube','Spotify','Apple Music','播客','影院']

export function AudioPanel() {
  const {
    tracks, effects, activeTab, masterVolume, monitorVolume, loudnessStandard,
    setActiveTab, setTrackVolume, toggleMute, toggleSolo, setMasterVolume,
    setMonitorVolume, setLoudnessStandard, addEffect, removeEffect, toggleBypass
  } = useAudioStore()
  const { currentTime } = useTimelineStore()

  const [fftSize, setFftSize] = useState('2048')
  const [windowFn, setWindowFn] = useState('Hann')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let running = true
    const draw = () => {
      if (!running) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const w = canvas.width, h = canvas.height
      ctx.fillStyle = 'rgba(15,18,25,0.6)'
      ctx.fillRect(0, 0, w, h)

      const bars = 20
      const barW = w / bars - 2
      for (let i = 0; i < bars; i++) {
        const val = Math.sin(Date.now() * 0.001 + i * 1.2) * 0.3 + Math.sin(Date.now() * 0.003 + i * 0.5) * 0.3 + 0.4
        const bh = Math.max(2, val * h * 0.85)
        const grad = ctx.createLinearGradient(0, h - bh, 0, h)
        grad.addColorStop(0, 'rgba(122,158,196,0.8)')
        grad.addColorStop(1, 'rgba(122,158,196,0.2)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.roundRect(i * (barW + 2) + 1, h - bh, barW, bh, [2, 2, 0, 0])
        ctx.fill()
      }
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { running = false; cancelAnimationFrame(animRef.current) }
  }, [])

  const handleExportAudio = async () => {
    const api = (window as any).electronAPI
    if (!api) return
    const path = await api.dialog.saveFile({
      title: '导出音频',
      defaultPath: 'audio_export.wav',
      filters: [{ name:'音频文件', extensions:['wav','mp3','flac','aac'] }]
    })
    if (path) {
      try {
        const sampleRate = 48000, duration = 30, channels = 2
        const ctx = new OfflineAudioContext(channels, sampleRate * duration, sampleRate)
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = 440
        const gain = ctx.createGain()
        gain.gain.value = 0.1
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(0)
        const buffer = await ctx.startRendering()
        const wav = encodeWav(buffer)
        const blob = new Blob([wav], { type: 'audio/wav' })
        const arrayBuffer = await blob.arrayBuffer()
        await api.fs.writeFile(path, arrayBuffer)
      } catch (err) {
        console.error('Audio export failed:', err)
      }
    }
  }

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{height:'40px',borderBottom:'1px solid var(--ho-border)',display:'flex',alignItems:'center',padding:'0 12px',gap:'8px',flexShrink:0}}>
        <Icon name="back" size={14} color="var(--ho-text-secondary)" />
        <span style={{fontSize:11,color:'var(--ho-text-secondary)'}}> 返回</span>
        <div style={{width:'1px',height:'16px',backgroundColor:'var(--ho-border)'}} />
        <Icon name="record" size={14} color="var(--ho-text-secondary)" />
        <Icon name="list" size={14} color="var(--ho-text-secondary)" />
        <div style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center',gap:'8px'}}>
          <Icon name="play" size={14} color="var(--ho-text-secondary)" />
          <span style={{fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',fontSize:'12px',letterSpacing:'1px'}}>
            {String(Math.floor(currentTime/60)).padStart(2,'0')}:{String(Math.floor(currentTime%60)).padStart(2,'0')}:{String(Math.floor(currentTime*30%30)).padStart(2,'0')}
          </span>
        </div>
        <select style={{height:'22px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'10px',padding:'0 6px',outline:'none'}}><option>立体声</option><option>单声道</option></select>
        <Button variant="primary" style={{fontSize:'10px',height:'28px'}} onClick={handleExportAudio}>导出音频</Button>
      </div>

      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{height:'20px',borderBottom:'1px solid var(--ho-border)',display:'flex',flexShrink:0}}>
            <div style={{width:'160px',flexShrink:0}} />
            <div style={{flex:1,position:'relative'}}>
              {[0,10,20,30].map(s => (
                <div key={s} style={{position:'absolute',left:`${(s/30)*100}%`,top:0,bottom:0,borderLeft:'1px solid var(--ho-border)'}}>
                  <span style={{fontSize:'8px',color:'var(--ho-text-tertiary)',paddingLeft:'2px'}}>{s}s</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{flex:1,overflow:'auto'}}>
            <div style={{display:'flex'}}>
              <div style={{width:'160px',flexShrink:0}}>
                {tracks.map(t => (
                  <div key={t.id} style={{height:'40px',borderBottom:'1px solid var(--ho-border)',display:'flex',alignItems:'center',padding:'0 6px',gap:'3px',backgroundColor:'var(--ho-bg-secondary)'}}>
                    <div style={{width:'4px',height:'22px',backgroundColor:t.color,borderRadius:'2px',flexShrink:0}} />
                    <span style={{fontSize:'9px',color:'var(--ho-text-secondary)',flex:1}}>{t.name}</span>
                    <Icon name="mute" size={10} color={t.muted?'var(--ho-accent)':'var(--ho-text-tertiary)'} onClick={()=>toggleMute(t.id)} />
                    <Icon name="solo" size={10} color={t.solo?'var(--ho-accent)':'var(--ho-text-tertiary)'} onClick={()=>toggleSolo(t.id)} />
                  </div>
                ))}
              </div>
              <div style={{flex:1,position:'relative',overflow:'hidden'}}>
                {tracks.map((t,i) => (
                  <div key={t.id} style={{height:'40px',borderBottom:'1px solid var(--ho-border)',position:'relative',display:'flex',alignItems:'center',padding:'0 8px'}}>
                    {i < 2 && (
                      <div style={{height:'28px',width:`${60-i*15}%`,backgroundColor:`${t.color}1A`,borderRadius:'4px',display:'flex',alignItems:'center',gap:'1px',padding:'0 4px'}}>
                        {Array.from({length:20}).map((_,j) => (
                          <div key={j} style={{flex:1,height:`${20+Math.sin(j*0.8+Date.now()*0.001)*40}%`,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:'1px'}} />
                        ))}
                      </div>
                    )}
                    <div style={{flex:1}} />
                    <input type="range" min={-60} max={12} value={t.volume} onChange={e=>setTrackVolume(t.id,Number(e.target.value))} style={{width:'40px',height:'3px',transform:'rotate(-90deg)',accentColor:'var(--ho-accent)'}} />
                  </div>
                ))}
                <div style={{position:'absolute',left:`${(currentTime%30/30)*100}%`,top:0,bottom:0,width:'2px',backgroundColor:'var(--ho-accent)',zIndex:10}}>
                  <div style={{width:'8px',height:'8px',backgroundColor:'var(--ho-accent)',clipPath:'polygon(50% 0%, 0% 100%, 100% 100%)',margin:'0 auto'}} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{width:'360px',borderLeft:'1px solid var(--ho-border)',display:'flex',flexDirection:'column',flexShrink:0}}>
          <div style={{display:'flex'}}>
            {['频谱','效果器','特效列表'].map(t => (
              <button key={t} onClick={()=>setActiveTab(t==='频谱'?'spectrum':t==='效果器'?'effects':'library')} style={{
                flex:1,height:'30px',fontSize:'10px',
                color:activeTab===(t==='频谱'?'spectrum':t==='效果器'?'effects':'library')?'var(--ho-accent)':'var(--ho-text-secondary)',
                backgroundColor:activeTab===(t==='频谱'?'spectrum':t==='效果器'?'effects':'library')?'var(--ho-accent-bg)':'transparent',
                borderBottom:activeTab===(t==='频谱'?'spectrum':t==='效果器'?'effects':'library')?'2px solid var(--ho-accent)':'2px solid transparent'
              }}>{t}</button>
            ))}
          </div>
          <div style={{flex:1,overflow:'auto',padding:'12px'}}>
            {activeTab==='spectrum' && (
              <div>
                <canvas ref={canvasRef} width={336} height={120} style={{width:'100%',height:120,backgroundColor:'rgba(0,0,0,0.3)',borderRadius:6,marginBottom:8}} />
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'8px',color:'var(--ho-text-tertiary)',marginBottom:'10px'}}>
                  <span>20Hz</span><span>100</span><span>500</span><span>1k</span><span>5k</span><span>10k</span><span>20kHz</span>
                </div>
                <div style={{display:'flex',gap:'8px'}}>
                  <select value={fftSize} onChange={e=>setFftSize(e.target.value)} style={{flex:1,height:'22px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'9px',padding:'0 4px',outline:'none'}}><option>FFT 1024</option><option>FFT 2048</option><option>FFT 4096</option><option>FFT 8192</option></select>
                  <select value={windowFn} onChange={e=>setWindowFn(e.target.value)} style={{flex:1,height:'22px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'9px',padding:'0 4px',outline:'none'}}><option>Hann</option><option>Hamming</option><option>Blackman</option><option>Kaiser</option></select>
                </div>
              </div>
            )}
            {activeTab==='effects' && (
              <div>
                {effects.length === 0 && (
                  <div style={{ padding:24, textAlign:'center', fontSize:10, color:'var(--ho-text-tertiary)' }}>暂无效果器</div>
                )}
                {effects.map(fx => (
                  <div key={fx.id} style={{marginBottom:'12px',padding:'8px',border:'1px solid var(--ho-border)',borderRadius:'var(--ho-radius-md)'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                      <span style={{fontSize:'10px',color:'var(--ho-text-primary)'}}>{fx.name}</span>
                      <div style={{display:'flex',gap:'6px'}}>
                        <Icon name="check" size={12} color={fx.bypassed?'var(--ho-accent)':'var(--ho-text-tertiary)'} onClick={()=>toggleBypass(fx.id)} />
                        <Icon name="close" size={10} color="var(--ho-text-tertiary)" onClick={()=>removeEffect(fx.id)} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="default" style={{width:'100%',fontSize:'10px',height:'28px',marginTop:'8px'}} onClick={()=>setActiveTab('library')}><Icon name="plus" size={12} color="var(--ho-text-secondary)" /> 添加效果器</Button>
              </div>
            )}
            {activeTab==='library' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                {EFFECTS_LIBRARY.map(fx => (
                  <div key={fx.name} onClick={()=>addEffect({id:`fx_${Date.now()}`,name:fx.name,type:fx.name,bypassed:false,params:{}})} style={{padding:'6px',border:'1px solid var(--ho-border)',borderRadius:'var(--ho-radius-md)',cursor:'pointer'}}>
                    <div style={{fontSize:'9px',color:'var(--ho-text-primary)',marginBottom:'1px'}}>{fx.name}</div>
                    <div style={{fontSize:'8px',color:'var(--ho-text-tertiary)'}}>{fx.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{height:'120px',borderTop:'1px solid var(--ho-border)',display:'flex',flexShrink:0,backgroundColor:'var(--ho-bg-secondary)'}}>
        <div style={{flex:1,padding:'10px',borderRight:'1px solid var(--ho-border)'}}>
          <div style={{fontFamily:'var(--ho-font-family-mono)',fontSize:'24px',color:'var(--ho-accent)',marginBottom:'2px'}}>
            {String(Math.round(currentTime*0.6-18))}.{String(Math.abs(Math.round(Math.sin(Date.now()*0.01)*10)))}
          </div>
          <div style={{fontSize:'9px',color:'var(--ho-text-tertiary)',marginBottom:'6px'}}>LUFS LRA: {Math.abs(Math.round(Math.sin(Date.now()*0.005)*5+2))}.{Math.abs(Math.round(Math.cos(Date.now()*0.007)*10))}</div>
          <div style={{display:'flex',gap:'2px',marginBottom:'4px'}}>
            {Array.from({length:25}).map((_,i) => (
              <div key={i} style={{flex:1,height:'10px',backgroundColor:i<15?'var(--ho-safe)':i<20?'var(--ho-warning)':'var(--ho-peak)',opacity:0.4+(i/25)*0.6}} />
            ))}
          </div>
          <select value={loudnessStandard} onChange={e=>setLoudnessStandard(e.target.value)} style={{height:'18px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'3px',color:'var(--ho-text-secondary)',fontSize:'8px',padding:'0 4px',outline:'none'}}>
            {LOUDNESS_STANDARDS.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{width:'180px',padding:'10px',borderRight:'1px solid var(--ho-border)',display:'flex',gap:'6px',justifyContent:'center',alignItems:'flex-end'}}>
          {tracks.map(t => (
            <div key={t.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'2px'}}>
              <div style={{width:'10px',height:'50px',backgroundColor:'rgba(255,255,255,0.04)',borderRadius:'3px',overflow:'hidden',position:'relative'}}>
                <div style={{position:'absolute',bottom:0,left:0,right:0,height:`${40+Math.sin(Date.now()*0.01+t.id.charCodeAt(1))*20}%`,background:'linear-gradient(to top, var(--ho-safe), var(--ho-warning), var(--ho-peak))',borderRadius:'2px'}} />
              </div>
              <span style={{fontSize:'7px',color:'var(--ho-text-tertiary)'}}>{t.id}</span>
            </div>
          ))}
        </div>
        <div style={{width:'140px',padding:'10px',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',gap:'8px'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}}>
            <span style={{fontSize:'8px',color:'var(--ho-text-tertiary)',marginBottom:'2px'}}>主输出</span>
            <input type="range" min={-60} max={12} value={masterVolume} onChange={e=>setMasterVolume(Number(e.target.value))} style={{width:'60px',height:'3px',accentColor:'var(--ho-accent)'}} />
            <span style={{fontFamily:'var(--ho-font-family-mono)',fontSize:'9px',color:'var(--ho-accent)',marginTop:'2px'}}>{masterVolume} dB</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function encodeWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const format = 1
  const bitDepth = 16
  const channels: Float32Array[] = []
  for (let c = 0; c < numChannels; c++) channels.push(audioBuffer.getChannelData(c))
  const totalSamples = audioBuffer.length
  const buffer = new ArrayBuffer(44 + totalSamples * numChannels * 2)
  const view = new DataView(buffer)
  const write = (offset: number, val: number, bytes: number) => {
    if (bytes === 1) view.setUint8(offset, val)
    else if (bytes === 2) view.setUint16(offset, val, true)
    else view.setUint32(offset, val, true)
  }
  write(0, 0x46464952, 4)
  write(4, 36 + totalSamples * numChannels * 2, 4)
  write(8, 0x45564157, 4)
  write(12, 0x20746D66, 4)
  write(16, 16, 4)
  write(20, format, 2)
  write(22, numChannels, 2)
  write(24, sampleRate, 4)
  write(28, sampleRate * numChannels * 2, 4)
  write(32, numChannels * 2, 2)
  write(34, bitDepth, 2)
  write(36, 0x61746164, 4)
  write(40, totalSamples * numChannels * 2, 4)
  let offset = 44
  for (let i = 0; i < totalSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }
  }
  return buffer
}
