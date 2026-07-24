export type CurveType = 'linear' | 'quadratic' | 'cubic' | 'custom'

export class PressureCurve {
  private type: CurveType
  private customLUT: Float32Array | null = null

  constructor(type: CurveType = 'linear') {
    this.type = type
  }

  setType(type: CurveType): void {
    this.type = type
  }

  setCustomLUT(lut: Float32Array): void {
    this.customLUT = lut
  }

  map(pressure: number): number {
    const p = Math.max(0, Math.min(1, pressure))
    switch (this.type) {
      case 'linear':
        return p
      case 'quadratic':
        return p * p
      case 'cubic':
        return p * p * p
      case 'custom':
        if (this.customLUT) {
          const idx = Math.round(p * (this.customLUT.length - 1))
          return this.customLUT[Math.max(0, Math.min(idx, this.customLUT.length - 1))]
        }
        return p
      default:
        return p
    }
  }
}
