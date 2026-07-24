export interface ColorSpaceDefinition {
  name: string
  whitePoint: [number, number]
  primaries: [[number, number], [number, number], [number, number], [number, number]]
  transferFunction: (v: number) => number
  inverseTransferFunction: (v: number) => number
}

export const COLOR_SPACES: Record<string, ColorSpaceDefinition> = {
  Rec709: {
    name: 'Rec. 709',
    whitePoint: [0.3127, 0.3290],
    primaries: [
      [0.64, 0.33],
      [0.30, 0.60],
      [0.15, 0.06],
      [0.3127, 0.3290]
    ],
    transferFunction: (v: number) => v <= 0.018
      ? v * 4.5
      : 1.099 * Math.pow(v, 0.45) - 0.099,
    inverseTransferFunction: (v: number) => v <= 0.081
      ? v / 4.5
      : Math.pow((v + 0.099) / 1.099, 1 / 0.45)
  },
  Rec2020: {
    name: 'Rec. 2020',
    whitePoint: [0.3127, 0.3290],
    primaries: [
      [0.708, 0.292],
      [0.170, 0.797],
      [0.131, 0.046],
      [0.3127, 0.3290]
    ],
    transferFunction: (v: number) => v <= 0.018
      ? v * 4.5
      : 1.099 * Math.pow(v, 0.45) - 0.099,
    inverseTransferFunction: (v: number) => v <= 0.081
      ? v / 4.5
      : Math.pow((v + 0.099) / 1.099, 1 / 0.45)
  },
  DCIP3: {
    name: 'DCI-P3',
    whitePoint: [0.314, 0.351],
    primaries: [
      [0.74, 0.27],
      [0.22, 0.78],
      [0.14, 0.05],
      [0.314, 0.351]
    ],
    transferFunction: (v: number) => Math.pow(v, 1 / 2.6),
    inverseTransferFunction: (v: number) => Math.pow(v, 2.6)
  }
}

export function deltaE2000(
  lab1: [number, number, number],
  lab2: [number, number, number]
): number {
  const [L1, a1, b1] = lab1
  const [L2, a2, b2] = lab2

  const kL = 1
  const kC = 1
  const kH = 1
  const SL = 1
  const SC = 1
  const SH = 1

  const C1 = Math.sqrt(a1 * a1 + b1 * b1)
  const C2 = Math.sqrt(a2 * a2 + b2 * b2)
  const Cab = (C1 + C2) / 2
  const Cab7 = Math.pow(Cab, 7)
  const G = 0.5 * (1 - Math.sqrt(Cab7 / (Cab7 + Math.pow(25, 7))))

  const a1p = a1 * (1 + G)
  const a2p = a2 * (1 + G)

  const C1p = Math.sqrt(a1p * a1p + b1 * b1)
  const C2p = Math.sqrt(a2p * a2p + b2 * b2)

  const h1p = Math.atan2(b1, a1p) * 180 / Math.PI
  const h2p = Math.atan2(b2, a2p) * 180 / Math.PI

  const dLp = L2 - L1
  const dCp = C2p - C1p

  let dhp: number
  if (C1p * C2p === 0) {
    dhp = 0
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360
  } else {
    dhp = h2p - h1p + 360
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * Math.PI / 360)

  const Lp = (L1 + L2) / 2
  const Cp = (C1p + C2p) / 2

  let Hp: number
  if (C1p * C2p === 0) {
    Hp = h1p + h2p
  } else if (Math.abs(h1p - h2p) <= 180) {
    Hp = (h1p + h2p) / 2
  } else if (h1p + h2p < 360) {
    Hp = (h1p + h2p + 360) / 2
  } else {
    Hp = (h1p + h2p - 360) / 2
  }

  const T = 1
    - 0.17 * Math.cos((Hp - 30) * Math.PI / 180)
    + 0.24 * Math.cos(2 * Hp * Math.PI / 180)
    + 0.32 * Math.cos((3 * Hp + 6) * Math.PI / 180)
    - 0.20 * Math.cos((4 * Hp - 63) * Math.PI / 180)

  const SLp = 1 + 0.015 * Math.pow(Lp - 50, 2) / Math.sqrt(20 + Math.pow(Lp - 50, 2))
  const SCp = 1 + 0.045 * Cp
  const SHp = 1 + 0.015 * Cp * T

  const Cp7 = Math.pow(Cp, 7)
  const RT = -2 * Math.sqrt(Cp7 / (Cp7 + Math.pow(25, 7)))
    * Math.sin(60 * Math.exp(-Math.pow((Hp - 275) / 25, 2)) * Math.PI / 180)

  return Math.sqrt(
    Math.pow(dLp / (kL * SLp), 2)
    + Math.pow(dCp / (kC * SCp), 2)
    + Math.pow(dHp / (kH * SHp), 2)
    + RT * (dCp / (kC * SCp)) * (dHp / (kH * SHp))
  )
}

export function rgbToLab(
  r: number, g: number, b: number,
  gammaCorrect = true
): [number, number, number] {
  let lr = gammaCorrect ? srgbToLinear(r) : r
  let lg = gammaCorrect ? srgbToLinear(g) : g
  let lb = gammaCorrect ? srgbToLinear(b) : b

  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb
  const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb

  const xn = 0.95047
  const yn = 1.0
  const zn = 1.08883

  const f = (t: number) => t > 0.008856
    ? Math.pow(t, 1 / 3)
    : 7.787 * t + 16 / 116

  const L = 116 * f(y / yn) - 16
  const a = 500 * (f(x / xn) - f(y / yn))
  const bVal = 200 * (f(y / yn) - f(z / zn))

  return [L, a, bVal]
}

function srgbToLinear(v: number): number {
  return v <= 0.04045
    ? v / 12.92
    : Math.pow((v + 0.055) / 1.055, 2.4)
}
