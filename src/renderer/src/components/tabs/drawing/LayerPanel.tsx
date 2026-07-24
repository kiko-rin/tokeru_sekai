import { useState } from 'react'
import { Button } from '../../ui/Button'
import { Slider } from '../../ui/Slider'
import { Icon } from '../../ui/Icon'

interface LayerItem {
  id: string; name: string; visible: boolean; locked: boolean; opacity: number; color: string
}

const DEFAULT_LAYERS: LayerItem[] = [
  { id:'l5',name:'MR合成预览',visible:true,locked:false,opacity:75,color:'#555' },
  { id:'l4',name:'高光',visible:true,locked:false,opacity:100,color:'#4a4a4a' },
  { id:'l3',name:'阴影',visible:true,locked:false,opacity:60,color:'#404040' },
  { id:'l2',name:'底色',visible:true,locked:false,opacity:100,color:'#464646' },
  { id:'l1',name:'线稿',visible:true,locked:false,opacity:100,color:'#505050' }
]

interface LayerPanelProps {
  activeLayerId: string | null
  onLayerSelect: (id: string) => void
}

export function LayerPanel({ activeLayerId, onLayerSelect }: LayerPanelProps) {
  const [layers, setLayers] = useState(DEFAULT_LAYERS)
  const [layerOpacity, setLayerOpacity] = useState(100)

  const toggleVisible = (id: string) => setLayers(layers.map(l => l.id===id ? {...l,visible:!l.visible} : l))
  const toggleLock = (id: string) => setLayers(layers.map(l => l.id===id ? {...l,locked:!l.locked} : l))

  return (
    <>
      <div style={{ display:'flex',gap:'4px',padding:'8px',borderBottom:'1px solid var(--ho-border)' }}>
        <Button variant="icon" style={{fontSize:'10px'}}><Icon name="plus" size={12} color="var(--ho-text-secondary)" /></Button>
        <Button variant="icon" style={{fontSize:'10px'}}><Icon name="close" size={12} color="var(--ho-text-secondary)" /></Button>
        <Button variant="icon" style={{fontSize:'10px'}}><Icon name="fullscreen" size={12} color="var(--ho-text-secondary)" /></Button>
        <Button variant="icon" style={{fontSize:'10px'}}><Icon name="fullscreen" size={12} color="var(--ho-text-secondary)" /></Button>
        <select style={{flex:1,height:'22px',backgroundColor:'var(--ho-bg-tertiary)',border:'1px solid var(--ho-border)',borderRadius:'4px',color:'var(--ho-text-secondary)',fontSize:'9px',padding:'0 4px',outline:'none'}}>
          <option>正常</option><option>正片叠底</option><option>滤色</option>
        </select>
      </div>
      <div style={{flex:1,overflow:'auto'}}>
        {layers.map(layer => (
          <div key={layer.id} onClick={() => onLayerSelect(layer.id)} style={{
            display:'flex',alignItems:'center',gap:'4px',padding:'5px 8px',cursor:'pointer',height:'30px',
            borderLeft: activeLayerId===layer.id ? '3px solid var(--ho-accent)' : '3px solid transparent',
            backgroundColor: activeLayerId===layer.id ? 'var(--ho-accent-bg)' : 'transparent'
          }}>
            <Button variant="icon" style={{fontSize:'7px',color:layer.visible?'var(--ho-text-secondary)':'var(--ho-text-tertiary)'}} onClick={(e)=>{e.stopPropagation();toggleVisible(layer.id)}}><Icon name={layer.visible ? "eye" : "eye-off"} size={10} /></Button>
            <Button variant="icon" style={{fontSize:'7px',color:layer.locked?'var(--ho-accent)':'var(--ho-text-tertiary)'}} onClick={(e)=>{e.stopPropagation();toggleLock(layer.id)}}><Icon name={layer.locked ? "lock" : "unlock"} size={10} /></Button>
            <div style={{width:'28px',height:'16px',backgroundColor:layer.color,borderRadius:'3px',flexShrink:0}} />
            <span style={{fontSize:'10px',color:'var(--ho-text-secondary)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{layer.name}</span>
            <span style={{fontSize:'8px',color:'var(--ho-text-tertiary)',width:'22px',textAlign:'right'}}>{layer.opacity}%</span>
          </div>
        ))}
      </div>
      <div style={{padding:'8px',borderTop:'1px solid var(--ho-border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px'}}>
          <span style={{fontSize:'9px',color:'var(--ho-text-tertiary)',width:'44px'}}>不透明度</span>
          <input type="range" min={0} max={100} value={layerOpacity} onChange={e=>setLayerOpacity(Number(e.target.value))} style={{flex:1,height:'3px',accentColor:'var(--ho-accent)'}} />
          <span style={{fontSize:'8px',fontFamily:'var(--ho-font-family-mono)',color:'var(--ho-accent)',width:'20px',textAlign:'right'}}>{layerOpacity}</span>
        </div>
        <Button variant="icon" style={{fontSize:'8px',width:'100%',height:'20px',justifyContent:'flex-start'}}>M 蒙版</Button>
      </div>
    </>
  )
}
