import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'
import { useDITStore, type DITFile } from '../stores/ditStore'

export interface ImportResult {
  name: string
  path: string
  size: number
  hash: string
  ditFile: DITFile
}

interface UseDITImportOptions {
  projectRoot?: string
  hashAlgorithm?: string
}

interface ConfirmState {
  show: boolean
  files: { name: string; path: string; size: number }[]
  destDir: string
  onConfirm: () => Promise<void>
  importing: boolean
  progress: number
  result: ImportResult[]
  error: string | null
}

export function useDITImport(options?: UseDITImportOptions) {
  const { addProjectFile, setProjectRoot, currentProjectRoot } = useDITStore()
  const [confirm, setConfirm] = useState<ConfirmState>({
    show: false, files: [], destDir: '', onConfirm: async () => {},
    importing: false, progress: 0, result: [], error: null
  })

  const closeDialog = () => setConfirm(prev => ({ ...prev, show: false, result: [], error: null }))

  const importMedia = async (): Promise<ImportResult[]> => {
    const api = (window as any).electronAPI
    if (!api) return []

    // Step 1: Open file dialog
    const filePaths = await api.dialog.openFile({
      title: '导入媒体文件',
      filters: [
        { name: '媒体文件', extensions: ['mp4','mov','avi','mkv','mxf','r3d','mts','m2ts','mpg','mpeg','ts','webm','wav','mp3','aac','flac','m4a','ogg','opus','wma','jpg','jpeg','png','tif','tiff','bmp','raw','cr2','nef','arw','dng','gif','webp','srt','ass','lrt','cube','3dl','csp','zip','7z'] },
        { name: '视频文件', extensions: ['mp4','mov','avi','mkv','mxf','r3d','webm'] },
        { name: '音频文件', extensions: ['wav','mp3','aac','flac','m4a','wma'] },
        { name: '图片文件', extensions: ['jpg','jpeg','png','tif','tiff','bmp','raw','dng'] },
        { name: 'LUT 文件', extensions: ['cube','3dl','csp'] },
        { name: '所有文件', extensions: ['*'] }
      ],
      properties: ['openFile', 'multiSelections']
    })
    if (!filePaths || filePaths.length === 0) return []

    // Step 2: Determine destination
    const projectRoot = options?.projectRoot || currentProjectRoot
    if (!projectRoot) {
      const dir = await api.dialog.openDirectory({ title: '选择项目目录(文件将被拷贝至此目录)' })
      if (!dir) return []
      setProjectRoot(dir)
    }

    const destDir = projectRoot || currentProjectRoot

    // Step 3: Show confirmation dialog
    const fileInfos = filePaths.map((p: string) => ({
      name: p.split(/[/\\]/).pop() || 'unknown',
      path: p,
      size: 0
    }))

    return new Promise<ImportResult[]>((resolve) => {
      setConfirm({
        show: true,
        files: fileInfos,
        destDir,
        importing: false,
        progress: 0,
        result: [],
        error: null,
        onConfirm: async () => {
          setConfirm(prev => ({ ...prev, importing: true, progress: 0, error: null }))

          const imported: ImportResult[] = []
          const hashAlgo = options?.hashAlgorithm || 'sha256'
          let completed = 0

          for (const fileInfo of fileInfos) {
            try {
              // Compute source hash
              const hashResult = await api.dit.computeHash(fileInfo.path, hashAlgo)
              if (!hashResult.success) throw new Error(`Hash failed: ${hashResult.error}`)

              // Copy to project directory
              const destPath = `${destDir}/${fileInfo.name}`
              const copyResult = await api.dit.copyFile(fileInfo.path, destPath, hashAlgo)
              if (!copyResult.success) throw new Error(`Copy failed: ${copyResult.error}`)

              const verified = hashResult.hash === copyResult.destHash
              if (!verified) throw new Error('Hash mismatch after copy!')

              // Register in DIT store
              const ditFile: DITFile = {
                id: `pf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                name: fileInfo.name,
                relativePath: fileInfo.name,
                absolutePath: destPath,
                size: fileInfo.size || 0,
                type: detectTypeForDIT(fileInfo.name),
                hash: hashResult.hash || '',
                hashAlgorithm: hashAlgo as any,
                status: 'available',
                modifiedAt: Date.now(),
                projectId: 'current',
                linkedClips: []
              }
              addProjectFile(ditFile)

              imported.push({
                name: fileInfo.name,
                path: destPath,
                size: fileInfo.size || 0,
                hash: hashResult.hash || '',
                ditFile
              })

              completed++
              setConfirm(prev => ({ ...prev, progress: Math.round((completed / fileInfos.length) * 100) }))
            } catch (err: any) {
              setConfirm(prev => ({ ...prev, error: `导入 ${fileInfo.name} 失败: ${err.message}` }))
            }
          }

          setConfirm(prev => ({ ...prev, importing: false }))
          resolve(imported)
        }
      })
    })
  }

  const ImportDialog = confirm.show ? (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <Panel style={{ maxWidth: 480, width: '100%', padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--ho-font-family-title)', fontSize: 16, color: 'var(--ho-text-primary)', marginBottom: 12, fontWeight: 600 }}>导入媒体文件</h3>

        {confirm.result.length > 0 ? (
          <>
            <div style={{ fontSize: 12, color: 'var(--ho-text-primary)', marginBottom: 8 }}>导入完成: {confirm.result.length} 个文件</div>
            {confirm.result.map(r => (
              <div key={r.path} style={{ fontSize: 10, color: 'var(--ho-text-secondary)', padding: '2px 0' }}>{r.name} ✓</div>
            ))}
            <Button variant="primary" style={{ width: '100%', marginTop: 12 }} onClick={closeDialog}>完成</Button>
          </>
        ) : confirm.importing ? (
          <>
            <div style={{ fontSize: 12, color: 'var(--ho-text-secondary)', marginBottom: 8 }}>正在拷贝文件至项目目录...</div>
            <div style={{ height: 6, backgroundColor: 'var(--ho-bg-tertiary)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ width: `${confirm.progress}%`, height: '100%', backgroundColor: 'var(--ho-accent)', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--ho-text-tertiary)', textAlign: 'center' }}>{confirm.progress}%</div>
            {confirm.error && <div style={{ fontSize: 10, color: 'var(--ho-peak)', marginTop: 8 }}>{confirm.error}</div>}
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--ho-text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
              即将拷贝 <strong>{confirm.files.length}</strong> 个文件至项目目录:
              <div style={{ fontSize: 10, color: 'var(--ho-accent)', fontFamily: 'monospace', marginTop: 4, padding: 6, backgroundColor: 'var(--ho-bg-tertiary)', borderRadius: 4 }}>{confirm.destDir}</div>
            </div>
            {confirm.files.length <= 5 ? (
              confirm.files.map(f => (
                <div key={f.path} style={{ fontSize: 10, color: 'var(--ho-text-tertiary)', padding: '2px 0' }}>{f.name}</div>
              ))
            ) : (
              <>
                {confirm.files.slice(0, 5).map(f => (
                  <div key={f.path} style={{ fontSize: 10, color: 'var(--ho-text-tertiary)', padding: '2px 0' }}>{f.name}</div>
                ))}
                <div style={{ fontSize: 10, color: 'var(--ho-text-tertiary)', padding: '2px 0' }}>...及其他 {confirm.files.length - 5} 个文件</div>
              </>
            )}
            <div style={{ fontSize: 12, color: 'var(--ho-text-primary)', marginTop: 12, fontWeight: 500 }}>即将拷贝至项目目录，是否继续？</div>
            <div style={{ fontSize: 10, color: 'var(--ho-text-tertiary)', marginTop: 4 }}>复制后将自动验证文件完整性 (SHA-256)</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <Button variant="default" onClick={closeDialog}>取消</Button>
              <Button variant="primary" onClick={confirm.onConfirm}>继续导入</Button>
            </div>
          </>
        )}
      </Panel>
    </div>
  ) : null

  return { importMedia, ImportDialog }
}

function detectTypeForDIT(name: string): 'video' | 'audio' | 'image' | 'lut' | 'other' {
  const ext = name.toLowerCase().substring(name.lastIndexOf('.'))
  if (['.mp4','.mov','.avi','.mxf','.r3d','.mts','.m2ts','.mpg','.mpeg','.mkv','.webm','.ts'].includes(ext)) return 'video'
  if (['.wav','.mp3','.aac','.flac','.m4a','.ogg','.opus','.wma'].includes(ext)) return 'audio'
  if (['.jpg','.jpeg','.png','.tif','.tiff','.bmp','.raw','.cr2','.nef','.arw','.dng','.gif','.webp'].includes(ext)) return 'image'
  if (['.cube','.3dl','.csp','.spi1d','.spi3d'].includes(ext)) return 'lut'
  return 'other'
}
