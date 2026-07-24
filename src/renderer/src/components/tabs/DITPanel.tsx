import { useState, useCallback, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Panel } from '../ui/Panel'
import { Input } from '../ui/Input'
import { Icon } from '../ui/Icon'
import { useDITStore, type DITFile, type DITCardJob } from '../../stores/ditStore'

type TabType = 'files' | 'copy' | 'history'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function detectType(name: string): 'video' | 'audio' | 'image' | 'lut' | 'other' {
  const ext = name.toLowerCase().substring(name.lastIndexOf('.'))
  if (['.mp4','.mov','.avi','.mxf','.r3d','.mts','.m2ts','.mpg','.mpeg','.mkv','.webm','.ts'].includes(ext)) return 'video'
  if (['.wav','.mp3','.aac','.flac','.m4a','.ogg','.opus','.wma'].includes(ext)) return 'audio'
  if (['.jpg','.jpeg','.png','.tif','.tiff','.bmp','.raw','.cr2','.nef','.arw','.dng','.gif','.webp'].includes(ext)) return 'image'
  if (['.cube','.3dl','.csp','.spi1d','.spi3d'].includes(ext)) return 'lut'
  return 'other'
}

export function DITPanel() {
  const {
    projectFiles, currentProjectId, currentProjectRoot, sessions, recentCards,
    currentJob, setProjectRoot, setProjectFiles, addProjectFile, removeProjectFile,
    updateFileStatus, updateFileHash, linkClipToFile, unlinkClipFromFile,
    setCurrentJob, updateJob, addSession, addRecentCard, reset,
    generateConfig, loadFromConfig
  } = useDITStore()

  const [activeTab, setActiveTab] = useState<TabType>('files')

  // === Card Copy State ===
  const [sourcePath, setSourcePath] = useState('')
  const [destPath, setDestPath] = useState('')
  const [projectName, setProjectName] = useState('')
  const [hashAlgo, setHashAlgo] = useState<string>('sha256')
  const [scanning, setScanning] = useState(false)
  const [copying, setCopying] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

  // === File Manager State ===
  const [configPath, setConfigPath] = useState('')
  const [fileSearch, setFileSearch] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState('全部')
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [relinkPath, setRelinkPath] = useState('')

  // Persist config when project files change
  useEffect(() => {
    if (!configPath || projectFiles.length === 0) return
    const timeout = setTimeout(async () => {
      const api = (window as any).electronAPI
      if (!api) return
      await api.dit.projectSaveConfig(configPath, generateConfig())
    }, 2000)
    return () => clearTimeout(timeout)
  }, [projectFiles, configPath])

  const handleLoadConfig = async () => {
    const api = (window as any).electronAPI
    if (!api) return
    const dir = await api.dialog.openDirectory({ title: '选择项目根目录' })
    if (!dir) return
    setConfigPath(dir)
    setProjectRoot(dir)
    const result = await api.dit.projectLoadConfig(dir)
    if (result.success && result.config) {
      loadFromConfig(result.config as any)
    } else {
      // New project: scan directory for media files
      const scan = await api.dit.scanProject(dir)
      if (scan.success && scan.files) {
        const files: DITFile[] = scan.files.map((f: any, i: number) => ({
          id: `pf_${i}_${Date.now()}`,
          name: f.name,
          relativePath: f.path.replace(dir, '').replace(/^[/\\]/, ''),
          absolutePath: f.path,
          size: f.size,
          type: detectType(f.name),
          hash: '',
          hashAlgorithm: 'sha256' as any,
          status: 'available' as any,
          modifiedAt: f.mtime,
          projectId: currentProjectId || 'unknown',
          linkedClips: []
        }))
        setProjectFiles(files)
      }
    }
  }

  const handleRescanFiles = async () => {
    if (!configPath) return
    const api = (window as any).electronAPI
    if (!api) return
    const scan = await api.dit.scanProject(configPath)
    if (scan.success && scan.files) {
      // Merge with existing registry
      const existing = new Map(projectFiles.map(f => [f.name, f]))
      for (const f of scan.files) {
        const existingFile = existing.get(f.name)
        if (existingFile) {
          existingFile.status = 'available'
          existingFile.absolutePath = f.path
          existingFile.size = f.size
        } else {
          existing.set(f.name, {
            id: `pf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: f.name,
            relativePath: f.path.replace(configPath, '').replace(/^[/\\]/, ''),
            absolutePath: f.path,
            size: f.size,
            type: detectType(f.name),
            hash: '',
            hashAlgorithm: 'sha256',
            status: 'available',
            modifiedAt: f.mtime,
            projectId: currentProjectId || 'unknown',
            linkedClips: []
          })
        }
      }
      setProjectFiles(Array.from(existing.values()))
    }
  }

  const handleVerifyFile = async (file: DITFile) => {
    const api = (window as any).electronAPI
    if (!api) return
    const result = await api.dit.computeHash(file.absolutePath, file.hashAlgorithm)
    if (result.success && result.hash) {
      if (file.hash && file.hash !== result.hash) {
        updateFileStatus(file.id, 'moved')
      } else {
        updateFileHash(file.id, result.hash, file.hashAlgorithm as any)
        updateFileStatus(file.id, 'available')
      }
    }
  }

  const handleRelinkFile = async (file: DITFile) => {
    if (!relinkPath || !configPath) return
    const api = (window as any).electronAPI
    if (!api) return
    const result = await api.dit.resolveFile(file.absolutePath, configPath, file.hash, file.hashAlgorithm)
    if (result.success && result.resolvedPath) {
      updateFileStatus(file.id, 'available', result.resolvedPath)
    } else {
      updateFileStatus(file.id, 'missing')
    }
  }

  const handleSaveConfig = async () => {
    if (!configPath) return
    const api = (window as any).electronAPI
    if (!api) return
    await api.dit.projectSaveConfig(configPath, generateConfig())
  }

  // === Card Copy ===
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
    if (dir) { setDestPath(dir); setConfigPath(dir); setProjectRoot(dir) }
  }

  const handleScan = useCallback(async () => {
    if (!sourcePath) return
    setScanning(true)
    const api = (window as any).electronAPI
    if (!api) return
    const result = await api.dit.scanCard(sourcePath)
    if (result.success) {
      const job: DITCardJob = {
        id: `dit_${Date.now()}`,
        cardLabel: result.cardLabel || 'Unnamed',
        sourcePath,
        destPath: destPath || '',
        files: result.files.map((f: any) => ({ name: f.name, path: f.path, size: f.size, hash: '', hashAlgorithm: hashAlgo, verified: false })),
        status: 'ready', progress: 0, totalSize: result.totalSize, copiedSize: 0, errors: [], startedAt: null, completedAt: null
      }
      setCurrentJob(job)
      addRecentCard(sourcePath, result.cardLabel || '')
    }
    setScanning(false)
  }, [sourcePath, destPath, hashAlgo, setCurrentJob, addRecentCard])

  const handleCopy = useCallback(async () => {
    if (!currentJob || !configPath) return
    setCopying(true)
    updateJob({ status: 'copying', startedAt: Date.now() })
    const api = (window as any).electronAPI
    if (!api) return

    let completedBytes = currentJob.copiedSize
    const errors: string[] = []

    for (const file of currentJob.files) {
      const relPath = file.path.replace(sourcePath, '').replace(/^[/\\]/, '')
      const destFilePath = joinPath(configPath, relPath)

      // Compute source hash
      const hashResult = await api.dit.computeHash(file.path, hashAlgo)
      if (!hashResult.success) { errors.push(`Hash failed: ${file.name}`); continue }

      // Copy
      const copyResult = await api.dit.copyFile(file.path, destFilePath, hashAlgo)
      if (!copyResult.success) { errors.push(`Copy failed: ${file.name}`); continue }

      completedBytes += file.size
      const verified = hashResult.hash === copyResult.destHash

      updateJob({
        copiedSize: completedBytes,
        progress: Math.round((completedBytes / currentJob.totalSize) * 100),
        files: currentJob.files.map(f =>
          f.path === file.path ? { ...f, hash: hashResult.hash || '', verified } : f
        ),
        errors: errors.length > 0 ? [...(currentJob.errors || []), ...errors] : []
      })

      // Register in project files
      const newFile: DITFile = {
        id: `pf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        relativePath: relPath,
        absolutePath: destFilePath,
        size: file.size,
        type: detectType(file.name),
        hash: hashResult.hash || '',
        hashAlgorithm: hashAlgo as any,
        status: 'available',
        modifiedAt: Date.now(),
        projectId: currentProjectId || 'unknown',
        linkedClips: []
      }
      addProjectFile(newFile)

      if (verified) updateJob({ files: currentJob.files.map(f => f.path === file.path ? { ...f, hash: hashResult.hash || '', verified: true } : f) })
    }

    updateJob({ status: errors.length === 0 ? 'completed' : 'completed', completedAt: Date.now() })

    // Save config
    if (configPath) await api.dit.projectSaveConfig(configPath, generateConfig())

    addSession({
      id: `ses_${Date.now()}`, date: new Date().toISOString(),
      cardName: currentJob.cardLabel, projectId: currentProjectId || '',
      projectName: projectName || currentJob.cardLabel,
      jobs: [{ ...currentJob, status: 'completed' }], notes: ''
    })
    setCopying(false)
  }, [currentJob, sourcePath, configPath, hashAlgo, projectName, currentProjectId, updateJob, addProjectFile, generateConfig, addSession])

  const toggleFileSelection = (id: string) => {
    setSelectedFiles(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  const filteredFiles = projectFiles.filter(f =>
    (fileTypeFilter === '全部' || f.type === fileTypeFilter.toLowerCase()) &&
    f.name.includes(fileSearch)
  )

  const selectedFile = selectedFileId ? projectFiles.find(f => f.id === selectedFileId) : null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 40, borderBottom: '1px solid var(--ho-border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 0, flexShrink: 0, backgroundColor: 'var(--ho-bg-secondary)' }}>
        {(['files', 'copy', 'history'] as TabType[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            height: 40, padding: '0 16px', fontSize: 12, cursor: 'pointer',
            color: activeTab === t ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
            backgroundColor: activeTab === t ? 'var(--ho-accent-bg)' : 'transparent',
            borderBottom: activeTab === t ? '2px solid var(--ho-accent)' : '2px solid transparent',
            borderTop: 'none', borderLeft: 'none', borderRight: 'none'
          }}>
            {t === 'files' ? '文件管理' : t === 'copy' ? '拷卡导入' : '历史记录'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: 'var(--ho-text-tertiary)' }}>DIT v1.0</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {activeTab === 'files' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 项目配置加载 */}
            <Panel>
              <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>项目管理</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Input value={configPath} onChange={e => setConfigPath(e.target.value)} placeholder="项目根目录..." style={{ flex: 1, fontSize: 11 }} />
                <Button variant="default" style={{ fontSize: 10, height: 30 }} onClick={handleLoadConfig}>加载</Button>
                <Button variant="ghost" style={{ fontSize: 10 }} onClick={handleSaveConfig}>保存</Button>
              </div>
              {configPath && (
                <div style={{ fontSize: 9, color: 'var(--ho-accent)', marginTop: 4 }}>
                  已加载 {projectFiles.length} 个文件 | 配置文件: {configPath}/.2dw/project.json
                </div>
              )}
            </Panel>

            {/* 文件注册表 */}
            {configPath && (
              <Panel>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--ho-text-primary)' }}>文件注册表</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button variant="ghost" style={{ fontSize: 9, height: 24 }} onClick={handleRescanFiles}>重新扫描</Button>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['全部', 'video', 'audio', 'image', 'lut'].map(t => (
                        <span key={t} style={{ fontSize: 9, cursor: 'pointer', padding: '0 6px', color: fileTypeFilter === t ? 'var(--ho-accent)' : 'var(--ho-text-tertiary)' }} onClick={() => setFileTypeFilter(t)}>
                          {t === '全部' ? '全部' : t === 'video' ? '视频' : t === 'audio' ? '音频' : t === 'image' ? '图片' : 'LUT'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Input placeholder="搜索文件名..." value={fileSearch} onChange={e => setFileSearch(e.target.value)} style={{ fontSize: 10, height: 26 }} />
                </div>
                <div style={{ maxHeight: 300, overflow: 'auto' }}>
                  {filteredFiles.map(f => (
                    <div key={f.id} onClick={() => setSelectedFileId(f.id === selectedFileId ? null : f.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer',
                      borderBottom: '1px solid var(--ho-border)', fontSize: 10,
                      backgroundColor: selectedFileId === f.id ? 'var(--ho-accent-bg)' : 'transparent'
                    }}>
                      <Icon name={f.type === 'video' ? 'video' : f.type === 'audio' ? 'audio' : f.type === 'image' ? 'image' : 'file'} size={12} color="var(--ho-text-tertiary)" />
                      <span style={{
                        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        color: f.status === 'available' ? 'var(--ho-text-primary)' : f.status === 'missing' ? 'var(--ho-peak)' : 'var(--ho-warning)'
                      }}>{f.name}</span>
                      <span style={{ color: 'var(--ho-text-tertiary)' }}>{formatSize(f.size)}</span>
                      <span style={{
                        fontSize: 8, padding: '1px 6px', borderRadius: 8,
                        backgroundColor: f.status === 'available' ? 'rgba(107,158,122,0.15)' : f.status === 'missing' ? 'rgba(180,122,122,0.15)' : 'rgba(196,168,106,0.15)',
                        color: f.status === 'available' ? 'var(--ho-safe)' : f.status === 'missing' ? 'var(--ho-peak)' : 'var(--ho-warning)'
                      }}>
                        {f.status === 'available' ? '在线' : f.status === 'missing' ? '缺失' : f.status === 'moved' ? '已移动' : '离线'}
                      </span>
                      {f.linkedClips.length > 0 && (
                        <span style={{ fontSize: 8, color: 'var(--ho-accent)' }}>引用 {f.linkedClips.length}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* 选中文件详情 */}
                {selectedFile && (
                  <div style={{ marginTop: 8, padding: 8, border: '1px solid var(--ho-border)', borderRadius: 'var(--ho-radius-sm)' }}>
                    <div style={{ fontSize: 10, color: 'var(--ho-text-primary)', marginBottom: 6 }}>{selectedFile.name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 9, color: 'var(--ho-text-tertiary)' }}>
                      <div>路径: {selectedFile.relativePath}</div>
                      <div>大小: {formatSize(selectedFile.size)}</div>
                      <div>类型: {selectedFile.type}</div>
                      <div>状态: {selectedFile.status}</div>
                      <div style={{ gridColumn: '1 / -1' }}>哈希: {selectedFile.hash ? `${selectedFile.hashAlgorithm.toUpperCase()} ${selectedFile.hash.substring(0, 16)}...` : '未计算'}</div>
                      {selectedFile.linkedClips.length > 0 && (
                        <div style={{ gridColumn: '1 / -1' }}>关联片段: {selectedFile.linkedClips.join(', ')}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <Button variant="default" style={{ fontSize: 9, height: 24 }} onClick={() => handleVerifyFile(selectedFile)}>验证哈希</Button>
                      <Button variant="default" style={{ fontSize: 9, height: 24 }} onClick={async () => {
                        const api = (window as any).electronAPI
                        if (!api) return
                        const dir = await api.dialog.openDirectory({ title: '选择文件新位置' })
                        if (dir) {
                          setRelinkPath(dir)
                          handleRelinkFile(selectedFile)
                        }
                      }}>重新链接</Button>
                      <Button variant="ghost" style={{ fontSize: 9, height: 24, color: 'var(--ho-peak)' }} onClick={async () => {
                        const api = (window as any).electronAPI
                        if (!api) return
                        const dir = await api.dialog.openDirectory({ title: '移动到...' })
                        if (dir) {
                          const newPath = joinPath(dir, selectedFile.name)
                          const result = await api.dit.moveFile(selectedFile.absolutePath, newPath, true)
                          if (result.success) {
                            updateFileStatus(selectedFile.id, 'available', result.newPath)
                          }
                        }
                      }}>移动文件</Button>
                    </div>
                  </div>
                )}
              </Panel>
            )}
          </div>
        )}

        {activeTab === 'copy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Panel>
              <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>源路径 (存储卡)</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Input value={sourcePath} onChange={e => { setSourcePath(e.target.value) }} placeholder="选择存储卡目录..." style={{ flex: 1, fontSize: 11 }} />
                <Button variant="default" style={{ fontSize: 10, height: 30 }} onClick={handleSelectSource}>浏览</Button>
              </div>
              {recentCards.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {recentCards.map(c => (
                    <span key={c.path} style={{ fontSize: 9, color: 'var(--ho-accent)', cursor: 'pointer', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--ho-accent)' }} onClick={() => { setSourcePath(c.path) }}>{c.label}</span>
                  ))}
                </div>
              )}
            </Panel>
            <Panel>
              <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>目标项目</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <Input value={destPath} onChange={e => setDestPath(e.target.value)} placeholder="项目根目录..." style={{ flex: 1, fontSize: 11 }} />
                <Button variant="default" style={{ fontSize: 10, height: 30 }} onClick={handleSelectDest}>浏览</Button>
              </div>
              <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="项目名称 (可选)" style={{ fontSize: 11 }} />
            </Panel>
            <Panel>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>特征码验证</div>
                <select value={hashAlgo} onChange={e => setHashAlgo(e.target.value)} style={{ height: 24, backgroundColor: 'var(--ho-bg-tertiary)', border: '1px solid var(--ho-border)', borderRadius: 4, color: 'var(--ho-text-secondary)', fontSize: 10, padding: '0 6px', outline: 'none' }}>
                  <option value="sha256">SHA-256</option><option value="sha512">SHA-512</option><option value="md5">MD5</option>
                </select>
              </div>
            </Panel>
            <Button variant="primary" style={{ width: '100%', height: 36, fontSize: 12 }} onClick={handleScan} disabled={!sourcePath || scanning}>
              {scanning ? '扫描中...' : currentJob ? '重新扫描' : '扫描存储卡'}
            </Button>
            {currentJob && (
              <Panel>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--ho-text-primary)' }}>{currentJob.files.length} 个文件 ({formatSize(currentJob.totalSize)})</div>
                </div>
                <div style={{ maxHeight: 200, overflow: 'auto' }}>
                  {currentJob.files.map(f => (
                    <div key={f.path} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--ho-border)', fontSize: 10 }}>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: f.verified ? 'var(--ho-safe)' : 'var(--ho-text-secondary)' }}>{f.name}</span>
                      <span style={{ color: 'var(--ho-text-tertiary)' }}>{formatSize(f.size)}</span>
                      {f.verified && <span style={{ fontSize: 8, color: 'var(--ho-safe)' }}>✓</span>}
                    </div>
                  ))}
                </div>
                {copying && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ height: 4, backgroundColor: 'var(--ho-bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${currentJob.progress}%`, height: '100%', backgroundColor: 'var(--ho-accent)', transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--ho-text-tertiary)', marginTop: 4 }}>{formatSize(currentJob.copiedSize)} / {formatSize(currentJob.totalSize)} ({currentJob.progress}%)</div>
                  </div>
                )}
                {currentJob.errors?.length > 0 && (
                  <div style={{ marginTop: 8, padding: 8, backgroundColor: 'rgba(180,122,122,0.1)', borderRadius: 4, fontSize: 8, color: 'var(--ho-peak)' }}>{currentJob.errors.join('\n')}</div>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <Button variant="primary" style={{ flex: 1, height: 30, fontSize: 11 }} onClick={handleCopy} disabled={copying || currentJob.status === 'completed'}>
                    {copying ? '复制中...' : '开始拷卡并注册到项目'}
                  </Button>
                  <Button variant="ghost" style={{ fontSize: 10 }} onClick={() => { setCurrentJob(null) }}>重置</Button>
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
                  <div style={{ fontSize: 10, color: 'var(--ho-text-tertiary)' }}>{new Date(s.date).toLocaleString()} | 项目: {s.projectName} | {s.jobs.reduce((a, j) => a + j.files.length, 0)} 个文件</div>
                </Panel>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function joinPath(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/')
}
