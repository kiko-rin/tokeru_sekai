export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic'

export interface Keyframe {
  id: string
  time: number
  layerId: string
  properties: Record<string, number>
  easing: EasingType
}

function applyEasing(t: number, easing: EasingType): number {
  switch (easing) {
    case 'linear':
      return t
    case 'ease-in':
      return t * t
    case 'ease-out':
      return t * (2 - t)
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    case 'bounce': {
      const n1 = 7.5625
      const d1 = 2.75
      if (t < 1 / d1) return n1 * t * t
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
    case 'elastic': {
      const c4 = (2 * Math.PI) / 3
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
    }
  }
}

export class KeyframeEngine {
  private keyframes: Keyframe[] = []

  addKeyframe(kf: Keyframe): void {
    this.keyframes.push(kf)
    this.keyframes.sort((a, b) => a.time - b.time)
  }

  removeKeyframe(id: string): void {
    this.keyframes = this.keyframes.filter((k) => k.id !== id)
  }

  getKeyframes(layerId: string): Keyframe[] {
    return this.keyframes.filter((k) => k.layerId === layerId)
  }

  getAllKeyframes(): Keyframe[] {
    return [...this.keyframes]
  }

  interpolate(time: number, layerId: string): Record<string, number> {
    const layerKfs = this.getKeyframes(layerId).filter((k) => k.time <= time)
    const nextKfs = this.getKeyframes(layerId).filter((k) => k.time > time)
    const prev = layerKfs[layerKfs.length - 1]
    const next = nextKfs[0]
    const result: Record<string, number> = {}

    if (!prev) return result
    if (!next) return { ...prev.properties }

    const duration = next.time - prev.time
    const elapsed = time - prev.time
    const t = duration > 0 ? applyEasing(elapsed / duration, next.easing) : 0

    for (const key of Object.keys(prev.properties)) {
      const pv = prev.properties[key]
      const nv = next.properties[key] ?? pv
      result[key] = pv + (nv - pv) * t
    }

    return result
  }
}
