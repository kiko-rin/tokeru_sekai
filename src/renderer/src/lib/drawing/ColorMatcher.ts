export interface ColorProfile {
  temperature: number
  tint: number
  saturation: number
  luminance: number
  contrast: number
  dominantHue: number
  shadowColor: [number, number, number]
  highlightColor: [number, number, number]
}

export class ColorMatcher {
  analyze(imageData: ImageData): ColorProfile {
    const { data } = imageData
    let totalR = 0, totalG = 0, totalB = 0, totalLuma = 0
    let darkR = 0, darkG = 0, darkB = 0, darkCount = 0
    let brightR = 0, brightG = 0, brightB = 0, brightCount = 0
    const count = data.length / 4

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
      totalR += r; totalG += g; totalB += b; totalLuma += luma

      if (luma < 85) { darkR += r; darkG += g; darkB += b; darkCount++ }
      if (luma > 170) { brightR += r; brightG += g; brightB += b; brightCount++ }
    }

    const avgR = totalR / count, avgG = totalG / count, avgB = totalB / count
    const avgLuma = totalLuma / count
    const maxC = Math.max(avgR, avgG, avgB)
    const minC = Math.min(avgR, avgG, avgB)

    let variance = 0
    for (let i = 0; i < data.length; i += 16) {
      const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
      variance += (luma - avgLuma) ** 2
    }

    return {
      temperature: (avgR / Math.max(avgB, 1) - 1) * 10000 + 6500,
      tint: (avgG - (avgR + avgB) / 2) / 255 * 100,
      saturation: maxC > 0 ? (maxC - minC) / maxC : 0,
      luminance: avgLuma / 255,
      contrast: Math.sqrt(variance / (count / 4)) / 255,
      dominantHue: Math.atan2(avgG - avgB, avgR - (avgG + avgB) / 2) * 180 / Math.PI,
      shadowColor: darkCount > 0 ? [darkR/darkCount/255, darkG/darkCount/255, darkB/darkCount/255] : [0,0,0],
      highlightColor: brightCount > 0 ? [brightR/brightCount/255, brightG/brightCount/255, brightB/brightCount/255] : [1,1,1]
    }
  }

  generate3DLUT(profile: ColorProfile, size: number = 5): Float32Array {
    const total = size * size * size * 3
    const lut = new Float32Array(total)

    for (let b = 0; b < size; b++) {
      for (let g = 0; g < size; g++) {
        for (let r = 0; r < size; r++) {
          const idx = (b * size * size + g * size + r) * 3
          const nr = r / (size - 1), ng = g / (size - 1), nb = b / (size - 1)
          const luma = 0.2126 * nr + 0.7152 * ng + 0.0722 * nb

          lut[idx] = nr + (profile.temperature - 6500) / 10000 * 0.05
          lut[idx + 1] = ng + profile.tint / 100 * 0.05
          lut[idx + 2] = nb - (profile.temperature - 6500) / 10000 * 0.05
        }
      }
    }

    return lut
  }

  matchColor(foreground: ImageData, profile: ColorProfile, strength: number): ImageData {
    const { data, width, height } = foreground
    const output = new Uint8ClampedArray(data)

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b

      if (luma > 0.7) {
        r += (profile.highlightColor[0] - r) * strength
        g += (profile.highlightColor[1] - g) * strength
        b += (profile.highlightColor[2] - b) * strength
      } else if (luma < 0.3) {
        r += (profile.shadowColor[0] - r) * strength
        g += (profile.shadowColor[1] - g) * strength
        b += (profile.shadowColor[2] - b) * strength
      }

      output[i] = Math.round(Math.min(1, Math.max(0, r)) * 255)
      output[i + 1] = Math.round(Math.min(1, Math.max(0, g)) * 255)
      output[i + 2] = Math.round(Math.min(1, Math.max(0, b)) * 255)
    }

    return new ImageData(output, width, height)
  }
}
