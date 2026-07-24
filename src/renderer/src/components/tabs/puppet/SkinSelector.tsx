interface SkinSelectorProps {
  skins: string[]
  currentSkin: string
  onSkinChange: (skin: string) => void
}

export function SkinSelector({ skins, currentSkin, onSkinChange }: SkinSelectorProps) {
  if (skins.length === 0) {
    return <div style={{ fontSize:'9px',color:'var(--ho-text-tertiary)',padding:'12px' }}>暂无皮肤数据</div>
  }

  return (
    <div style={{ padding:'8px' }}>
      {skins.map(skin => (
        <div
          key={skin}
          onClick={() => onSkinChange(skin)}
          style={{
            padding:'6px 8px', cursor:'pointer', borderRadius:'4px', marginBottom:'2px',
            backgroundColor: currentSkin===skin ? 'var(--ho-accent-bg)' : 'transparent',
            color: currentSkin===skin ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
            fontSize:'10px'
          }}
        >{skin}</div>
      ))}
    </div>
  )
}
