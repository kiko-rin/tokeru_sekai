import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import type { TranscodeOptions } from '@shared/types'
import { getPixelFormat, getFFmpegArgs } from './codecConfig'

class FFmpegServiceImpl {
  private ffmpeg: FFmpeg
  private loaded = false
  private loading = false

  constructor() {
    this.ffmpeg = new FFmpeg()
  }

  async load(onProgress?: (progress: number) => void): Promise<void> {
    if (this.loaded || this.loading) return
    this.loading = true

    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
      })
      this.loaded = true
    } finally {
      this.loading = false
    }
  }

  async getMediaInfo(file: File): Promise<Record<string, unknown>> {
    await this.ensureLoaded()
    await this.ffmpeg.writeFile('input', new Uint8Array(await file.arrayBuffer()))
    const probe = await this.ffmpeg.exec(['-i', 'input', '-f', 'null', '-'])
    const logs = this.ffmpeg.on('log', (e) => e)
    void probe
    void logs
    return {}
  }

  async transcode(
    input: File,
    options: TranscodeOptions,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    await this.ensureLoaded()

    const inputData = new Uint8Array(await input.arrayBuffer())
    await this.ffmpeg.writeFile('input', inputData)

    const pixelFormat = getPixelFormat(options.codec, options.chromaSubsampling, options.colorDepth)
    const args = getFFmpegArgs(options.codec, {
      pixelFormat,
      width: options.width,
      height: options.height,
      fps: options.fps,
      bitrate: options.bitrate ? `${options.bitrate}` : undefined,
      crf: options.crf
    })

    this.ffmpeg.on('progress', ({ progress }) => {
      onProgress?.(progress * 100)
    })

    await this.ffmpeg.exec(['-i', 'input', ...args, 'output.mp4'])
    const outputData: Uint8Array = await this.ffmpeg.readFile('output.mp4') as Uint8Array

    await this.ffmpeg.deleteFile('input')
    await this.ffmpeg.deleteFile('output.mp4')

    return new Blob([outputData.buffer as ArrayBuffer], { type: 'video/mp4' })
  }

  async extractAudio(input: File): Promise<Blob> {
    await this.ensureLoaded()
    const inputData = new Uint8Array(await input.arrayBuffer())
    await this.ffmpeg.writeFile('input', inputData)
    await this.ffmpeg.exec(['-i', 'input', '-vn', '-acodec', 'copy', 'output.aac'])
    const outputData: Uint8Array = await this.ffmpeg.readFile('output.aac') as Uint8Array
    await this.ffmpeg.deleteFile('input')
    await this.ffmpeg.deleteFile('output.aac')
    return new Blob([outputData.buffer as ArrayBuffer], { type: 'audio/aac' })
  }

  async generateThumbnail(input: File, time: number): Promise<Blob> {
    await this.ensureLoaded()
    const inputData = new Uint8Array(await input.arrayBuffer())
    await this.ffmpeg.writeFile('input', inputData)
    await this.ffmpeg.exec([
      '-i', 'input',
      '-ss', String(time),
      '-vframes', '1',
      '-vf', 'scale=320:-1',
      'thumb.png'
    ])
    const outputData: Uint8Array = await this.ffmpeg.readFile('thumb.png') as Uint8Array
    await this.ffmpeg.deleteFile('input')
    await this.ffmpeg.deleteFile('thumb.png')
    return new Blob([outputData.buffer as ArrayBuffer], { type: 'image/png' })
  }

  cancel(): void {
    this.ffmpeg.terminate()
    this.ffmpeg = new FFmpeg()
    this.loaded = false
  }

  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      await this.load()
    }
  }
}

export const FFmpegService = new FFmpegServiceImpl()
