import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync, copyFileSync } from 'fs'
import { createHash } from 'crypto'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#141414',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function computeFileHash(filePath: string, algorithm: string): string {
  const hash = createHash(algorithm)
  const chunkSize = 64 * 1024
  const fd = readFileSync(filePath)
  let offset = 0
  while (offset < fd.length) {
    const chunk = fd.subarray(offset, Math.min(offset + chunkSize, fd.length))
    hash.update(chunk)
    offset += chunkSize
  }
  return hash.digest('hex')
}

function scanDirectory(dirPath: string): { files: { name: string; path: string; size: number; mtime: number }[]; totalSize: number } {
  const results: { name: string; path: string; size: number; mtime: number }[] = []
  let totalSize = 0

  function walk(currentPath: string) {
    const entries = readdirSync(currentPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name)
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.')) walk(fullPath)
      } else if (entry.isFile()) {
        const mediaExts = ['.mp4','.mov','.avi','.mxf','.r3d','.arw','.cr2','.nef','.dng','.tif','.tiff','.jpg','.jpeg','.png','.bmp','.wav','.mp3','.aac','.flac','.m4a','.srt','.ass','.lrt','.cube','.3dl','.drp','.zip','.7z']
        const ext = entry.name.toLowerCase().substring(entry.name.lastIndexOf('.'))
        if (mediaExts.includes(ext)) {
          const stat = statSync(fullPath)
          results.push({ name: entry.name, path: fullPath, size: stat.size, mtime: stat.mtimeMs })
          totalSize += stat.size
        }
      }
    }
  }

  walk(dirPath)
  return { files: results.sort((a, b) => a.name.localeCompare(b.name)), totalSize }
}

function copyWithVerify(srcPath: string, destPath: string, algorithm: string, onProgress?: (bytes: number) => void): { copiedBytes: number; hash: string } {
  const srcBuffer = readFileSync(srcPath)
  const destDir = destPath.substring(0, Math.max(destPath.lastIndexOf('/'), destPath.lastIndexOf('\\')))
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })

  // Copy
  writeFileSync(destPath, srcBuffer)
  onProgress?.(srcBuffer.length)

  // Verify: compute hash of destination
  const destHash = computeFileHash(destPath, algorithm)

  return { copiedBytes: srcBuffer.length, hash: destHash }
}

function registerIpcHandlers(): void {
  ipcMain.handle('app:get-version', () => app.getVersion())
  ipcMain.handle('app:get-platform', () => process.platform)

  ipcMain.handle('window:minimize', () => mainWindow?.minimize())
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) { mainWindow.unmaximize() } else { mainWindow?.maximize() }
  })
  ipcMain.handle('window:close', () => mainWindow?.close())
  ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false)

  ipcMain.handle('dialog:open-file', async (_e, options) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: options.title || '选择文件',
      defaultPath: options.defaultPath,
      filters: options.filters,
      properties: options.properties || ['openFile']
    })
    return result.canceled ? null : result.filePaths
  })

  ipcMain.handle('dialog:save-file', async (_e, options) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: options.title || '保存文件',
      defaultPath: options.defaultPath,
      filters: options.filters
    })
    return result.canceled ? null : result.filePath
  })

  ipcMain.handle('dialog:open-directory', async (_e, options) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: options.title || '选择目录',
      defaultPath: options.defaultPath,
      properties: ['openDirectory']
    })
    return result.canceled ? null : (result.filePaths[0] || null)
  })

  // === DIT IPC handlers ===

  ipcMain.handle('dit:scan-card', async (_e, cardPath: string) => {
    try {
      const { files, totalSize } = scanDirectory(cardPath)
      const cardLabel = cardPath.split(/[/\\]/).pop() || 'Unnamed Card'
      return { success: true, files, totalSize, cardLabel }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('dit:compute-hash', async (_e, filePath: string, algorithm: string) => {
    try {
      const hash = computeFileHash(filePath, algorithm || 'sha256')
      return { success: true, hash, algorithm }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('dit:copy-file', async (_e, srcPath: string, destPath: string, algorithm: string) => {
    try {
      const { copiedBytes, hash } = copyWithVerify(srcPath, destPath, algorithm)
      return { success: true, copiedBytes, destHash: hash, algorithm }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('dit:get-card-label', async (_e, cardPath: string) => {
    try {
      const label = cardPath.split(/[/\\]/).pop() || 'Unnamed Card'
      return { success: true, label }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // === End DIT ===

  ipcMain.handle('fs:read-text-file', async (_e, path: string) => {
    return readFileSync(path, 'utf-8')
  })

  ipcMain.handle('fs:write-text-file', async (_e, path: string, content: string) => {
    const dir = path.substring(0, Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')))
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(path, content, 'utf-8')
  })

  ipcMain.handle('fs:read-file', async (_e, path: string) => {
    const buffer = readFileSync(path)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  })

  ipcMain.handle('fs:write-file', async (_e, path: string, data: ArrayBuffer) => {
    const dir = path.substring(0, Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')))
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(path, Buffer.from(data))
  })

  ipcMain.handle('fs:read-directory', async (_e, path: string) => {
    return readdirSync(path)
  })

  ipcMain.handle('fs:file-exists', async (_e, path: string) => {
    return existsSync(path)
  })

  ipcMain.handle('project:save', async (_e, path: string, data: unknown) => {
    const dir = path.substring(0, Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')))
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')
  })

  ipcMain.handle('project:load', async (_e, path: string) => {
    const content = readFileSync(path, 'utf-8')
    return JSON.parse(content)
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
