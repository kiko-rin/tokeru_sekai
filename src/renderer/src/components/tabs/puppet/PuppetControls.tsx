import { useState } from 'react'
import { Button } from '../../ui/Button'
import { Slider } from '../../ui/Slider'
import { Icon } from '../../ui/Icon'

interface PuppetControlsProps {
  playing: boolean
  onPlayToggle: () => void
}

export function PuppetControls({ playing, onPlayToggle }: PuppetControlsProps) {
  const [speed, setSpeed] = useState(1)
  const [looping, setLooping] = useState(true)

  return (
    <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
      <Button variant="icon" style={{ fontSize:'10px' }}><Icon name="prev-frame" size={14} color="var(--ho-text-secondary)" /></Button>
      <Button variant="icon" onClick={onPlayToggle} style={{ width:'28px',height:'28px',fontSize:'11px',backgroundColor:playing?'var(--ho-accent-bg)':'transparent' }}>
        {playing ? <Icon name="pause" size={14} color="var(--ho-text-secondary)" /> : <Icon name="play" size={14} color="var(--ho-text-secondary)" />}
      </Button>
      <Button variant="icon" style={{ fontSize:'10px' }}><Icon name="next-frame" size={14} color="var(--ho-text-secondary)" /></Button>
      <span style={{ fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',fontSize:'10px',letterSpacing:'1px' }}>00:00:00:00</span>
      <div style={{ width:'1px',height:'12px',backgroundColor:'var(--ho-border)' }} />
      <span style={{ fontSize:'8px',color:'var(--ho-text-tertiary)' }}>速度</span>
      <input type="range" min={10} max={200} value={speed*100} onChange={e=>setSpeed(Number(e.target.value)/100)} style={{ width:'40px',height:'3px' }} />
      <span style={{ fontSize:'8px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)' }}>{speed}x</span>
      <Button variant="icon" onClick={()=>setLooping(!looping)} style={{ fontSize:'9px',color:looping?'var(--ho-accent)':'var(--ho-text-tertiary)' }}>R</Button>
    </div>
  )
}
