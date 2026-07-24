export interface DialogFilter {
  name: string
  extensions: string[]
}

export interface OpenDialogOptions {
  title?: string
  defaultPath?: string
  filters?: DialogFilter[]
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>
}

export interface SaveDialogOptions {
  title?: string
  defaultPath?: string
  filters?: DialogFilter[]
}

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
  on: (channel: string, callback: (...args: unknown[]) => void) => void
  off: (channel: string, callback: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
