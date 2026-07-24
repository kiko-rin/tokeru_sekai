export interface AIModel {
  name: string
  loaded: boolean
  size: number
  backend: 'onnx-wasm' | 'webgl' | 'webgpu'
  status: 'idle' | 'loading' | 'running'
}

export interface AIModelManager {
  models: Map<string, AIModel>
  loadModel: (name: string) => Promise<void>
  unloadModel: (name: string) => void
  inference: (modelName: string, input: ImageData) => Promise<ImageData>
}

export class AIComposer {
  private models: Map<string, AIModel> = new Map()

  constructor() {
    this.models.set('midas', {
      name: 'MiDaS v2.1', loaded: false, size: 40,
      backend: 'onnx-wasm', status: 'idle'
    })
    this.models.set('rmbg', {
      name: 'RMBG-1.4', loaded: false, size: 170,
      backend: 'onnx-wasm', status: 'idle'
    })
    this.models.set('fastnerf', {
      name: 'FastNERF', loaded: false, size: 30,
      backend: 'onnx-wasm', status: 'idle'
    })
  }

  getModels(): AIModel[] {
    return Array.from(this.models.values())
  }

  async loadModel(name: string): Promise<void> {
    const model = this.models.get(name)
    if (!model || model.loaded) return
    model.status = 'loading'
    await new Promise(resolve => setTimeout(resolve, 100))
    model.loaded = true
    model.status = 'idle'
  }

  unloadModel(name: string): void {
    const model = this.models.get(name)
    if (!model) return
    model.loaded = false
    model.status = 'idle'
  }

  async depthEstimate(input: ImageData): Promise<ImageData> {
    const output = new ImageData(new Uint8ClampedArray(input.data), input.width, input.height)
    return output
  }

  async segmentForeground(input: ImageData): Promise<ImageData> {
    const output = new ImageData(new Uint8ClampedArray(input.data), input.width, input.height)
    return output
  }

  async estimateLighting(input: ImageData): Promise<ImageData> {
    return new ImageData(new Uint8ClampedArray(input.data), input.width, input.height)
  }
}
