import { contextBridge, ipcRenderer } from 'electron'

export interface DialogFilter { name: string; extensions: string[] }
export interface OpenDialogOptions { title?: string; defaultPath?: string; filters?: DialogFilter[]; properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'> }
export interface SaveDialogOptions { title?: string; defaultPath?: string; filters?: DialogFilter[] }

const electronAPI = {
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:get-version'),
    getPlatform: (): Promise<string> => ipcRenderer.invoke('app:get-platform')
  },
  window: {
    minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
    maximize: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
    close: (): Promise<void> => ipcRenderer.invoke('window:close'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:is-maximized')
  },
  dialog: {
    openFile: (options: OpenDialogOptions): Promise<string[] | null> => ipcRenderer.invoke('dialog:open-file', options),
    saveFile: (options: SaveDialogOptions): Promise<string | null> => ipcRenderer.invoke('dialog:save-file', options),
    openDirectory: (options: OpenDialogOptions): Promise<string | null> => ipcRenderer.invoke('dialog:open-directory', options)
  },
  dit: {
    scanCard: (cardPath: string): Promise<{ success: boolean; files?: { name: string; path: string; size: number; mtime: number }[]; totalSize?: number; cardLabel?: string; error?: string }> =>
      ipcRenderer.invoke('dit:scan-card', cardPath),
    computeHash: (filePath: string, algorithm: string): Promise<{ success: boolean; hash?: string; algorithm?: string; error?: string }> =>
      ipcRenderer.invoke('dit:compute-hash', filePath, algorithm),
    copyFile: (srcPath: string, destPath: string, algorithm: string): Promise<{ success: boolean; copiedBytes?: number; destHash?: string; algorithm?: string; error?: string }> =>
      ipcRenderer.invoke('dit:copy-file', srcPath, destPath, algorithm),
    getCardLabel: (cardPath: string): Promise<{ success: boolean; label?: string; error?: string }> =>
      ipcRenderer.invoke('dit:get-card-label', cardPath),
    projectSaveConfig: (projectPath: string, configData: unknown): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('dit:project-save-config', projectPath, configData),
    projectLoadConfig: (projectPath: string): Promise<{ success: boolean; config?: unknown; error?: string }> =>
      ipcRenderer.invoke('dit:project-load-config', projectPath),
    resolveFile: (originalPath: string, searchRoot: string, hash: string, algorithm: string): Promise<{ success: boolean; resolvedPath?: string; match?: string; error?: string; fileName?: string }> =>
      ipcRenderer.invoke('dit:resolve-file', originalPath, searchRoot, hash, algorithm),
    moveFile: (srcPath: string, destPath: string, updateAllReferences: boolean): Promise<{ success: boolean; newPath?: string; method?: string; error?: string }> =>
      ipcRenderer.invoke('dit:move-file', srcPath, destPath, updateAllReferences),
    scanProject: (projectPath: string): Promise<{ success: boolean; files?: { name: string; path: string; size: number; mtime: number }[]; totalSize?: number; error?: string }> =>
      ipcRenderer.invoke('dit:scan-project', projectPath)
  },
  fs: {
    readTextFile: (path: string): Promise<string> => ipcRenderer.invoke('fs:read-text-file', path),
    writeTextFile: (path: string, content: string): Promise<void> => ipcRenderer.invoke('fs:write-text-file', path, content),
    readFile: (path: string): Promise<ArrayBuffer> => ipcRenderer.invoke('fs:read-file', path),
    writeFile: (path: string, data: ArrayBuffer): Promise<void> => ipcRenderer.invoke('fs:write-file', path, data),
    readDirectory: (path: string): Promise<string[]> => ipcRenderer.invoke('fs:read-directory', path),
    fileExists: (path: string): Promise<boolean> => ipcRenderer.invoke('fs:file-exists', path)
  },
  project: {
    save: (path: string, data: unknown): Promise<void> => ipcRenderer.invoke('project:save', path, data),
    load: (path: string): Promise<unknown> => ipcRenderer.invoke('project:load', path)
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels: string[] = ['app:update-available', 'app:download-progress', 'window:state-changed']
    if (validChannels.includes(channel)) ipcRenderer.on(channel, (_event, ...args) => callback(...args))
  },
  off: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels: string[] = ['app:update-available', 'app:download-progress', 'window:state-changed']
    if (validChannels.includes(channel)) ipcRenderer.removeListener(channel, callback)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
