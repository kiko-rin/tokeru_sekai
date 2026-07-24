import type { LUTData, LUTFormat } from '@shared/types'

export function parseCubeLUT(text: string): LUTData {
  const lines = text.split('\n')
  let title = ''
  let size = 0
  let domainMin: [number, number, number] = [0, 0, 0]
  let domainMax: [number, number, number] = [1, 1, 1]
  const data: number[] = []
  let domainFound = false

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    if (line.startsWith('TITLE')) {
      title = line.split('"')[1] || ''
      continue
    }

    if (line.startsWith('LUT_3D_SIZE')) {
      size = parseInt(line.split(/\s+/)[1])
      continue
    }

    if (line.startsWith('DOMAIN_MIN')) {
      const parts = line.split(/\s+/).slice(1).map(Number)
      domainMin = [parts[0], parts[1], parts[2]]
      domainFound = true
      continue
    }

    if (line.startsWith('DOMAIN_MAX')) {
      const parts = line.split(/\s+/).slice(1).map(Number)
      domainMax = [parts[0], parts[1], parts[2]]
      continue
    }

    const values = line.split(/\s+/).map(Number)
    if (values.length === 3 && values.every((v) => !isNaN(v))) {
      data.push(values[0], values[1], values[2])
    }
  }

  if (!size && data.length > 0) {
    const entries = data.length / 3
    size = Math.round(Math.pow(entries, 1 / 3))
  }

  return {
    title,
    format: 'CUBE' as LUTFormat,
    is3D: true,
    size,
    domainMin: domainFound ? domainMin : [0, 0, 0],
    domainMax: domainFound ? domainMax : [1, 1, 1],
    data: new Float32Array(data)
  }
}

export function parse3DLLUT(text: string): LUTData {
  const lines = text.split('\n')
  let size = 0
  const data: number[] = []
  let headerParsed = false

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (!headerParsed) {
      const sizeMatch = line.match(/(\d+)/)
      if (sizeMatch) {
        size = parseInt(sizeMatch[1])
        headerParsed = true
        continue
      }
    }

    const values = line.split(/[\s,]+/).filter(Boolean).map(Number)
    if (values.length >= 3 && values.every((v) => !isNaN(v))) {
      data.push(
        values[0] / 255,
        values[1] / 255,
        values[2] / 255
      )
    }
  }

  return {
    title: '',
    format: 'THREE_DL' as LUTFormat,
    is3D: true,
    size,
    domainMin: [0, 0, 0],
    domainMax: [1, 1, 1],
    data: new Float32Array(data)
  }
}

export function parseCSPLUT(text: string): LUTData {
  const lines = text.split('\n')
  let title = ''
  let size = 0
  const data: number[] = []
  let inData = false

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('Description')) {
      title = line.split('{')[0].replace('Description', '').trim()
      continue
    }

    if (line === '{') {
      inData = true
      continue
    }

    if (line === '}') {
      inData = false
      continue
    }

    if (inData) {
      const values = line.split(/[\s,]+/).filter(Boolean).map(Number)
      if (values.length >= 3 && values.every((v) => !isNaN(v))) {
        data.push(values[0], values[1], values[2])
      }
    }

    if (line.startsWith('FromInput')) {
      const match = line.match(/(\d+)/)
      if (match) size = parseInt(match[1])
    }
  }

  if (!size && data.length > 0) {
    size = Math.round(Math.pow(data.length / 3, 1 / 3))
  }

  return {
    title,
    format: 'CSP' as LUTFormat,
    is3D: true,
    size,
    domainMin: [0, 0, 0],
    domainMax: [1, 1, 1],
    data: new Float32Array(data)
  }
}

export function parseLUT(filename: string, content: string): LUTData {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'cube':
      return parseCubeLUT(content)
    case '3dl':
      return parse3DLLUT(content)
    case 'csp':
      return parseCSPLUT(content)
    default:
      return parseCubeLUT(content)
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v))
}

function tetrahedralInterpolate(
  lut: LUTData,
  r: number, g: number, b: number
): [number, number, number] {
  const { size, data, domainMin, domainMax } = lut

  const nr = (r - domainMin[0]) / (domainMax[0] - domainMin[0]) * (size - 1)
  const ng = (g - domainMin[1]) / (domainMax[1] - domainMin[1]) * (size - 1)
  const nb = (b - domainMin[2]) / (domainMax[2] - domainMin[2]) * (size - 1)

  const r0 = Math.floor(clamp(nr, 0, size - 2))
  const g0 = Math.floor(clamp(ng, 0, size - 2))
  const b0 = Math.floor(clamp(nb, 0, size - 2))

  const r1 = r0 + 1
  const g1 = g0 + 1
  const b1 = b0 + 1

  const fr = nr - r0
  const fg = ng - g0
  const fb = nb - b0

  const idx = (ri: number, gi: number, bi: number) =>
    (bi * size * size + gi * size + ri) * 3

  const c000 = [data[idx(r0, g0, b0)], data[idx(r0, g0, b0) + 1], data[idx(r0, g0, b0) + 2]]
  const c100 = [data[idx(r1, g0, b0)], data[idx(r1, g0, b0) + 1], data[idx(r1, g0, b0) + 2]]
  const c010 = [data[idx(r0, g1, b0)], data[idx(r0, g1, b0) + 1], data[idx(r0, g1, b0) + 2]]
  const c110 = [data[idx(r1, g1, b0)], data[idx(r1, g1, b0) + 1], data[idx(r1, g1, b0) + 2]]
  const c001 = [data[idx(r0, g0, b1)], data[idx(r0, g0, b1) + 1], data[idx(r0, g0, b1) + 2]]
  const c101 = [data[idx(r1, g0, b1)], data[idx(r1, g0, b1) + 1], data[idx(r1, g0, b1) + 2]]
  const c011 = [data[idx(r0, g1, b1)], data[idx(r0, g1, b1) + 1], data[idx(r0, g1, b1) + 2]]
  const c111 = [data[idx(r1, g1, b1)], data[idx(r1, g1, b1) + 1], data[idx(r1, g1, b1) + 2]]

  const result: [number, number, number] = [0, 0, 0]
  for (let ch = 0; ch < 3; ch++) {
    if (fr >= fg && fg >= fb) {
      result[ch] = lerp(
        lerp(lerp(c000[ch], c100[ch], fr), lerp(c010[ch], c110[ch], fr), fg),
        lerp(lerp(c001[ch], c101[ch], fr), lerp(c011[ch], c111[ch], fr), fg),
        fb
      )
    } else if (fg >= fr && fr >= fb) {
      result[ch] = lerp(
        lerp(lerp(c000[ch], c010[ch], fg), lerp(c100[ch], c110[ch], fg), fr),
        lerp(lerp(c001[ch], c011[ch], fg), lerp(c101[ch], c111[ch], fg), fr),
        fb
      )
    } else if (fg >= fb && fb >= fr) {
      result[ch] = lerp(
        lerp(lerp(c000[ch], c010[ch], fg), lerp(c001[ch], c011[ch], fg), fb),
        lerp(lerp(c100[ch], c110[ch], fg), lerp(c101[ch], c111[ch], fg), fb),
        fr
      )
    } else if (fb >= fg && fg >= fr) {
      result[ch] = lerp(
        lerp(lerp(c000[ch], c001[ch], fb), lerp(c010[ch], c011[ch], fb), fg),
        lerp(lerp(c100[ch], c101[ch], fb), lerp(c110[ch], c111[ch], fb), fg),
        fr
      )
    } else if (fb >= fr && fr >= fg) {
      result[ch] = lerp(
        lerp(lerp(c000[ch], c001[ch], fb), lerp(c100[ch], c101[ch], fb), fr),
        lerp(lerp(c010[ch], c011[ch], fb), lerp(c110[ch], c111[ch], fb), fr),
        fg
      )
    } else {
      result[ch] = lerp(
        lerp(lerp(c000[ch], c100[ch], fr), lerp(c001[ch], c101[ch], fr), fb),
        lerp(lerp(c010[ch], c110[ch], fr), lerp(c011[ch], c111[ch], fr), fb),
        fg
      )
    }
  }

  return result
}

export function applyLUT(
  lut: LUTData,
  imageData: ImageData,
  opacity = 1.0
): ImageData {
  const { width, height, data } = imageData
  const output = new Uint8ClampedArray(data)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = data[i] / 255
      const g = data[i + 1] / 255
      const b = data[i + 2] / 255

      const [lr, lg, lb] = tetrahedralInterpolate(lut, r, g, b)

      output[i] = Math.round((r + (lr - r) * opacity) * 255)
      output[i + 1] = Math.round((g + (lg - g) * opacity) * 255)
      output[i + 2] = Math.round((b + (lb - b) * opacity) * 255)
    }
  }

  return new ImageData(output, width, height)
}
