import { Button } from '../../ui/Button'

export function SpineSetupGuide() {
  return (
    <div style={{ padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', textAlign:'center' }}>
      <div style={{ width:'60px', height:'60px', backgroundColor:'rgba(255,255,255,0.04)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:'20px', color:'var(--ho-text-tertiary)' }}>?</span>
      </div>
      <div style={{ fontSize:'var(--ho-font-size-md)', color:'var(--ho-text-primary)', fontFamily:'var(--ho-font-family-title)' }}>Spine 运行时未加载</div>
      <div style={{ fontSize:'10px', color:'var(--ho-text-tertiary)', lineHeight:1.8, maxWidth:'280px' }}>
        Spine Runtime 由 Esoteric Software 提供，使用 MIT + 商业双许可协议。
        {'\n'}请自行下载 spine-webgl.js 并放入:
      </div>
      <div style={{ fontSize:'9px', color:'var(--ho-accent)', fontFamily:'var(--ho-font-family-mono)', backgroundColor:'var(--ho-bg-tertiary)', padding:'6px 12px', borderRadius:'6px' }}>
        src/renderer/public/spine/
      </div>
      <div style={{ fontSize:'10px', color:'var(--ho-text-tertiary)' }}>
        下载完成后刷新页面即可使用人偶模式
      </div>
      <Button variant="primary" onClick={() => window.open('https://esotericsoftware.com', '_blank')} style={{ fontSize:'11px' }}>
        访问 Spine 官网
      </Button>
    </div>
  )
}
