import { useRef, useState } from 'react'
import { Button } from '../../ui/Button'

export function PuppetCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [bgColor, setBgColor] = useState('#1a1a1a')
  const [debug, setDebug] = useState(false)

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', backgroundColor:'var(--ho-bg-primary)', position:'relative' }}>
      <canvas ref={canvasRef} width={960} height={540} style={{ maxWidth:'100%', maxHeight:'100%', backgroundColor: bgColor, borderRadius:'4px' }} />
      <div style={{ position:'absolute', top:'8px', right:'8px', display:'flex', gap:'6px', alignItems:'center' }}>
        <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} style={{ width:'24px', height:'24px', padding:0, border:'none', borderRadius:'4px', cursor:'pointer' }} />
        <Button variant="icon" onClick={()=>setDebug(!debug)} style={{ fontSize:'9px', color: debug ? 'var(--ho-accent)' : 'var(--ho-text-tertiary)' }}>D</Button>
      </div>
    </div>
  )
}
