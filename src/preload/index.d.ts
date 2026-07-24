export interface DialogFilter { name: string; extensions: string[] }
export interface OpenDialogOptions { title?: string; defaultPath?: string; filters?: DialogFilter[]; properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'> }
export interface SaveDialogOptions { title?: string; defaultPath?: string; filters?: DialogFilter[] }

export interface DITScanResult { success: boolean; files?: { name: string; path: string; size: number; mtime: number }[]; totalSize?: number; cardLabel?: string; error?: string }
export interface DITHashResult { success: boolean; hash?: string; algorithm?: string; error?: string }
export interface DITCopyResult { success: boolean; copiedBytes?: number; destHash?: string; algorithm?: string; error?: string }
export interface DITResolveResult { success: boolean; resolvedPath?: string; match?: string; error?: string; fileName?: string }
export interface DITMoveResult { success: boolean; newPath?: string; method?: string; error?: string }
export interface DITProjectConfigResult { success: boolean; config?: unknown; error?: string }

export interface ElectronAPI {
  app: {
    getVersion: () => Promise<string>
    getPlatform: () => Promise<string>
  }
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
  dialog: {
    openFile: (options: OpenDialogOptions) => Promise<string[] | null>
    saveFile: (options: SaveDialogOptions) => Promise<string | null>
    openDirectory: (options: OpenDialogOptions) => Promise<string | null>
  }
  dit: {
    scanCard: (cardPath: string) => Promise<DITScanResult>
    computeHash: (filePath: string, algorithm: string) => Promise<DITHashResult>
    copyFile: (srcPath: string, destPath: string, algorithm: string) => Promise<DITCopyResult>
    getCardLabel: (cardPath: string) => Promise<{ success: boolean; label?: string; error?: string }>
    projectSaveConfig: (projectPath: string, configData: unknown) => Promise<{ success: boolean; error?: string }>
    projectLoadConfig: (projectPath: string) => Promise<DITProjectConfigResult>
    resolveFile: (originalPath: string, searchRoot: string, hash: string, algorithm: string) => Promise<DITResolveResult>
    moveFile: (srcPath: string, destPath: string, updateAllReferences: boolean) => Promise<DITMoveResult>
    scanProject: (projectPath: string) => Promise<DITScanResult>
  }
  fs: {
    readTextFile: (path: string) => Promise<string>
    writeTextFile: (path: string, content: string) => Promise<void>
    readFile: (path: string) => Promise<ArrayBuffer>
    writeFile: (path: string, data: ArrayBuffer) => Promise<void>
    readDirectory: (path: string) => Promise<string[]>
    fileExists: (path: string) => Promise<boolean>
  }
  project: {
    save: (path: string, data: unknown) => Promise<void>
    load: (path: string) => Promise<unknown>
  }
  encoder: {
    detect: () => Promise<{ available: string[]; recommended: string; details: { name: string; available: boolean; vendor: string }[] }>
    verify: (encoderName: string) => Promise<{ available: boolean; recommended: string; details: { name: string; available: boolean; vendor: string }[] }>
  }
  on: (channel: string, callback: (...args: unknown[]) => void) => void
  off: (channel: string, callback: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
