export class Vectorscope {
  private size: number
  private buffer: Float32Array
  private canvas: OffscreenCanvas | null = null

  constructor(size = 256) {
    this.size = size
    this.buffer = new Float32Array(size * size * 4)
  }

  compute(imageData: ImageData): ImageData {
    const { width, height, data } = imageData
    this.buffer.fill(0)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        const r = data[i] / 255
        const g = data[i + 1] / 255
        const b = data[i + 2] / 255

        const u = -0.14713 * r - 0.28886 * g + 0.436 * b
        const v = 0.615 * r - 0.51499 * g - 0.10001 * b

        const px = Math.round((u + 0.5) * (this.size - 1))
        const py = Math.round((v + 0.5) * (this.size - 1))

        if (px >= 0 && px < this.size && py >= 0 && py < this.size) {
          const idx = (py * this.size + px) * 4
          this.buffer[idx] = Math.min(this.buffer[idx] + 0.01, 1)
          this.buffer[idx + 1] = Math.min(this.buffer[idx + 1] + 0.008, 1)
          this.buffer[idx + 2] = Math.min(this.buffer[idx + 2] + 0.006, 1)
          this.buffer[idx + 3] = 1
        }
      }
    }

    const output = new Uint8ClampedArray(this.size * this.size * 4)
    for (let i = 0; i < this.buffer.length; i += 4) {
      output[i] = Math.round(this.buffer[i] * 122)
      output[i + 1] = Math.round(this.buffer[i + 1] * 158)
      output[i + 2] = Math.round(this.buffer[i + 2] * 196)
      output[i + 3] = this.buffer[i + 3] > 0 ? 255 : 0
    }

    return new ImageData(output, this.size, this.size)
  }

  drawOverlay(ctx: CanvasRenderingContext2D): void {
    const cx = this.size / 2
    const cy = this.size / 2
    const r = this.size * 0.38

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1

    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2)
    ctx.stroke()

    const labels = [
      { name: 'R', angle: -Math.PI / 6 },
      { name: 'MG', angle: -Math.PI / 3 },
      { name: 'G', angle: -Math.PI * 5 / 6 },
      { name: 'CY', angle: Math.PI * 5 / 6 },
      { name: 'B', angle: Math.PI / 3 },
      { name: 'Y', angle: Math.PI / 6 }
    ]

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (const label of labels) {
      const lx = cx + Math.cos(label.angle) * (r + 12)
      const ly = cy + Math.sin(label.angle) * (r + 12)
      ctx.fillText(label.name, lx, ly)

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(
        cx + Math.cos(label.angle) * r,
        cy + Math.sin(label.angle) * r
      )
      ctx.stroke()
    }
  }
}

export class Waveform {
  private width: number
  private height: number

  constructor(width = 512, height = 200) {
    this.width = width
    this.height = height
  }

  computeLuma(imageData: ImageData): ImageData {
    const { width, height, data } = imageData
    const output = new Float32Array(this.width * this.height * 4)

    for (let x = 0; x < width; x++) {
      const outX = Math.round((x / width) * (this.width - 1))
      for (let y = 0; y < height; y++) {
        const i = (y * width + x) * 4
        const luma = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
        const outY = Math.round((1 - luma) * (this.height - 1))
        const idx = (outY * this.width + outX) * 4
        output[idx] = Math.min(output[idx] + 0.015, 1)
        output[idx + 1] = Math.min(output[idx + 1] + 0.012, 1)
        output[idx + 2] = Math.min(output[idx + 2] + 0.008, 1)
        output[idx + 3] = 1
      }
    }

    const pixels = new Uint8ClampedArray(this.width * this.height * 4)
    for (let i = 0; i < output.length; i += 4) {
      if (output[i + 3] > 0) {
        const v = output[i]
        if (v < 0.5) {
          pixels[i] = Math.round(v * 2 * 107)
          pixels[i + 1] = Math.round(v * 2 * 158)
          pixels[i + 2] = Math.round(v * 2 * 122)
        } else {
          const t = (v - 0.5) * 2
          pixels[i] = Math.round(107 + t * (180 - 107))
          pixels[i + 1] = Math.round(158 + t * (168 - 158))
          pixels[i + 2] = Math.round(122 + t * (106 - 122))
        }
        pixels[i + 3] = 255
      }
    }

    return new ImageData(pixels, this.width, this.height)
  }

  computeRGBParade(imageData: ImageData): ImageData {
    const { width, height, data } = imageData
    const paradeWidth = this.width * 3
    const output = new Float32Array(paradeWidth * this.height * 4)

    const channels = [
      { offset: 0, scale: [1, 0, 0] },
      { offset: 1, scale: [0, 1, 0] },
      { offset: 2, scale: [0, 0, 1] }
    ]

    for (const ch of channels) {
      const startX = ch.offset * this.width
      for (let x = 0; x < width; x++) {
        const outX = startX + Math.round((x / width) * (this.width - 1))
        for (let y = 0; y < height; y++) {
          const i = (y * width + x) * 4
          const val = (data[i + ch.offset] / 255)
          const outY = Math.round((1 - val) * (this.height - 1))
          const idx = (outY * paradeWidth + outX) * 4
          output[idx] = Math.min(output[idx] + 0.01 * ch.scale[0], 1)
          output[idx + 1] = Math.min(output[idx + 1] + 0.01 * ch.scale[1], 1)
          output[idx + 2] = Math.min(output[idx + 2] + 0.01 * ch.scale[2], 1)
          output[idx + 3] = 1
        }
      }
    }

    const pixels = new Uint8ClampedArray(paradeWidth * this.height * 4)
    for (let i = 0; i < output.length; i += 4) {
      if (output[i + 3] > 0) {
        pixels[i] = Math.round(output[i] * 255)
        pixels[i + 1] = Math.round(output[i + 1] * 255)
        pixels[i + 2] = Math.round(output[i + 2] * 255)
        pixels[i + 3] = 255
      }
    }

    return new ImageData(pixels, paradeWidth, this.height)
  }
}

export class Histogram {
  private bins: number

  constructor(bins = 256) {
    this.bins = bins
  }

  computeLuma(imageData: ImageData): Uint32Array {
    const { data } = imageData
    const hist = new Uint32Array(this.bins)

    for (let i = 0; i < data.length; i += 4) {
      const luma = Math.round(
        (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2])
      )
      hist[Math.min(luma, this.bins - 1)]++
    }

    return hist
  }

  computeRGB(imageData: ImageData): { r: Uint32Array; g: Uint32Array; b: Uint32Array } {
    const { data } = imageData
    const r = new Uint32Array(this.bins)
    const g = new Uint32Array(this.bins)
    const b = new Uint32Array(this.bins)

    for (let i = 0; i < data.length; i += 4) {
      r[Math.min(data[i], this.bins - 1)]++
      g[Math.min(data[i + 1], this.bins - 1)]++
      b[Math.min(data[i + 2], this.bins - 1)]++
    }

    return { r, g, b }
  }

  drawToCanvas(
    ctx: CanvasRenderingContext2D,
    hist: Uint32Array,
    width: number,
    height: number,
    color?: string
  ): void {
    const max = Math.max(...hist)
    if (max === 0) return

    ctx.clearRect(0, 0, width, height)

    const barWidth = width / this.bins

    for (let i = 0; i < this.bins; i++) {
      const barHeight = (hist[i] / max) * height
      const x = i * barWidth
      const y = height - barHeight

      ctx.fillStyle = color || `rgba(122, 158, 196, 0.8)`
      ctx.fillRect(x, y, barWidth + 0.5, barHeight)
    }
  }
}
