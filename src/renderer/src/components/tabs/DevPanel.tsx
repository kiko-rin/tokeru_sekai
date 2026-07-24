import { useState, useRef } from 'react'
import { Button } from '../ui/Button'
import { Panel } from '../ui/Panel'
import { Icon } from '../ui/Icon'

export function DevPanel() {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '[二维工坊 Dev] 开发者模式已启动',
    `[${new Date().toLocaleTimeString()}] 应用版本: 0.1.0-alpha1`,
    `[${new Date().toLocaleTimeString()}] Electron: 31.7.7`,
    `[${new Date().toLocaleTimeString()}] 平台: ${navigator.platform}`,
    `[${new Date().toLocaleTimeString()}] 用户数据: 就绪`,
  ])
  const [ipcLog, setIpcLog] = useState<{ time: string; channel: string; dir: 'send' | 'recv'; ok: boolean }[]>([])
  const [selectedDevTab, setSelectedDevTab] = useState<'terminal' | 'ipc' | 'info'>('terminal')
  const [cmdInput, setCmdInput] = useState('')
  const outputRef = useRef<HTMLDivElement>(null)

  const appendToTerminal = (msg: string) => {
    setTerminalOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
    setTimeout(() => outputRef.current?.scrollTo(0, outputRef.current.scrollHeight), 50)
  }

  const executeCommand = async () => {
    const cmd = cmdInput.trim()
    if (!cmd) return
    setCmdInput('')
    appendToTerminal(`$ ${cmd}`)
    try {
      // For now, just echo the command and some mock responses
      if (cmd === 'help') {
        appendToTerminal('可用命令: help, clear, version, stats, dit:status, electron:info')
      } else if (cmd === 'clear') {
        setTerminalOutput([])
        return
      } else if (cmd === 'version') {
        appendToTerminal('二维工坊 v0.1.0-alpha1')
        appendToTerminal('Electron 31.7.7 / Chromium 126 / Node 20.18')
      } else if (cmd === 'stats') {
        appendToTerminal('渲染进程内存: ' + (process.versions?.node ? '可用' : '不可用'))
        appendToTerminal('GPU: ' + (canvasSupportsWebGL() ? 'WebGL2 可用' : 'WebGL2 不可用'))
      } else {
        appendToTerminal(`命令未识别: ${cmd}`)
        appendToTerminal('输入 help 查看可用命令')
      }
    } catch (err: any) {
      appendToTerminal(`错误: ${err.message}`)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 40, borderBottom: '1px solid var(--ho-border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 0, backgroundColor: 'var(--ho-bg-secondary)', flexShrink: 0 }}>
        {(['terminal', 'ipc', 'info'] as const).map(t => (
          <button key={t} onClick={() => setSelectedDevTab(t)} style={{
            height: 40, padding: '0 16px', fontSize: 12, cursor: 'pointer',
            color: selectedDevTab === t ? 'var(--ho-accent)' : 'var(--ho-text-secondary)',
            backgroundColor: selectedDevTab === t ? 'var(--ho-accent-bg)' : 'transparent',
            borderBottom: selectedDevTab === t ? '2px solid var(--ho-accent)' : '2px solid transparent',
            borderTop: 'none', borderLeft: 'none', borderRight: 'none'
          }}>
            {t === 'terminal' ? '终端' : t === 'ipc' ? 'IPC 日志' : '系统信息'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, color: 'var(--ho-text-tertiary)', backgroundColor: 'rgba(122,158,196,0.15)', padding: '2px 8px', borderRadius: 8 }}>DEV</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {selectedDevTab === 'terminal' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div ref={outputRef} style={{ flex: 1, overflow: 'auto', backgroundColor: '#0d1117', borderRadius: 6, padding: 12, fontFamily: 'monospace', fontSize: 11, lineHeight: 1.7, marginBottom: 8 }}>
              {terminalOutput.map((line, i) => {
                const isCmd = line.includes('$ ')
                const isErr = line.includes('错误') || line.includes('Error')
                const isWarn = line.includes('warn') || line.includes('WARN')
                return (
                  <div key={i} style={{
                    color: isErr ? '#b47a7a' : isCmd ? '#7a9ec4' : isWarn ? '#c4a86a' : 'rgba(255,255,255,0.7)',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-all'
                  }}>{line}</div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ color: 'var(--ho-accent)', fontFamily: 'monospace', fontSize: 11, display: 'flex', alignItems: 'center' }}>$</span>
              <input
                value={cmdInput}
                onChange={e => setCmdInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') executeCommand() }}
                placeholder="输入命令 (help)"
                style={{ flex: 1, height: 28, backgroundColor: '#0d1117', border: '1px solid var(--ho-border)', borderRadius: 4, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: 11, padding: '0 8px', outline: 'none' }}
              />
              <Button variant="ghost" style={{ fontSize: 10, height: 28 }} onClick={executeCommand}>执行</Button>
            </div>
          </div>
        )}

        {selectedDevTab === 'ipc' && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 8 }}>IPC 通信日志 (渲染进程 ↔ 主进程)</div>
            {ipcLog.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: 'var(--ho-text-tertiary)' }}>
                暂无 IPC 记录。执行操作后日志将在此显示。
                <div style={{ marginTop: 8 }}>
                  <Button variant="ghost" style={{ fontSize: 10 }} onClick={() => {
                    setIpcLog([
                      { time: new Date().toLocaleTimeString(), channel: 'dit:compute-hash', dir: 'send', ok: true },
                      { time: new Date().toLocaleTimeString(), channel: 'dit:compute-hash', dir: 'recv', ok: true },
                      { time: new Date().toLocaleTimeString(), channel: 'dit:copy-file', dir: 'send', ok: true },
                      { time: new Date().toLocaleTimeString(), channel: 'dit:copy-file', dir: 'recv', ok: true },
                    ])
                  }}>加载演示数据</Button>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#0d1117', borderRadius: 6, overflow: 'hidden' }}>
                {ipcLog.map((entry, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'monospace', fontSize: 10, color: entry.ok ? 'rgba(255,255,255,0.6)' : '#b47a7a' }}>
                    <span style={{ width: 60, flexShrink: 0, color: 'var(--ho-text-tertiary)' }}>{entry.time}</span>
                    <span style={{ width: 30, flexShrink: 0, color: entry.dir === 'send' ? '#7a9ec4' : '#6b9e7a' }}>{entry.dir === 'send' ? '→' : '←'}</span>
                    <span style={{ flex: 1 }}>{entry.channel}</span>
                    <span style={{ color: entry.ok ? 'var(--ho-safe)' : 'var(--ho-peak)' }}>{entry.ok ? 'OK' : 'FAIL'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedDevTab === 'info' && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--ho-text-tertiary)', marginBottom: 12 }}>系统信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }}>
              {[
                ['应用版本', '0.1.0-alpha1'],
                ['Electron', process.versions?.electron || 'N/A'],
                ['Chromium', process.versions?.chrome || 'N/A'],
                ['Node.js', process.versions?.node || 'N/A'],
                ['V8', process.versions?.v8 || 'N/A'],
                ['平台', navigator.platform],
                ['语言', navigator.language],
                ['WebGL2', canvasSupportsWebGL() ? '支持' : '不支持'],
                ['渲染进程 GPU', navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} 核` : 'N/A'],
                ['用户代理', navigator.userAgent.substring(0, 60) + '...'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '6px 8px', backgroundColor: 'var(--ho-bg-tertiary)', borderRadius: 4 }}>
                  <div style={{ color: 'var(--ho-text-tertiary)', marginBottom: 2 }}>{k}</div>
                  <div style={{ color: 'var(--ho-text-primary)', fontFamily: 'monospace' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function canvasSupportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!c.getContext('webgl2')
  } catch { return false }
}
