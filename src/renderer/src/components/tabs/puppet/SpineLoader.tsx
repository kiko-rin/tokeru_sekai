import { useRef } from 'react'
import { Button } from '../../ui/Button'

interface SpineLoaderProps {
  onFilesLoaded: (skel: File, atlas: File) => void
}

export function SpineLoader({ onFilesLoaded }: SpineLoaderProps) {
  const skelRef = useRef<HTMLInputElement>(null)
  const atlasRef = useRef<HTMLInputElement>(null)

  const handleSkel = () => skelRef.current?.click()
  const handleAtlas = () => atlasRef.current?.click()

  return (
    <div style={{ padding:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
      <input ref={skelRef} type="file" accept=".skel,.json" style={{ display:'none' }} onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) console.log('SKEL:', file.name)
      }} />
      <input ref={atlasRef} type="file" accept=".atlas" style={{ display:'none' }} onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) console.log('Atlas:', file.name)
      }} />
      <Button variant="default" onClick={handleSkel} style={{ width:'100%', height:'28px', fontSize:'10px' }}>导入 .skel / .json</Button>
      <Button variant="default" onClick={handleAtlas} style={{ width:'100%', height:'28px', fontSize:'10px' }}>导入 .atlas</Button>
    </div>
  )
}
