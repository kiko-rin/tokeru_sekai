declare const spine: any

export interface SpineSkeletonData {
  name: string
  skeleton: any
  animations: string[]
  skins: string[]
}

export class SpineRenderer {
  private canvas: HTMLCanvasElement
  private context: any = null
  private batcher: any = null
  private renderer: any = null
  private skeleton: any = null
  private state: any = null
  private stateData: any = null
  private assetManager: any = null
  private animating = false
  private scale = 1
  private posX = 0
  private posY = 0
  private skeletonData: SpineSkeletonData | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  async loadSkeleton(skelPath: string, atlasPath: string): Promise<SpineSkeletonData> {
    if (!spine || !spine.webgl) {
      throw new Error('Spine runtime not loaded')
    }

    const context = new spine.webgl.ManagedWebGLRenderingContext(this.canvas)
    this.context = context
    this.batcher = new spine.webgl.PolygonBatcher(context)
    this.renderer = new spine.webgl.SkeletonRenderer(context)
    this.assetManager = new spine.webgl.AssetManager(context)

    return new Promise((resolve, reject) => {
      this.assetManager.loadTextureAtlas(atlasPath, (path: string) => {
        try {
          const atlas = this.assetManager.get(atlasPath)
          const atlasLoader = new spine.AtlasAttachmentLoader(atlas)
          const skelJson = new spine.SkeletonJson(atlasLoader)
          const data = this.assetManager.get(skelPath)
          let skeletonData
          if (skelPath.endsWith('.skel')) {
            const binary = new spine.SkeletonBinary(atlasLoader)
            skeletonData = binary.readSkeletonData(data)
          } else {
            const text = new TextDecoder().decode(data)
            skeletonData = skelJson.readSkeletonData(text)
          }

          this.skeleton = new spine.Skeleton(skeletonData)
          this.stateData = new spine.AnimationStateData(skeletonData)
          this.state = new spine.AnimationState(this.stateData)

          const animations: string[] = []
          for (let i = 0; i < skeletonData.animations.length; i++) {
            animations.push(skeletonData.animations[i].name)
          }
          const skins: string[] = []
          for (let i = 0; i < skeletonData.skins.length; i++) {
            skins.push(skeletonData.skins[i].name)
          }

          this.skeletonData = {
            name: skelPath.split('/').pop()?.replace(/\.(skel|json)$/, '') || '',
            skeleton: this.skeleton,
            animations,
            skins
          }

          this.skeleton.setToSetupPose()
          this.skeleton.updateWorldTransform()
          resolve(this.skeletonData)
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  setAnimation(name: string, loop: boolean): void {
    if (!this.state) return
    this.state.clearTracks()
    this.state.setAnimation(0, name, loop)
  }

  addAnimation(name: string, loop: boolean, delay: number): void {
    if (!this.state) return
    this.state.addAnimation(0, name, loop, delay)
  }

  setSkin(name: string): void {
    if (!this.skeleton) return
    this.skeleton.setSkinByName(name)
    this.skeleton.setToSetupPose()
  }

  setScale(scale: number): void {
    this.scale = scale
  }

  setPosition(x: number, y: number): void {
    this.posX = x
    this.posY = y
  }

  play(): void {
    this.animating = true
  }

  pause(): void {
    this.animating = false
  }

  setTimeScale(scale: number): void {
    if (this.state) this.state.timeScale = scale
  }

  update(delta: number): void {
    if (!this.animating || !this.state || !this.skeleton) return
    this.state.update(delta)
    this.state.apply(this.skeleton)
    this.skeleton.updateWorldTransform()
  }

  render(): void {
    if (!this.context || !this.batcher || !this.renderer || !this.skeleton) return
    const gl = this.canvas.getContext('webgl')
    if (!gl) return
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    this.skeleton.x = this.posX
    this.skeleton.y = this.posY
    this.skeleton.scaleX = this.scale
    this.skeleton.scaleY = this.scale

    const shader = spine.webgl.Shader.newTwoColoredTextured(this.context)
    shader.bind()
    shader.setUniformi(spine.webgl.Shader.SAMPLER, 0)
    const projection = new spine.webgl.Matrix4()
    projection.ortho2d(0, 0, this.canvas.width, this.canvas.height)
    shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, projection.values)

    this.batcher.begin(shader)
    this.renderer.draw(this.batcher, this.skeleton)
    this.batcher.end()
    shader.unbind()
  }

  getAnimations(): string[] {
    return this.skeletonData?.animations || []
  }

  getSkins(): string[] {
    return this.skeletonData?.skins || []
  }

  destroy(): void {
    this.animating = false
    this.assetManager = null
    this.state = null
    this.stateData = null
    this.skeleton = null
    this.renderer = null
    this.batcher = null
    this.context = null
    this.skeletonData = null
  }
}
