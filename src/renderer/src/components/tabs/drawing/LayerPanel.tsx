import { Icon } from '../../ui/Icon'
import { useCreativeStore } from '../../../stores/creativeStore'

interface LayerPanelProps {
  activeLayerId: string | null
  onLayerSelect: (id: string) => void
}

export function LayerPanel({ activeLayerId, onLayerSelect }: LayerPanelProps) {
  const { layers, addLayer, removeLayer, setLayers } = useCreativeStore()

  const toggleVisible = (id: string) => setLayers(layers.map(l => l.id===id ? {...l, visible: !l.visible} : l))
  const toggleLock = (id: string) => setLayers(layers.map(l => l.id===id ? {...l, locked: !l.locked} : l))
  const opacity = layers.find(l => l.id === activeLayerId)?.opacity ?? 100

  return (
    <>
      <div style={{ display:'flex', gap:'4px', padding:'8px', borderBottom:'1px solid var(--ho-border)' }}>
        <Icon name="plus" size={12} color="var(--ho-text-secondary)" onClick={() => addLayer({ id:`layer_${Date.now()}`, name:'新建图层', type:'raster', visible:true, opacity:100, blendMode:'normal', locked:false, thumbnailColor:'#505050' })} />
        <Icon name="close" size={12} color="var(--ho-text-secondary)" onClick={() => activeLayerId && removeLayer(activeLayerId)} />
        <Icon name="fullscreen" size={12} color="var(--ho-text-secondary)" />
        <Icon name="fullscreen" size={12} color="var(--ho-text-secondary)" />
        <select style={{ flex:1, height:22, backgroundColor:'var(--ho-bg-tertiary)', border:'1px solid var(--ho-border)', borderRadius:4, color:'var(--ho-text-secondary)', fontSize:9, padding:'0 4px', outline:'none' }}>
          <option>正常</option><option>正片叠底</option><option>滤色</option>
        </select>
      </div>
      <div style={{ flex:1, overflow:'auto' }}>
        {layers.map(layer => (
          <div key={layer.id} onClick={() => onLayerSelect(layer.id)} style={{
            display:'flex', alignItems:'center', gap:'4px', padding:'5px 8px', cursor:'pointer', height:30,
            borderLeft: activeLayerId===layer.id ? '3px solid var(--ho-accent)' : '3px solid transparent',
            backgroundColor: activeLayerId===layer.id ? 'var(--ho-accent-bg)' : 'transparent'
          }}>
            <Icon name={layer.visible ? 'eye' : 'eye-off'} size={10} color="var(--ho-text-tertiary)" style={{cursor:'pointer'}} onClick={() => toggleVisible(layer.id)} />
            <Icon name={layer.locked ? 'lock' : 'unlock'} size={10} color="var(--ho-text-tertiary)" style={{cursor:'pointer'}} onClick={() => toggleLock(layer.id)} />
            <div style={{ width:28, height:16, backgroundColor:layer.thumbnailColor, borderRadius:3, flexShrink:0 }} />
            <span style={{ fontSize:10, color:'var(--ho-text-secondary)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{layer.name}</span>
            <span style={{ fontSize:8, color:'var(--ho-text-tertiary)', width:22, textAlign:'right' }}>{layer.opacity}%</span>
          </div>
        ))}
      </div>
      <div style={{ padding:'8px', borderTop:'1px solid var(--ho-border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
          <span style={{ fontSize:9, color:'var(--ho-text-tertiary)', width:44 }}>不透明度</span>
          <input type="range" min={0} max={100} value={opacity} style={{ flex:1, height:3, accentColor:'var(--ho-accent)' }} />
          <span style={{ fontSize:8, fontFamily:'var(--ho-font-family-mono)', color:'var(--ho-accent)', width:20, textAlign:'right' }}>{opacity}</span>
        </div>
        <span style={{ fontSize:9, color:'var(--ho-text-tertiary)', display:'flex', alignItems:'center', gap:4, cursor:'pointer' }}>M 蒙版</span>
      </div>
    </>
  )
}
