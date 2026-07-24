interface AnimationListProps {
  animations: string[]
  currentAnimation: string
  onAnimationChange: (name: string) => void
}

export function AnimationList({ animations, currentAnimation, onAnimationChange }: AnimationListProps) {
  if (animations.length === 0) {
    return <div style={{ fontSize:'9px',color:'var(--ho-text-tertiary)',padding:'12px' }}>暂无动画数据</div>
  }

  return (
    <div style={{ padding:'8px' }}>
      {animations.map(anim => (
        <div
          key={anim}
          onClick={() => onAnimationChange(anim)}
          style={{
            padding:'6px 8px', cursor:'pointer', borderRadius:'4px', marginBottom:'2px',
            backgroundColor: currentAnimation===anim ? 'var(--ho-accent-bg)' : 'transparent',
            color: currentAnimation===anim ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
            fontSize:'10px'
          }}
        >{anim}</div>
      ))}
    </div>
  )
}
