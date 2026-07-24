import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs'

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
