import { useState } from 'react'
import { Button } from '../../ui/Button'
import { KeyframeEngine, type Keyframe } from '../../../lib/drawing/KeyframeEngine'

export function KeyframeTimeline() {
  const [engine] = useState(() => new KeyframeEngine())
  const [currentFrame, setCurrentFrame] = useState(15)
  const [keyframes, setKeyframes] = useState<Keyframe[]>([
    { id:'k1', time:6, layerId:'l1', properties:{ x:0, y:0, scale:1, rotate:0 }, easing:'linear' },
    { id:'k2', time:18, layerId:'l1', properties:{ x:100, y:50, scale:1.2, rotate:45 }, easing:'ease-in-out' },
    { id:'k3', time:33, layerId:'l1', properties:{ x:200, y:0, scale:0.8, rotate:90 }, easing:'ease-out' },
    { id:'k4', time:48, layerId:'l1', properties:{ x:300, y:-50, scale:1, rotate:0 }, easing:'bounce' }
  ])

  const addKeyframe = () => {
    const kf: Keyframe = { id:`k${Date.now()}`, time:currentFrame, layerId:'l1', properties:{ x:0, y:0, scale:1, rotate:0 }, easing:'linear' }
    engine.addKeyframe(kf)
    setKeyframes(engine.getAllKeyframes())
  }

  const removeSelected = () => {
    const toRemove = keyframes.find(k => k.time === currentFrame)
    if (toRemove) { engine.removeKeyframe(toRemove.id); setKeyframes(engine.getAllKeyframes()) }
  }

  const interpolated = engine.interpolate(currentFrame / 60 * 30, 'l1')

  return (
    <div>
      <div style={{ height:'36px', borderBottom:'1px solid var(--ho-border)', position:'relative', marginBottom:'8px' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'10px', display:'flex', alignItems:'center' }}>
          {[0,10,20,30,40,50,60].map(f => (
            <div key={f} style={{ position:'absolute', left:`${(f/60)*100}%`, fontSize:'7px', color:'var(--ho-text-tertiary)' }}>{f}</div>
          ))}
        </div>
        <div style={{ position:'absolute', bottom:0, left:`${(currentFrame/60)*100}%`, width:'6px', height:'6px', backgroundColor:'var(--ho-accent)', clipPath:'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        {keyframes.filter(k => k.layerId === 'l1').map(kf => (
          <div key={kf.id} style={{ position:'absolute', bottom:'10px', left:`${(kf.time/60)*100}%`, width:'5px', height:'5px', backgroundColor:'var(--ho-accent)', borderRadius:'50%', cursor:'pointer' }} onClick={() => setCurrentFrame(kf.time)} />
        ))}
      </div>

      <div style={{ display:'flex', gap:'6px', marginBottom:'8px' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'8px', color:'var(--ho-text-tertiary)', marginBottom:'2px' }}>当前帧</div>
          <input type="number" value={currentFrame} onChange={e => setCurrentFrame(Number(e.target.value))} style={{ width:'100%', height:'20px', backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:'4px', color:'var(--ho-text-primary)', fontSize:'9px', padding:'0 6px', outline:'none' }} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'8px', color:'var(--ho-text-tertiary)', marginBottom:'2px' }}>总帧数</div>
          <div style={{ height:'20px', display:'flex', alignItems:'center', fontSize:'9px', color:'var(--ho-text-tertiary)' }}>/ 60</div>
        </div>
      </div>

      {keyframes.filter(k => k.layerId === 'l1').map(kf => (
        <div key={kf.id} onClick={() => setCurrentFrame(kf.time)} style={{
          display:'flex', justifyContent:'space-between', padding:'2px 6px', cursor:'pointer',
          fontSize:'9px', color: Math.abs(kf.time-currentFrame) < 2 ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
          backgroundColor: Math.abs(kf.time-currentFrame) < 2 ? 'var(--ho-accent-bg)' : 'transparent',
          borderRadius:'4px', marginBottom:'2px'
        }}>
          <span>帧 {kf.time}</span>
          <span>{Object.keys(kf.properties).join('+')}</span>
        </div>
      ))}

      {Object.keys(interpolated).length > 0 && (
        <div style={{ marginTop:'6px', fontSize:'8px', color:'var(--ho-text-tertiary)' }}>
          插值: x={Math.round(interpolated.x||0)} y={Math.round(interpolated.y||0)}
        </div>
      )}

      <div style={{ display:'flex', gap:'6px', marginTop:'8px' }}>
        <Button variant="primary" style={{ flex:1, height:'22px', fontSize:'9px' }} onClick={addKeyframe}>添加关键帧</Button>
        <Button variant="ghost" style={{ flex:1, height:'22px', fontSize:'9px' }} onClick={removeSelected}>删除</Button>
      </div>
    </div>
  )
}
