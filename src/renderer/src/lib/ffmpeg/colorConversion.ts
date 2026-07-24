export const COLOR_MATRICES: Record<string, number[]> = {
  Rec709: [
    1.0, 1.0, 1.0,
    0.0, -0.344136, 1.772,
    1.402, -0.714136, 0.0
  ],
  Rec2020: [
    1.0, 1.0, 1.0,
    0.0, -0.164553, 1.8814,
    1.4746, -0.571353, 0.0
  ],
  DCIP3: [
    1.0, 1.0, 1.0,
    0.0, -0.2263, 1.6094,
    1.4518, -0.4441, 0.0
  ]
}

export function yuvToRgb(
  y: number, u: number, v: number,
  matrix: number[] = COLOR_MATRICES.Rec709
): [number, number, number] {
  const r = matrix[0] * y + matrix[3] * (u - 0.5) + matrix[6] * (v - 0.5)
  const g = matrix[1] * y + matrix[4] * (u - 0.5) + matrix[7] * (v - 0.5)
  const b = matrix[2] * y + matrix[5] * (u - 0.5) + matrix[8] * (v - 0.5)
  return [clamp(r), clamp(g), clamp(b)]
}

export function rgbToYuv(
  r: number, g: number, b: number,
  matrix: number[] = COLOR_MATRICES.Rec709
): [number, number, number] {
  const inv = invertMatrix3x3(matrix)
  const y = inv[0] * r + inv[3] * g + inv[6] * b
  const u = inv[1] * r + inv[4] * g + inv[7] * b + 0.5
  const v = inv[2] * r + inv[5] * g + inv[8] * b + 0.5
  return [clamp(y), clamp(u), clamp(v)]
}

function invertMatrix3x3(m: number[]): number[] {
  const [a, b, c, d, e, f, g, h, i] = m
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)
  if (Math.abs(det) < 1e-10) return m
  const inv = 1 / det
  return [
    (e * i - f * h) * inv, (c * h - b * i) * inv, (b * f - c * e) * inv,
    (f * g - d * i) * inv, (a * i - c * g) * inv, (c * d - a * f) * inv,
    (d * h - e * g) * inv, (b * g - a * h) * inv, (a * e - b * d) * inv
  ]
}

export function linearToSrgb(value: number): number {
  const v = clamp(value)
  return v <= 0.0031308
    ? v * 12.92
    : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
}

export function srgbToLinear(value: number): number {
  const v = clamp(value)
  return v <= 0.04045
    ? v / 12.92
    : Math.pow((v + 0.055) / 1.055, 2.4)
}

export function linearToGamma(value: number, gamma = 2.4): number {
  return Math.pow(clamp(value), 1 / gamma)
}

export function gammaToLinear(value: number, gamma = 2.4): number {
  return Math.pow(clamp(value), gamma)
}

export function sLog2ToLinear(value: number): number {
  const v = clamp(value)
  if (v >= 171.0 / 255.0) {
    return Math.pow(10, (v * 255 - 392.45) / 86.6) - 0.037584
  }
  return (v * 255 - 95.0) * 0.01125 / (171.0 - 95.0)
}

export function linearToSLog2(value: number): number {
  const v = Math.max(value, 0)
  if (v >= 0.01125) {
    return (86.6 * Math.log10(v + 0.037584) + 392.45) / 255
  }
  return (v * (171.0 - 95.0) / 0.01125 + 95.0) / 255
}

export function sLog3ToLinear(value: number): number {
  const v = clamp(value)
  if (v >= 171.5 / 255.0) {
    return Math.pow(10, (v * 255 + 20.0 - 420.0) / 261.25) * 0.18 + 0.01
  }
  return (v * 255 - 95.0) * (0.18 + 0.01) / 171.5
}

export function linearToSLog3(value: number): number {
  const v = Math.max(value, 0)
  if (v >= 0.01 + 0.01) {
    return (261.25 * Math.log10((v - 0.01) / 0.18) + 420.0 - 20.0) / 255
  }
  return (v * 171.5 / (0.18 + 0.01) + 95.0) / 255
}

export function cLog2ToLinear(value: number): number {
  const v = clamp(value)
  return (Math.pow(10, (v - 0.125) / 0.455) - 0.03625) / (1.0 - 0.03625)
}

export function cLog3ToLinear(value: number): number {
  const v = clamp(value)
  return (Math.pow(10, (v * 255 - 127.5) / 180.0) * 0.125 + 0.07875 - 0.07875) / (1.0 - 0.07875)
}

export function vLogToLinear(value: number): number {
  const v = clamp(value)
  if (v < 0.181) {
    return (v - 0.125) / 6.0
  }
  return Math.pow(10, (v - 0.5982) / 0.2415) - 0.00873
}

export function linearToPQ(value: number): number {
  const m1 = 0.1593017578125
  const m2 = 78.84375
  const c1 = 0.8359375
  const c2 = 18.8515625
  const c3 = 18.6875
  const v = Math.max(value, 0)
  const vPow = Math.pow(v, m1)
  const num = c1 + c2 * vPow
  const den = 1 + c3 * vPow
  return Math.pow(num / den, m2)
}

export function pqToLinear(value: number): number {
  const m1 = 0.1593017578125
  const m2 = 78.84375
  const c1 = 0.8359375
  const c2 = 18.8515625
  const c3 = 18.6875
  const vPow = Math.pow(clamp(value), 1 / m2)
  const num = Math.max(vPow - c1, 0)
  const den = c2 - c3 * vPow
  return Math.pow(num / den, 1 / m1)
}

export function colorTemperatureToRGB(temperature: number): [number, number, number] {
  const t = temperature / 100
  let r: number, g: number, b: number

  if (t <= 66) {
    r = 1
    g = 99.4708025861 * Math.log(t) - 161.1195681661
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592)
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492)
    b = 1
  }

  return [clamp(r / 255), clamp(g / 255), clamp(b / 255)]
}

function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v))
}
