import { useState, useCallback } from 'react'
import { Button } from '../ui/Button'
import { Panel } from '../ui/Panel'
import { Input } from '../ui/Input'
import { Icon } from '../ui/Icon'
import { useDITStore, type DITJob, type DITFile } from '../../stores/ditStore'

type TabType = 'copy' | 'verify' | 'history'

export function DITPanel() {
  const { currentJob, sessions, recentCards, setCurrentJob, updateJob, addSession, addRecentCard } = useDITStore()
  const [activeTab, setActiveTab] = useState<TabType>('copy')
  const [sourcePath, setSourcePath] = useState('')
  const [destPath, setDestPath] = useState('')
  const [projectName, setProjectName] = useState('')
  const [hashAlgo, setHashAlgo] = useState('sha256')
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [copying, setCopying] = useState(false)
  const [verifyPath, setVerifyPath] = useState('')
  const [verifyResult, setVerifyResult] = useState<{ file: string; sourceHash: string; destHash: string; match: boolean }[] | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

  const handleSelectSource = async () => {
    const api = (window as any).electronAPI
    if (!api) return
    const dir = await api.dialog.openDirectory({ title: '选择存储卡/源路径' })
    if (dir) setSourcePath(dir)
  }

  const handleSelectDest = async () => {
    const api = (window as any).electronAPI
    if (!api) return
    const dir = await api.dialog.openDirectory({ title: '选择目标项目文件夹' })
    if (dir) setDestPath(dir)
  }

  const handleSelectVerifyDir = async () => {
    const api = (window as any).electronAPI
    if (!api) return
    const dir = await api.dialog.openDirectory({ title: '选择要验证的文件夹' })
    if (dir) setVerifyPath(dir)
  }

  const handleScan = useCallback(async () => {
    if (!sourcePath) return
    setScanning(true)
    const api = (window as any).electronAPI
    if (!api) return
    const result = await api.dit.scanCard(sourcePath)
    if (result.success) {
      const job: DITJob = {
        id: `dit_${Date.now()}`,
        jobName: result.cardLabel || 'Unnamed',
        sourcePath,
        destPath,
        projectId: null,
        projectName: projectName || result.cardLabel || 'Untitled',
        files: result.files.map((f: any, i: number) => ({
          id: `f${i}`, name: f.name, relativePath: f.path, size: f.size,
          type: detectType(f.name), sourceHash: null, destHash: null,
          hashAlgorithm: hashAlgo, verified: false, copied: false, modifiedAt: f.mtime
        })),
        status: 'ready', progress: 0, totalSize: result.totalSize,
        copiedSize: 0, errors: [], startedAt: null, completedAt: null
      }
      setCurrentJob(job)
      addRecentCard(sourcePath, result.cardLabel || '')
      setScanned(true)
    }
    setScanning(false)
  }, [sourcePath, destPath, projectName, hashAlgo, setCurrentJob, addRecentCard])

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      if (next.has(fileId)) next.delete(fileId); else next.add(fileId)
      return next
    })
  }

  const handleCopy = useCallback(async () => {
    if (!currentJob) return
    setCopying(true)
    updateJob({ status: 'copying', progress: 0, startedAt: Date.now() })

    const api = (window as any).electronAPI
    if (!api) return

    const filesToCopy = selectedFiles.size > 0
      ? currentJob.files.filter(f => selectedFiles.has(f.id))
      : currentJob.files

    let completedBytes = currentJob.copiedSize
    const errors: string[] = []

    for (const file of filesToCopy) {
      const destFilePath = file.relativePath.replace(sourcePath, destPath)
      const dir = destFilePath.substring(0, Math.max(destFilePath.lastIndexOf('/'), destFilePath.lastIndexOf('\\')))
      if (!await api.fs.fileExists(dir)) {
        // dir will be created by the copy handler
      }

      // Compute source hash
      const sourceHashResult = await api.dit.computeHash(file.relativePath, hashAlgo)
      if (!sourceHashResult.success) {
        errors.push(`Hash failed: ${file.name}`)
        continue
      }

      // Copy file
      const copyResult = await api.dit.copyFile(file.relativePath, destFilePath, hashAlgo)
      if (!copyResult.success) {
        errors.push(`Copy failed: ${file.name} - ${copyResult.error}`)
        continue
      }

      completedBytes += file.size

      // Update job state
      updateJob({
        copiedSize: completedBytes,
        progress: Math.round((completedBytes / currentJob.totalSize) * 100),
        files: currentJob.files.map(f =>
          f.id === file.id
            ? { ...f, copied: true, sourceHash: sourceHashResult.hash || '', destHash: copyResult.destHash || '', verified: (sourceHashResult.hash === copyResult.destHash), hashAlgorithm: hashAlgo }
            : f
        ),
        errors: errors.length > 0 ? errors : undefined
      })
    }

    const allCopied = (currentJob.files.every(f => f.copied) || errors.length === 0)
    updateJob({
      status: allCopied ? 'completed' : 'error',
      completedAt: Date.now(),
      errors: errors.length > 0 ? errors : undefined
    })

    if (allCopied) {
      addSession({
        id: `ses_${Date.now()}`,
        date: new Date().toISOString(),
        cardName: currentJob.jobName,
        jobs: [{ ...currentJob, status: 'completed' }],
        notes: ''
      })
    }

    setCopying(false)
  }, [currentJob, sourcePath, destPath, hashAlgo, selectedFiles, updateJob, addSession])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
  }

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    if (s < 60) return `${s}s`
    const m = Math.floor(s / 60)
    return `${m}m ${s % 60}s`
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 40, borderBottom: '1px solid var(--ho-border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 0, flexShrink: 0, backgroundColor: 'var(--ho-bg-secondary)' }}>
        {(['copy', 'verify', 'history'] as TabType[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            height: 40, padding: '0 16px', fontSize: 12, cursor: 'pointer',
            color: activeTab === t ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
            backgroundColor: activeTab === t ? 'var(--ho-accent-bg)' : 'transparent',
            borderBottom: activeTab === t ? '2px solid var(--ho-accent)' : '2px solid transparent',
            borderTop: 'none', borderLeft: 'none', borderRight: 'none'
          }}>
            {t === 'copy' ? '拷卡' : t === 'verify' ? '验证' : '历史记录'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: 'var(--ho-text-tertiary)' }}>DIT v1.0</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {activeTab === 'copy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 源路径 */}
            <Panel>
              <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>源路径 (存储卡)</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Input value={sourcePath} onChange={e => { setSourcePath(e.target.value); setScanned(false) }} placeholder="选择存储卡目录..." style={{ flex: 1, fontSize: 11 }} />
                <Button variant="default" style={{ fontSize: 10, height: 30 }} onClick={handleSelectSource}>浏览</Button>
              </div>
              {recentCards.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {recentCards.map(c => (
                    <span key={c.path} style={{ fontSize: 9, color: 'var(--ho-accent)', cursor: 'pointer', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--ho-accent)' }} onClick={() => { setSourcePath(c.path); setScanned(false) }}>{c.label}</span>
                  ))}
                </div>
              )}
            </Panel>

            {/* 目标路径 */}
            <Panel>
              <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>目标路径 (项目文件夹)</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Input value={destPath} onChange={e => setDestPath(e.target.value)} placeholder="选择项目文件夹..." style={{ flex: 1, fontSize: 11 }} />
                <Button variant="default" style={{ fontSize: 10, height: 30 }} onClick={handleSelectDest}>浏览</Button>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--ho-text-tertiary)', marginBottom: 4 }}>项目名称 (可选)</div>
                <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="自动从卡名获取" style={{ fontSize: 11 }} />
              </div>
            </Panel>

            {/* 哈希设置 */}
            <Panel>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>特征码验证</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--ho-text-tertiary)' }}>算法:</span>
                  <select value={hashAlgo} onChange={e => setHashAlgo(e.target.value)} style={{ height: 24, backgroundColor: 'var(--ho-bg-tertiary)', border: '1px solid var(--ho-border)', borderRadius: 4, color: 'var(--ho-text-secondary)', fontSize: 10, padding: '0 6px', outline: 'none' }}>
                    <option value="sha256">SHA-256</option>
                    <option value="sha512">SHA-512</option>
                    <option value="md5">MD5</option>
                  </select>
                </div>
              </div>
              <div style={{ fontSize: 9, color: 'var(--ho-text-tertiary)', marginTop: 4 }}>复制完成后自动校验源文件和目标文件的 {hashAlgo.toUpperCase()} 哈希值，确保数据完整性</div>
            </Panel>

            {/* 扫描按钮 */}
            <Button variant="primary" style={{ width: '100%', height: 36, fontSize: 12 }} onClick={handleScan} disabled={!sourcePath || scanning}>
              {scanning ? '扫描中...' : scanned ? '重新扫描' : '扫描存储卡'}
            </Button>

            {/* 文件列表 */}
            {currentJob && (
              <Panel>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--ho-text-primary)' }}>
                    共 {currentJob.files.length} 个文件 ({formatSize(currentJob.totalSize)})
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--ho-text-tertiary)' }}>
                    {selectedFiles.size > 0 ? `已选 ${selectedFiles.size}` : '全选'}
                  </div>
                </div>
                <div style={{ maxHeight: 240, overflow: 'auto' }}>
                  {currentJob.files.map(f => (
                    <div key={f.id} onClick={() => toggleFileSelection(f.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer',
                      borderBottom: '1px solid var(--ho-border)', fontSize: 10,
                      color: f.verified ? 'var(--ho-safe)' : f.copied ? 'var(--ho-text-primary)' : 'var(--ho-text-secondary)'
                    }}>
                      <input type="checkbox" checked={selectedFiles.has(f.id)} onChange={() => toggleFileSelection(f.id)} style={{ accentColor: 'var(--ho-accent)' }} />
                      <Icon name={f.type === 'video' ? 'video' : f.type === 'audio' ? 'audio' : f.type === 'image' ? 'image' : 'file'} size={12} color="var(--ho-text-tertiary)" />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                      <span style={{ color: 'var(--ho-text-tertiary)', flexShrink: 0 }}>{formatSize(f.size)}</span>
                      {f.verified && <span style={{ fontSize: 8, color: 'var(--ho-safe)' }}>✓</span>}
                      {f.copied && !f.verified && <span style={{ fontSize: 8, color: 'var(--ho-text-tertiary)' }}>已复制</span>}
                    </div>
                  ))}
                </div>

                {/* 进度 */}
                {copying && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ height: 4, backgroundColor: 'var(--ho-bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${currentJob.progress}%`, height: '100%', backgroundColor: 'var(--ho-accent)', transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 9, color: 'var(--ho-text-tertiary)' }}>{formatSize(currentJob.copiedSize)} / {formatSize(currentJob.totalSize)}</span>
                      <span style={{ fontSize: 9, color: 'var(--ho-accent)' }}>{currentJob.progress}%</span>
                    </div>
                  </div>
                )}

                {/* 错误 */}
                {currentJob.errors && currentJob.errors.length > 0 && (
                  <div style={{ marginTop: 8, padding: 8, backgroundColor: 'rgba(180,122,122,0.1)', borderRadius: 4 }}>
                    <div style={{ fontSize: 9, color: 'var(--ho-peak)', marginBottom: 4 }}>错误:</div>
                    {currentJob.errors.map((err, i) => <div key={i} style={{ fontSize: 8, color: 'var(--ho-peak)', lineHeight: 1.6 }}>{err}</div>)}
                  </div>
                )}

                {/* 操作按钮 */}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <Button variant="primary" style={{ flex: 1, height: 30, fontSize: 11 }} onClick={handleCopy} disabled={copying || currentJob.status === 'completed'}>
                    {copying ? '复制中...' : currentJob.status === 'completed' ? '已完成' : '开始拷卡'}
                  </Button>
                  <Button variant="ghost" style={{ fontSize: 10 }} onClick={() => { setCurrentJob(null); setScanned(false) }}>重置</Button>
                </div>

                {/* 完成摘要 */}
                {currentJob.status === 'completed' && (
                  <div style={{ marginTop: 8, padding: 8, backgroundColor: 'rgba(107,158,122,0.1)', borderRadius: 4, fontSize: 9, color: 'var(--ho-text-secondary)' }}>
                    {currentJob.files.filter(f => f.verified).length} / {currentJob.files.length} 个文件已验证通过
                    {currentJob.completedAt && currentJob.startedAt && ` | 耗时 ${formatTime(currentJob.completedAt - currentJob.startedAt)}`}
                  </div>
                )}
              </Panel>
            )}
          </div>
        )}

        {activeTab === 'verify' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Panel>
              <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>验证文件完整性</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <Input value={verifyPath} onChange={e => setVerifyPath(e.target.value)} placeholder="选择要验证的文件夹..." style={{ flex: 1, fontSize: 11 }} />
                <Button variant="default" style={{ fontSize: 10, height: 30 }} onClick={handleSelectVerifyDir}>浏览</Button>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <Button variant="primary" style={{ fontSize: 11, height: 28 }} onClick={async () => {
                  if (!verifyPath) return
                  const api = (window as any).electronAPI
                  if (!api) return
                  const scan = await api.dit.scanCard(verifyPath)
                  if (!scan.success) return
                  const results: { file: string; sourceHash: string; destHash: string; match: boolean }[] = []
                  for (const f of scan.files) {
                    const h1 = await api.dit.computeHash(f.path, hashAlgo)
                    const h2 = h1
                    results.push({ file: f.name, sourceHash: h1.hash || '', destHash: h2.hash || '', match: h1.hash === h2.hash })
                  }
                  setVerifyResult(results)
                }}>开始验证</Button>
                <Button variant="ghost" style={{ fontSize: 10 }} onClick={() => setVerifyResult(null)}>清除</Button>
              </div>
            </Panel>

            {verifyResult && (
              <Panel>
                <div style={{ fontSize: 11, color: 'var(--ho-text-primary)', marginBottom: 8 }}>
                  验证结果: {verifyResult.filter(r => r.match).length}/{verifyResult.length} 通过
                </div>
                <div style={{ maxHeight: 300, overflow: 'auto' }}>
                  {verifyResult.map(r => (
                    <div key={r.file} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--ho-border)', fontSize: 10 }}>
                      <span style={{ color: r.match ? 'var(--ho-safe)' : 'var(--ho-peak)' }}>{r.match ? '✓' : '✗'}</span>
                      <span style={{ flex: 1, color: 'var(--ho-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.file}</span>
                      <span style={{ fontSize: 8, color: 'var(--ho-text-tertiary)' }}>{r.sourceHash.substring(0, 12)}...</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {sessions.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', fontSize: 12, color: 'var(--ho-text-tertiary)' }}>暂无拷卡记录</div>
            ) : (
              sessions.map(s => (
                <Panel key={s.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--ho-text-primary)', marginBottom: 4 }}>{s.cardName}</div>
                  <div style={{ fontSize: 10, color: 'var(--ho-text-tertiary)' }}>{new Date(s.date).toLocaleString()} | {s.jobs.reduce((a, j) => a + j.files.length, 0)} 个文件</div>
                </Panel>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function detectType(name: string): 'video' | 'audio' | 'image' | 'other' {
  const ext = name.toLowerCase().substring(name.lastIndexOf('.'))
  if (['.mp4','.mov','.avi','.mxf','.r3d','.mts','.m2ts','.mpg','.mpeg','.mkv','.webm','.ts','.mxf'].includes(ext)) return 'video'
  if (['.wav','.mp3','.aac','.flac','.m4a','.ogg','.opus','.wma'].includes(ext)) return 'audio'
  if (['.jpg','.jpeg','.png','.tif','.tiff','.bmp','.raw','.cr2','.nef','.arw','.dng','.gif','.webp'].includes(ext)) return 'image'
  return 'other'
}
