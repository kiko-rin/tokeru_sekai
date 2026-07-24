import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import { join, sep, relative } from 'path'
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync, copyFileSync, renameSync, unlinkSync } from 'fs'
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

  // === DIT Project Config & File Management ===

  ipcMain.handle('dit:project-save-config', async (_e, projectPath: string, configData: unknown) => {
    try {
      const configDir = join(projectPath, '.2dw')
      if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })
      writeFileSync(join(configDir, 'project.json'), JSON.stringify(configData, null, 2), 'utf-8')
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('dit:project-load-config', async (_e, projectPath: string) => {
    try {
      const configPath = join(projectPath, '.2dw', 'project.json')
      if (!existsSync(configPath)) return { success: true, config: null }
      const content = readFileSync(configPath, 'utf-8')
      return { success: true, config: JSON.parse(content) }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('dit:resolve-file', async (_e, originalPath: string, searchRoot: string, hash: string, algorithm: string) => {
    try {
      // Step 1: Check if original path still exists
      if (existsSync(originalPath)) {
        // Verify hash
        const actualHash = computeFileHash(originalPath, algorithm)
        if (actualHash === hash) return { success: true, resolvedPath: originalPath, match: 'exact' }
      }

      // Step 2: Search by filename in searchRoot
      const fileName = originalPath.split(/[/\\]/).pop() || ''
      if (!fileName) return { success: false, error: 'Invalid path' }

      const foundFiles: { path: string; score: number }[] = []

      function walkSearch(dir: string, depth: number) {
        if (depth > 5) return // limit depth to avoid excessive scanning
        try {
          const entries = readdirSync(dir, { withFileTypes: true })
          for (const entry of entries) {
            const fullPath = join(dir, entry.name)
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
              walkSearch(fullPath, depth + 1)
            } else if (entry.isFile() && entry.name === fileName) {
              foundFiles.push({ path: fullPath, score: depth })
            }
          }
        } catch {}
      }
      walkSearch(searchRoot, 0)

      if (foundFiles.length > 0) {
        // Pick the shallowest match and verify hash
        foundFiles.sort((a, b) => a.score - b.score)
        for (const f of foundFiles) {
          const actualHash = computeFileHash(f.path, algorithm)
          if (actualHash === hash) return { success: true, resolvedPath: f.path, match: 'hash' }
        }
        // No hash match, return the closest by name
        return { success: true, resolvedPath: foundFiles[0].path, match: 'name-only' }
      }

      return { success: false, error: 'File not found', fileName }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('dit:move-file', async (_e, srcPath: string, destPath: string, updateAllReferences: boolean) => {
    try {
      const destDir = destPath.substring(0, Math.max(destPath.lastIndexOf('/'), destPath.lastIndexOf('\\')))
      if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
      renameSync(srcPath, destPath)
      return { success: true, newPath: destPath }
    } catch (err: any) {
      // Fall back to copy+delete if rename fails (cross-device)
      try {
        const buffer = readFileSync(srcPath)
        writeFileSync(destPath, buffer)
        unlinkSync(srcPath)
        return { success: true, newPath: destPath, method: 'copy-delete' }
      } catch (err2: any) {
        return { success: false, error: err2.message }
      }
    }
  })

  ipcMain.handle('dit:scan-project', async (_e, projectPath: string) => {
    try {
      const { files, totalSize } = scanDirectory(projectPath)
      return { success: true, files, totalSize }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // === End DIT Project Config ===

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
