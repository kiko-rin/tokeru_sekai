import {
  CameraManufacturer,
  CameraProfile,
  ColorSpace,
  ColorDepth,
  ChromaSubsampling,
  ACEColorSettings,
  LUTPreset,
  LUTData
} from '@shared/types'

interface ColorStats {
  temperature: number
  tint: number
  saturation: number
  luminance: number
  contrast: number
  dominantHue: number
}

const BUILT_IN_LUTS: LUTPreset[] = [
  { id: 'slog2_linear', name: 'Sony S-Log2 → Linear', source: 'built-in', inputColorSpace: ColorSpace.SLog2, outputColorSpace: ColorSpace.Rec709, fileName: 'slog2_to_linear.cube', filePath: '/luts/slog2_to_linear.cube' },
  { id: 'slog3_linear', name: 'Sony S-Log3 → Linear', source: 'built-in', inputColorSpace: ColorSpace.SLog3, outputColorSpace: ColorSpace.Rec709, fileName: 'slog3_to_linear.cube', filePath: '/luts/slog3_to_linear.cube' },
  { id: 'clog_linear', name: 'Canon C-Log → Linear', source: 'built-in', inputColorSpace: ColorSpace.CLog, outputColorSpace: ColorSpace.Rec709, fileName: 'clog_to_linear.cube', filePath: '/luts/clog_to_linear.cube' },
  { id: 'clog2_linear', name: 'Canon C-Log2 → Linear', source: 'built-in', inputColorSpace: ColorSpace.CLog2, outputColorSpace: ColorSpace.Rec709, fileName: 'clog2_to_linear.cube', filePath: '/luts/clog2_to_linear.cube' },
  { id: 'clog3_linear', name: 'Canon C-Log3 → Linear', source: 'built-in', inputColorSpace: ColorSpace.CLog3, outputColorSpace: ColorSpace.Rec709, fileName: 'clog3_to_linear.cube', filePath: '/luts/clog3_to_linear.cube' },
  { id: 'vlog_linear', name: 'Panasonic V-Log → Linear', source: 'built-in', inputColorSpace: ColorSpace.VLog, outputColorSpace: ColorSpace.Rec709, fileName: 'vlog_to_linear.cube', filePath: '/luts/vlog_to_linear.cube' },
  { id: 'vlogl_linear', name: 'Panasonic V-Log L → Linear', source: 'built-in', inputColorSpace: ColorSpace.VLogL, outputColorSpace: ColorSpace.Rec709, fileName: 'vlogl_to_linear.cube', filePath: '/luts/vlogl_to_linear.cube' },
  { id: 'red_log3g10_linear', name: 'RED Log3G10 → Linear', source: 'built-in', inputColorSpace: ColorSpace.Log3G10, outputColorSpace: ColorSpace.Rec709, fileName: 'red_log3g10_to_linear.cube', filePath: '/luts/red_log3g10_to_linear.cube' },
  { id: 'arrilogc3_linear', name: 'ARRI LogC3 → Linear', source: 'built-in', inputColorSpace: ColorSpace.LogC3, outputColorSpace: ColorSpace.Rec709, fileName: 'arrilogc3_to_linear.cube', filePath: '/luts/arrilogc3_to_linear.cube' },
  { id: 'arrilogc4_linear', name: 'ARRI LogC4 → Linear', source: 'built-in', inputColorSpace: ColorSpace.LogC4, outputColorSpace: ColorSpace.Rec709, fileName: 'arrilogc4_to_linear.cube', filePath: '/luts/arrilogc4_to_linear.cube' },
  { id: 'dlog_linear', name: 'DJI D-Log → Linear', source: 'built-in', inputColorSpace: ColorSpace.DLog, outputColorSpace: ColorSpace.Rec709, fileName: 'dlog_to_linear.cube', filePath: '/luts/dlog_to_linear.cube' },
  { id: 'nlog_linear', name: 'Nikon N-Log → Linear', source: 'built-in', inputColorSpace: ColorSpace.NLog, outputColorSpace: ColorSpace.Rec709, fileName: 'nlog_to_linear.cube', filePath: '/luts/nlog_to_linear.cube' },
  { id: 'flog_linear', name: 'Fujifilm F-Log → Linear', source: 'built-in', inputColorSpace: ColorSpace.FLog, outputColorSpace: ColorSpace.Rec709, fileName: 'flog_to_linear.cube', filePath: '/luts/flog_to_linear.cube' },
  { id: 'flog2_linear', name: 'Fujifilm F-Log2 → Linear', source: 'built-in', inputColorSpace: ColorSpace.FLog2, outputColorSpace: ColorSpace.Rec709, fileName: 'flog2_to_linear.cube', filePath: '/luts/flog2_to_linear.cube' }
]

export class CameraDetector {
  private static readonly MANUFACTURER_KEYWORDS: Record<CameraManufacturer, string[]> = {
    [CameraManufacturer.Sony]: ['Sony', 'X-OCN', 'XAVC', 'XDCAM', 'S-Log', 'S-Gamut'],
    [CameraManufacturer.Canon]: ['Canon', 'CinemaRAW', 'C-Log', 'Cinema Gamut'],
    [CameraManufacturer.Panasonic]: ['Panasonic', 'P2', 'V-Log', 'V-Gamut', 'Varicam'],
    [CameraManufacturer.RED]: ['RED', 'REDCODE', 'R3D', 'Log3G'],
    [CameraManufacturer.ARRI]: ['ARRI', 'ALEXA', 'LogC', 'ARRI Wide Gamut'],
    [CameraManufacturer.Blackmagic]: ['Blackmagic', 'BRAW', 'BMDFilm'],
    [CameraManufacturer.DJI]: ['DJI', 'D-Log', 'D-Gamut'],
    [CameraManufacturer.Nikon]: ['Nikon', 'N-Log', 'Nikon Gamut'],
    [CameraManufacturer.Fujifilm]: ['Fujifilm', 'F-Log', 'F-Gamut']
  }

  static detect(metadata: Record<string, unknown>): CameraProfile | null {
    const maker = String(metadata.maker || metadata.Make || '').toLowerCase()
    const model = String(metadata.model || metadata.Model || '').toLowerCase()
    const format = String(metadata.format || metadata.ContainerType || '').toLowerCase()
    const allText = `${maker} ${model} ${format}`.toLowerCase()

    for (const [manufacturer, keywords] of Object.entries(this.MANUFACTURER_KEYWORDS)) {
      const matched = keywords.some(kw => allText.includes(kw.toLowerCase()))
      if (matched) {
        return this.buildProfile(manufacturer as CameraManufacturer, metadata)
      }
    }

    return null
  }

  private static buildProfile(manufacturer: CameraManufacturer, metadata: Record<string, unknown>): CameraProfile {
    const logCurve = this.detectLogCurve(manufacturer, metadata)
    const colorGamut = this.detectColorGamut(manufacturer, metadata)
    const colorDepth = this.detectColorDepth(metadata)
    const chromaSubsampling = this.detectChromaSubsampling(metadata)
    const lutApplied = this.detectLUTApplied(metadata)

    return {
      manufacturer,
      logCurve,
      colorGamut,
      colorDepth,
      chromaSubsampling,
      lutApplied,
      lutName: lutApplied ? String(metadata.lutName || 'Unknown LUT') : undefined
    }
  }

  private static detectLogCurve(manufacturer: CameraManufacturer, metadata: Record<string, unknown>): ColorSpace {
    const gamma = String(metadata.gamma || metadata.LogCurve || metadata.Curve || '').toLowerCase()
    const allText = JSON.stringify(metadata).toLowerCase()

    const logCurves: Record<CameraManufacturer, Array<{ pattern: string; curve: ColorSpace }>> = {
      [CameraManufacturer.Sony]: [
        { pattern: 's-log3', curve: ColorSpace.SLog3 },
        { pattern: 's-log2', curve: ColorSpace.SLog2 },
        { pattern: 'hlg', curve: ColorSpace.HLG }
      ],
      [CameraManufacturer.Canon]: [
        { pattern: 'c-log3', curve: ColorSpace.CLog3 },
        { pattern: 'c-log2', curve: ColorSpace.CLog2 },
        { pattern: 'c-log', curve: ColorSpace.CLog }
      ],
      [CameraManufacturer.Panasonic]: [
        { pattern: 'v-log l', curve: ColorSpace.VLogL },
        { pattern: 'v-log', curve: ColorSpace.VLog }
      ],
      [CameraManufacturer.RED]: [
        { pattern: 'log3g12', curve: ColorSpace.Log3G12 },
        { pattern: 'log3g10', curve: ColorSpace.Log3G10 }
      ],
      [CameraManufacturer.ARRI]: [
        { pattern: 'logc4', curve: ColorSpace.LogC4 },
        { pattern: 'logc3', curve: ColorSpace.LogC3 },
        { pattern: 'logc', curve: ColorSpace.LogC }
      ],
      [CameraManufacturer.Blackmagic]: [
        { pattern: 'bmdfilm', curve: ColorSpace.BMDFilm }
      ],
      [CameraManufacturer.DJI]: [
        { pattern: 'd-log', curve: ColorSpace.DLog }
      ],
      [CameraManufacturer.Nikon]: [
        { pattern: 'n-log', curve: ColorSpace.NLog }
      ],
      [CameraManufacturer.Fujifilm]: [
        { pattern: 'f-log2', curve: ColorSpace.FLog2 },
        { pattern: 'f-log', curve: ColorSpace.FLog }
      ]
    }

    const curves = logCurves[manufacturer] || []
    for (const { pattern, curve } of curves) {
      if (gamma.includes(pattern) || allText.includes(pattern)) {
        return curve
      }
    }

    return ColorSpace.Rec709
  }

  private static detectColorGamut(manufacturer: CameraManufacturer, metadata: Record<string, unknown>): string {
    const allText = JSON.stringify(metadata).toLowerCase()

    const gamuts: Record<CameraManufacturer, Array<{ pattern: string; gamut: string }>> = {
      [CameraManufacturer.Sony]: [
        { pattern: 's-gamut3.cine', gamut: 'S-Gamut3.Cine' },
        { pattern: 's-gamut3', gamut: 'S-Gamut3' },
        { pattern: 's-gamut', gamut: 'S-Gamut' }
      ],
      [CameraManufacturer.Canon]: [
        { pattern: 'cinema gamut', gamut: 'Cinema Gamut' },
        { pattern: 'bt.2020', gamut: 'BT.2020' }
      ],
      [CameraManufacturer.Panasonic]: [
        { pattern: 'v-gamut', gamut: 'V-Gamut' },
        { pattern: 'v-gamut l', gamut: 'V-Gamut L' }
      ],
      [CameraManufacturer.RED]: [
        { pattern: 'redwidegamutrgb', gamut: 'REDWideGamutRGB' },
        { pattern: 'dragoncolor2', gamut: 'DragonColor2' },
        { pattern: 'dragoncolor', gamut: 'DragonColor' }
      ],
      [CameraManufacturer.ARRI]: [
        { pattern: 'arr wide gamut 4', gamut: 'ARRI Wide Gamut 4' },
        { pattern: 'arr wide gamut', gamut: 'ARRI Wide Gamut' }
      ],
      [CameraManufacturer.Blackmagic]: [
        { pattern: 'bmdfilm gamut', gamut: 'BMDFilm Gamut' }
      ],
      [CameraManufacturer.DJI]: [
        { pattern: 'd-gamut', gamut: 'D-Gamut' }
      ],
      [CameraManufacturer.Nikon]: [
        { pattern: 'nikon gamut', gamut: 'Nikon Gamut' }
      ],
      [CameraManufacturer.Fujifilm]: [
        { pattern: 'f-gamut', gamut: 'F-Gamut' }
      ]
    }

    const gamutList = gamuts[manufacturer] || []
    for (const { pattern, gamut } of gamutList) {
      if (allText.includes(pattern)) {
        return gamut
      }
    }

    return 'Rec.709'
  }

  private static detectColorDepth(metadata: Record<string, unknown>): ColorDepth {
    const depth = Number(metadata.colorDepth || metadata.BitDepth || 0)
    if (depth === 16) return 16
    if (depth === 12) return 12
    if (depth === 10) return 10
    return 8
  }

  private static detectChromaSubsampling(metadata: Record<string, unknown>): ChromaSubsampling {
    const chroma = String(metadata.chromaSubsampling || '').toLowerCase()
    if (chroma.includes('4:4:4') || chroma === '444') return ChromaSubsampling.YUV444
    if (chroma.includes('4:2:2') || chroma === '422') return ChromaSubsampling.YUV422
    return ChromaSubsampling.YUV420
  }

  private static detectLUTApplied(metadata: Record<string, unknown>): boolean {
    const lutApplied = metadata.lutApplied || metadata.colorLook || metadata.lutName
    return Boolean(lutApplied)
  }
}

export class LUTLibrary {
  private builtInLuts: LUTPreset[] = BUILT_IN_LUTS
  private userLuts: LUTPreset[] = []
  private lutCache: Map<string, LUTData> = new Map()

  constructor(private storagePath: string) {}

  getAllLuts(): LUTPreset[] {
    return [...this.builtInLuts, ...this.userLuts]
  }

  getLutForCamera(manufacturer: CameraManufacturer, logCurve: ColorSpace): LUTPreset | undefined {
    return this.builtInLuts.find(lut =>
      lut.inputColorSpace === logCurve && lut.source === 'built-in'
    )
  }

  async loadLUT(preset: LUTPreset): Promise<LUTData | null> {
    if (this.lutCache.has(preset.id)) {
      return this.lutCache.get(preset.id)!
    }

    try {
      const response = await fetch(preset.filePath)
      const text = await response.text()
      const { parseLUT } = await import('./LUTParser')
      const lutData = parseLUT(preset.fileName, text)
      this.lutCache.set(preset.id, lutData)
      return lutData
    } catch {
      return null
    }
  }

  importLUT(file: File): Promise<LUTPreset> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const content = reader.result as string
        const { parseLUT } = require('./color/LUTParser')
        const lutData = parseLUT(file.name, content)

        const preset: LUTPreset = {
          id: `user_${Date.now()}`,
          name: file.name.replace(/\.[^.]+$/, ''),
          source: 'user',
          inputColorSpace: ColorSpace.Rec709,
          outputColorSpace: ColorSpace.Rec709,
          fileName: file.name,
          filePath: `${this.storagePath}/${file.name}`
        }

        this.userLuts.push(preset)
        this.lutCache.set(preset.id, lutData)
        resolve(preset)
      }
      reader.onerror = () => reject(new Error('Failed to read LUT file'))
      reader.readAsText(file)
    })
  }

  removeLUT(id: string): boolean {
    const index = this.userLuts.findIndex(lut => lut.id === id)
    if (index >= 0) {
      this.userLuts.splice(index, 1)
      this.lutCache.delete(id)
      return true
    }
    return false
  }
}

export class ACEColorPipeline {
  private settings: ACEColorSettings
  private lutLibrary: LUTLibrary

  constructor(settings: ACEColorSettings) {
    this.settings = settings
    this.lutLibrary = new LUTLibrary(settings.lutStoragePath)
  }

  updateSettings(settings: Partial<ACEColorSettings>): void {
    this.settings = { ...this.settings, ...settings }
  }

  getSettings(): ACEColorSettings {
    return { ...this.settings }
  }

  getLUTLibrary(): LUTLibrary {
    return this.lutLibrary
  }

  async processFrame(
    imageData: ImageData,
    cameraProfile: CameraProfile | null
  ): Promise<ImageData> {
    let output = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    )

    if (this.settings.autoRestore && cameraProfile && !cameraProfile.lutApplied) {
      output = await this.applyRestoreLUT(output, cameraProfile)
    }

    if (this.settings.autoUnify) {
      output = this.applyColorUnify(output)
    }

    return output
  }

  private async applyRestoreLUT(
    imageData: ImageData,
    cameraProfile: CameraProfile
  ): Promise<ImageData> {
    const lutPreset = this.lutLibrary.getLutForCamera(
      cameraProfile.manufacturer,
      cameraProfile.logCurve
    )

    if (!lutPreset) return imageData

    const lutData = await this.lutLibrary.loadLUT(lutPreset)
    if (!lutData) return imageData

    const { applyLUT } = await import('./LUTParser')
    return applyLUT(lutData, imageData)
  }

  private applyColorUnify(imageData: ImageData): ImageData {
    const { data, width, height } = imageData
    const output = new Uint8ClampedArray(data)

    const stats = this.computeColorStats(imageData)
    const targetTemp = this.settings.targetTemperature
    const targetTint = this.settings.targetTint
    const targetSat = this.settings.targetSaturation
    const targetContrast = this.settings.targetContrast
    const strength = this.settings.unifyStrength

    const tempDiff = (targetTemp - stats.temperature) / 10000 * strength
    const tintDiff = (targetTint - stats.tint) / 100 * strength
    const satRatio = targetSat / Math.max(stats.saturation, 0.01) * strength + (1 - strength)
    const contrastRatio = targetContrast / Math.max(stats.contrast, 0.01) * strength + (1 - strength)

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] / 255
      let g = data[i + 1] / 255
      let b = data[i + 2] / 255

      r += tempDiff * 0.1
      b -= tempDiff * 0.1
      g += tintDiff * 0.01

      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
      r = luma + (r - luma) * satRatio
      g = luma + (g - luma) * satRatio
      b = luma + (b - luma) * satRatio

      r = (r - 0.5) * contrastRatio + 0.5
      g = (g - 0.5) * contrastRatio + 0.5
      b = (b - 0.5) * contrastRatio + 0.5

      output[i] = Math.round(Math.min(1, Math.max(0, r)) * 255)
      output[i + 1] = Math.round(Math.min(1, Math.max(0, g)) * 255)
      output[i + 2] = Math.round(Math.min(1, Math.max(0, b)) * 255)
    }

    return new ImageData(output, width, height)
  }

  private computeColorStats(imageData: ImageData): ColorStats {
    const { data } = imageData
    let totalR = 0, totalG = 0, totalB = 0
    let totalLuma = 0
    let count = 0

    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i]
      totalG += data[i + 1]
      totalB += data[i + 2]
      totalLuma += 0.2126 * data[i] + 0.7152 * data[i + 1] / 255
      count++
    }

    const avgR = totalR / count / 255
    const avgG = totalG / count / 255
    const avgB = totalB / count / 255
    const avgLuma = totalLuma / count

    const temperature = (avgR - avgB) * 10000 + 6500
    const tint = (avgG - (avgR + avgB) / 2) * 100

    const maxC = Math.max(avgR, avgG, avgB)
    const minC = Math.min(avgR, avgG, avgB)
    const saturation = maxC > 0 ? (maxC - minC) / maxC : 0

    let variance = 0
    for (let i = 0; i < data.length; i += 16) {
      const luma = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
      variance += (luma - avgLuma) ** 2
    }
    const contrast = Math.sqrt(variance / (count / 4))

    return {
      temperature,
      tint,
      saturation,
      luminance: avgLuma,
      contrast,
      dominantHue: Math.atan2(avgG - avgB, avgR - (avgG + avgB) / 2) * 180 / Math.PI
    }
  }

  async applyOneClickACE(): Promise<void> {
    this.settings = {
      ...this.settings,
      autoRestore: true,
      autoUnify: true,
      unifyStrength: 70,
      targetTemperature: 5600,
      targetTint: 0,
      targetSaturation: 100,
      targetContrast: 1.0
    }
  }
}
