import { useState, useCallback, useRef } from 'react'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'
import { useDITStore, type DITFile } from '../stores/ditStore'

export interface ImportResult { name: string; path: string; size: number; hash: string; ditFile: DITFile }

interface State {
  show: boolean; files: { name: string; path: string }[]; destDir: string
  importing: boolean; progress: number; label: string
  result: ImportResult[]; error: string | null
}

export function useDITImport(options?: { projectRoot?: string; hashAlgorithm?: string }) {
  const { addProjectFile, currentProjectRoot } = useDITStore()
  const [s, setS] = useState<State>({ show: false, files: [], destDir: '', importing: false, progress: 0, label: '', result: [], error: null })

  const close = () => setS(p => ({ ...p, show: false, result: [], error: null }))

  const runImport = useCallback(async (files: { name: string; path: string }[], destDir: string) => {
    const api = (window as any).electronAPI
    if (!api) return
    const hashAlgo = options?.hashAlgorithm || 'sha256'
    const imported: ImportResult[] = []
    const total = files.length
    let hasErr = false

    for (let i = 0; i < total; i++) {
      const f = files[i]
      try {
        setS(p => ({ ...p, importing: true, progress: Math.round(i / total * 100), label: `${f.name} (${i + 1}/${total})`, error: null }))
        // Wait a tick for React to render
        await new Promise(r => setTimeout(r, 10))
        const hashR = await api.dit.computeHash(f.path, hashAlgo)
        if (!hashR.success) throw new Error(`${f.name}: 哈希失败`)
        const dest = `${destDir}/${f.name}`
        const copyR = await api.dit.copyFile(f.path, dest, hashAlgo)
        if (!copyR.success) throw new Error(`${f.name}: 拷贝失败`)
        if (hashR.hash !== copyR.destHash) throw new Error(`${f.name}: 校验不通过`)
        const df: DITFile = { id: `pf_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, name: f.name, relativePath: f.name, absolutePath: dest, size: copyR.copiedBytes || 0, type: 'video', hash: hashR.hash || '', hashAlgorithm: hashAlgo as any, status: 'available', modifiedAt: Date.now(), projectId: 'current', linkedClips: [] }
        addProjectFile(df)
        imported.push({ name: f.name, path: dest, size: copyR.copiedBytes || 0, hash: hashR.hash || '', ditFile: df })
      } catch (e: any) { hasErr = true; setS(p => ({ ...p, importing: false, error: e.message || '未知错误' })); break }
    }
    if (!hasErr) setS(p => ({ ...p, importing: false, progress: 100, label: '完成' }))
    return imported
  }, [addProjectFile, options])

  const importMedia = useCallback(async () => {
    const api = (window as any).electronAPI
    if (!api) return []
    const paths = await api.dialog.openFile({ title: '选择导入文件', filters: [
      {name:'媒体文件',extensions:['mp4','mov','avi','mkv','mxf','r3d','mts','m2ts','mpg','mpeg','ts','webm','wav','mp3','aac','flac','m4a','ogg','opus','wma','jpg','jpeg','png','tif','tiff','bmp','raw','cr2','nef','arw','dng','gif','webp','srt','ass','lrt','cube','3dl','csp','zip','7z']},
      {name:'所有文件',extensions:['*']}
    ], properties: ['openFile', 'multiSelections'] })
    if (!paths?.length) return []

    const destDir = options?.projectRoot || currentProjectRoot
    if (!destDir) {
      const d = await api.dialog.openDirectory({ title: '选择项目目录' })
      if (!d) return []; (window as any).__ditRoot = d
    }
    const dir = destDir || (window as any).__ditRoot || ''
    if (!dir) return []

    const files = paths.map((p: string) => ({ name: p.split(/[/\\]/).pop() || 'x', path: p }))

    return new Promise<ImportResult[]>(resolve => {
      setS({ show: true, files, destDir: dir, importing: false, progress: 0, label: '', result: [], error: null })
      // Expose resolve + start for the UI
      ;(window as any).__ditResolve = resolve
      ;(window as any).__ditRun = runImport
      ;(window as any).__ditFiles = files
      ;(window as any).__ditDir = dir
    })
  }, [options, currentProjectRoot, runImport])

  const startImport = useCallback(async () => {
    const files = (window as any).__ditFiles || []
    const dir = (window as any).__ditDir || ''
    const res = (window as any).__ditResolve
    const result = await runImport(files, dir)
    res?.(result)
  }, [runImport])

  const ImportDialog = s.show ? (
    <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
      <Panel style={{ maxWidth:480, width:'100%', padding:24 }}>
        <h3 style={{ fontFamily:'var(--ho-font-family-title)', fontSize:16, color:'var(--ho-text-primary)', marginBottom:12, fontWeight:600 }}>
          {s.importing ? '导入中...' : s.result.length > 0 ? '导入完成' : '导入媒体文件'}
        </h3>

        {!s.importing && s.result.length === 0 && !s.error && (
          <>
            <div style={{ fontSize:12, color:'var(--ho-text-secondary)', marginBottom:12 }}>
              {s.files.length} 个文件将被拷贝至:
              <div style={{ fontSize:10, color:'var(--ho-accent)', fontFamily:'monospace', marginTop:4, padding:6, backgroundColor:'var(--ho-bg-tertiary)', borderRadius:4, wordBreak:'break-all' }}>{s.destDir}</div>
            </div>
            <div style={{ maxHeight:120, overflow:'auto', marginBottom:12 }}>
              {s.files.slice(0,10).map(f => <div key={f.path} style={{ fontSize:10, color:'var(--ho-text-tertiary)', padding:'2px 0' }}>{f.name}</div>)}
              {s.files.length > 10 && <div style={{ fontSize:10, color:'var(--ho-text-tertiary)' }}>...其他 {s.files.length - 10} 个</div>}
            </div>
            <div style={{ fontSize:13, color:'var(--ho-text-primary)', marginBottom:4, fontWeight:500 }}>即将拷贝至项目目录，是否继续？</div>
            <div style={{ fontSize:10, color:'var(--ho-text-tertiary)', marginBottom:16 }}>拷贝后自动 SHA-256 校验</div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <Button variant="default" onClick={close}>取消</Button>
              <Button variant="primary" onClick={startImport}>开始导入</Button>
            </div>
          </>
        )}

        {s.importing && (
          <>
            <div style={{ fontSize:11, color:'var(--ho-text-secondary)', marginBottom:8 }}>{s.label}</div>
            <div style={{ height:8, backgroundColor:'var(--ho-bg-tertiary)', borderRadius:4, overflow:'hidden', marginBottom:8 }}>
              <div style={{ width:`${Math.max(1,s.progress)}%`, height:'100%', backgroundColor:'var(--ho-accent)', borderRadius:4, transition:'width 0.2s' }} />
            </div>
            <div style={{ fontSize:12, color:'var(--ho-accent)', textAlign:'center', fontFamily:'monospace' }}>{s.progress}%</div>
            {s.error && <div style={{ fontSize:10, color:'var(--ho-peak)', marginTop:8, padding:8, backgroundColor:'rgba(180,122,122,0.1)', borderRadius:4 }}>{s.error}</div>}
          </>
        )}

        {!s.importing && s.result.length > 0 && !s.error && (
          <>
            <div style={{ fontSize:12, color:'var(--ho-safe)', marginBottom:8 }}>成功导入 {s.result.length} 个</div>
            {s.result.map(r => <div key={r.path} style={{ fontSize:10, color:'var(--ho-text-secondary)', padding:'2px 0' }}>{r.name}</div>)}
            <Button variant="primary" style={{ width:'100%', marginTop:12 }} onClick={close}>完成</Button>
          </>
        )}

        {s.error && !s.importing && (
          <>
            <div style={{ fontSize:11, color:'var(--ho-peak)', marginBottom:12 }}>{s.error}</div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <Button variant="default" onClick={close}>关闭</Button>
              <Button variant="primary" onClick={startImport}>重试</Button>
            </div>
          </>
        )}
      </Panel>
    </div>
  ) : null

  return { importMedia, ImportDialog, isImporting: s.importing, importProgress: s.progress, startImport }
}
