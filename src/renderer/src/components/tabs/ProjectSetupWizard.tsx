import { useState, useCallback } from 'react'
import { Button } from '../ui/Button'
import { Panel } from '../ui/Panel'
import { Input } from '../ui/Input'
import { Toggle } from '../ui/Toggle'
import { Icon } from '../ui/Icon'
import { useDITImport } from '../../hooks/useDITImport'
import { useDITStore, type DITFile } from '../../stores/ditStore'
import { useProjectStore } from '../../stores/projectStore'

export interface ProjectSetupResult {
  projectPath: string
  projectName: string
  resolution: string
  fps: number
  importedFiles: number
}

interface ProjectSetupWizardProps {
  initialName: string
  initialType: string
  onComplete: (result: ProjectSetupResult) => void
  onCancel: () => void
}

type Step = 'directory' | 'import' | 'settings' | 'complete'

export function ProjectSetupWizard({ initialName, initialType, onComplete, onCancel }: ProjectSetupWizardProps) {
  const [step, setStep] = useState<Step>('directory')
  const [projectPath, setProjectPath] = useState('')
  const [projectName, setProjectName] = useState(initialName)
  const [resolution, setResolution] = useState('1920x1080')
  const [fps, setFps] = useState(30)
  const [importedCount, setImportedCount] = useState(0)
  const [imported, setImported] = useState(false)
  const [creating, setCreating] = useState(false)
  const { importMedia, ImportDialog } = useDITImport()
  const { setProjectRoot } = useDITStore()

  const handleSelectDirectory = async () => {
    const api = (window as any).electronAPI
    if (!api) return
    const dir = await api.dialog.openDirectory({
      title: '选择项目根目录',
      defaultPath: projectPath || '~/Videos/'
    })
    if (dir) {
      const fullPath = dir + '/' + projectName.replace(/[<>:"/\\|?*]/g, '_')
      setProjectPath(fullPath)
    }
  }

  const handleCreateAndNext = async () => {
    if (!projectPath || !projectName.trim()) return
    setCreating(true)
    const api = (window as any).electronAPI
    if (!api) { setCreating(false); return }

    try {
      // Create project directory
      await api.fs.writeTextFile(projectPath + '/.2dw/project.json', JSON.stringify({
        version: '1.0.0',
        projectId: `proj_${Date.now()}`,
        projectName: projectName.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        rootPath: projectPath,
        files: [],
        sessions: [],
        lastOpenPaths: []
      }, null, 2))

      setProjectRoot(projectPath)
      setStep('import')
    } catch (err) {
      console.error('Failed to create project dir:', err)
    }
    setCreating(false)
  }

  const handleImportMedia = async () => {
    const files = await importMedia()
    if (files.length > 0) {
      setImported(true)
      setImportedCount(files.length)
    }
  }

  const handleFinish = () => {
    onComplete({
      projectPath,
      projectName: projectName.trim(),
      resolution,
      fps,
      importedFiles: importedCount
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      {ImportDialog}
      <Panel style={{ maxWidth: 560, width: '100%', padding: 28 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, backgroundColor: 'var(--ho-accent-bg)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={20} color="var(--ho-accent)" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--ho-font-family-title)', fontSize: 18, color: 'var(--ho-text-primary)', margin: 0, fontWeight: 600 }}>新建项目</h2>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              {(['directory', 'import', 'settings', 'complete'] as Step[]).map((s, i) => (
                <div key={s} style={{
                  height: 4, flex: 1, borderRadius: 2,
                  backgroundColor: step === s ? 'var(--ho-accent)' : ['directory','import','settings','complete'].indexOf(step) > i ? 'var(--ho-safe)' : 'var(--ho-bg-tertiary)',
                  transition: 'background-color 300ms'
                }} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: 'var(--ho-text-tertiary)', marginTop: 2 }}>
              {step === 'directory' ? 'Step 1/4 创建目录' : step === 'import' ? 'Step 2/4 导入素材' : step === 'settings' ? 'Step 3/4 项目设置' : 'Step 4/4 完成'}
            </div>
          </div>
        </div>

        {step === 'directory' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--ho-text-secondary)', marginBottom: 16 }}>
              选择项目存储位置并创建项目目录结构。
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 4 }}>项目名称</div>
              <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="输入项目名称" style={{ fontSize: 12 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 4 }}>项目目录</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Input value={projectPath} onChange={e => setProjectPath(e.target.value)} placeholder="选择父目录..." style={{ flex: 1, fontSize: 11 }} />
                <Button variant="default" style={{ fontSize: 10, height: 30 }} onClick={handleSelectDirectory}>浏览</Button>
              </div>
              <div style={{ fontSize: 9, color: 'var(--ho-text-tertiary)', marginTop: 4 }}>
                将创建: {projectPath || '...'}/.2dw/project.json
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <Button variant="default" onClick={onCancel}>取消</Button>
              <Button variant="primary" onClick={handleCreateAndNext} disabled={!projectPath || !projectName.trim() || creating}>
                {creating ? '创建中...' : '创建目录并继续'}
              </Button>
            </div>
          </div>
        )}

        {step === 'import' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--ho-text-secondary)', marginBottom: 16 }}>
              从存储卡或本地目录导入素材文件。文件将被拷贝到项目目录并经过哈希校验。
            </div>
            <div style={{ padding: 20, border: '2px dashed var(--ho-border)', borderRadius: 8, textAlign: 'center', marginBottom: 16 }}>
              <Icon name="plus" size={32} color="var(--ho-text-tertiary)" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 12, color: 'var(--ho-text-primary)', marginBottom: 4 }}>拖拽文件到此处，或点击下方按钮导入</div>
              <div style={{ fontSize: 10, color: 'var(--ho-text-tertiary)' }}>支持视频、音频、图片、LUT 等格式</div>
            </div>
            <Button variant="primary" style={{ width: '100%', height: 36, fontSize: 12 }} onClick={handleImportMedia}>
              {imported ? '继续导入更多素材' : '选择素材文件'}
            </Button>
            {imported && (
              <div style={{ marginTop: 12, padding: 10, backgroundColor: 'rgba(107,158,122,0.1)', borderRadius: 6, fontSize: 11, color: 'var(--ho-safe)' }}>
                已导入 {importedCount} 个文件到项目目录
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <Button variant="default" onClick={() => setStep('settings')}>跳过</Button>
              <Button variant="primary" onClick={() => setStep('settings')}>
                {imported ? '下一步' : '跳过导入'}
              </Button>
            </div>
          </div>
        )}

        {step === 'settings' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--ho-text-secondary)', marginBottom: 16 }}>
              设置项目的初始参数。这些参数可以在项目中随时修改。
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 4 }}>分辨率</div>
                <select value={resolution} onChange={e => setResolution(e.target.value)} style={{ width: '100%', height: 30, backgroundColor: 'var(--ho-bg-tertiary)', border: '1px solid var(--ho-border)', borderRadius: 4, color: 'var(--ho-text-secondary)', fontSize: 12, padding: '0 8px', outline: 'none' }}>
                  <option value="1920x1080">1920×1080 (1080p)</option>
                  <option value="3840x2160">3840×2160 (4K)</option>
                  <option value="1280x720">1280×720 (720p)</option>
                  <option value="2560x1440">2560×1440 (2K)</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 4 }}>帧率</div>
                <select value={fps} onChange={e => setFps(Number(e.target.value))} style={{ width: '100%', height: 30, backgroundColor: 'var(--ho-bg-tertiary)', border: '1px solid var(--ho-border)', borderRadius: 4, color: 'var(--ho-text-secondary)', fontSize: 12, padding: '0 8px', outline: 'none' }}>
                  <option value={24}>24 fps (电影感)</option>
                  <option value={25}>25 fps (PAL)</option>
                  <option value={30}>30 fps (通用)</option>
                  <option value={60}>60 fps (高帧率)</option>
                </select>
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--ho-text-tertiary)' }}>
              更多设置可在项目创建后通过「设置」页面调整。
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <Button variant="default" onClick={() => setStep('import')}>上一步</Button>
              <Button variant="primary" onClick={handleFinish}>完成创建</Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Icon name="check" size={48} color="var(--ho-safe)" style={{ marginBottom: 12 }} />
            <h3 style={{ fontFamily: 'var(--ho-font-family-title)', fontSize: 16, color: 'var(--ho-text-primary)', marginBottom: 8 }}>项目已创建</h3>
            <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', lineHeight: 1.8 }}>
              <div>项目名称: {projectName}</div>
              <div>项目目录: {projectPath}</div>
              <div>导入文件: {importedCount} 个</div>
            </div>
            <Button variant="primary" style={{ marginTop: 20, fontSize: 12 }} onClick={handleFinish}>进入项目</Button>
          </div>
        )}
      </Panel>
    </div>
  )
}
