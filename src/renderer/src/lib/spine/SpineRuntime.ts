export class SpineRuntime {
  private loaded = false
  private loading = false
  private scriptElement: HTMLScriptElement | null = null
  private resolvePromise: (() => void) | null = null
  private rejectPromise: ((err: Error) => void) | null = null

  load(): Promise<void> {
    if (this.loaded) return Promise.resolve()
    if (this.loading) return new Promise((resolve, reject) => {
      this.resolvePromise = resolve
      this.rejectPromise = reject
    })

    this.loading = true
    return new Promise((resolve, reject) => {
      this.resolvePromise = resolve
      this.rejectPromise = reject
      this.scriptElement = document.createElement('script')
      this.scriptElement.src = '/spine/spine-webgl.js'
      this.scriptElement.onload = () => {
        this.loaded = true
        this.loading = false
        this.resolvePromise?.()
      }
      this.scriptElement.onerror = () => {
        this.loading = false
        const err = new Error('spine-webgl.js not found at /spine/spine-webgl.js')
        this.rejectPromise?.(err)
      }
      document.head.appendChild(this.scriptElement)
    })
  }

  isLoaded(): boolean {
    return this.loaded
  }
}

export const spineRuntime = new SpineRuntime()
