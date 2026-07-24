export interface LightDirection {
  azimuth: number
  elevation: number
  intensity: number
  colorTemp: number
}

export interface LightMatchParams {
  enableAutoMatch: boolean
  sourceBrightness: number
  targetBrightness: number
  contrastRatio: number
  shadowDensity: number
  highlightRoll: number
}

export class LightMatcher {
  detectDirection(imageData: ImageData): LightDirection {
    const { data, width, height } = imageData
    let totalLuma = 0
    let topLuma = 0, bottomLuma = 0, leftLuma = 0, rightLuma = 0
    let count = 0

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
        totalLuma += luma

        if (y < height / 2) topLuma += luma
        else bottomLuma += luma
        if (x < width / 2) leftLuma += luma
        else rightLuma += luma

        count++
      }
    }

    const avg = totalLuma / count
    const topAvg = topLuma / (count / 2)
    const bottomAvg = bottomLuma / (count / 2)
    const leftAvg = leftLuma / (count / 2)
    const rightAvg = rightLuma / (count / 2)

    const azimuth = Math.atan2(leftAvg - rightAvg, topAvg - bottomAvg) * 180 / Math.PI
    const elevation = Math.abs(topAvg - bottomAvg) / (avg + 0.001) * 45

    return {
      azimuth: Math.round(azimuth),
      elevation: Math.min(90, Math.round(elevation)),
      intensity: avg / 255,
      colorTemp: 5600
    }
  }

  matchBrightness(
    foreground: ImageData,
    targetBrightness: number,
    params: LightMatchParams
  ): ImageData {
    const { data, width, height } = foreground
    const output = new Uint8ClampedArray(data)

    let currentBrightness = 0
    for (let i = 0; i < data.length; i += 4) {
      currentBrightness += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    }
    currentBrightness /= (data.length / 4)

    const ratio = targetBrightness / Math.max(currentBrightness / 255, 0.01)
    const strength = params.enableAutoMatch ? params.contrastRatio : 1

    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        const v = data[i + j] / 255 * ratio
        output[i + j] = Math.round(Math.min(255, Math.max(0, v * strength * 255)))
      }
    }

    return new ImageData(output, width, height)
  }

  generateShadow(
    foreground: ImageData,
    direction: LightDirection,
    distance: number,
    blur: number,
    opacity: number
  ): ImageData {
    const { width, height } = foreground
    const output = new ImageData(new Uint8ClampedArray(foreground.data), width, height)
    return output
  }
}
