declare namespace spine {
  class Vector2 {
    x: number
    y: number
    constructor(x?: number, y?: number)
  }

  class Matrix4 {
    values: Float32Array
    ortho2d(x: number, y: number, width: number, height: number): void
  }

  class SkeletonData {
    bones: BoneData[]
    slots: SlotData[]
    skins: Skin[]
    animations: Animation[]
    findBone(name: string): BoneData | null
    findSlot(name: string): SlotData | null
    findSkin(name: string): Skin | null
    findAnimation(name: string): Animation | null
  }

  class BoneData {
    name: string
    parent: BoneData | null
    length: number
    x: number
    y: number
    rotation: number
    scaleX: number
    scaleY: number
  }

  class SlotData {
    name: string
    bone: BoneData
    color: number
    attachment: string | null
  }

  class Skin {
    name: string
    attachments: Record<string, Attachment>
    addAttachment(slotIndex: number, name: string, attachment: Attachment): void
    getAttachment(slotIndex: number, name: string): Attachment | null
  }

  class Attachment {
    name: string
    type: AttachmentType
  }

  class RegionAttachment extends Attachment {
    x: number
    y: number
    width: number
    height: number
    rotation: number
    scaleX: number
    scaleY: number
    color: number
    region: TextureRegion
  }

  class MeshAttachment extends Attachment {
    vertices: Float32Array
    uvs: Float32Array
    triangles: number[]
    hullLength: number
    color: number
    region: TextureRegion
  }

  class TextureRegion {
    texture: WebGLTexture
    u: number
    v: number
    u2: number
    v2: number
    width: number
    height: number
    originalWidth: number
    originalHeight: number
    rotates: boolean
  }

  enum AttachmentType {
    Region, Boundingbox, Mesh, Linkedmesh, Path, Point, Clipping
  }

  class Skeleton {
    data: SkeletonData
    bones: Bone[]
    slots: Slot[]
    skin: Skin | null
    color: number
    x: number
    y: number
    scaleX: number
    scaleY: number
    setToSetupPose(): void
    setSkinByName(skinName: string): void
    setSkin(skin: Skin | null): void
    updateWorldTransform(): void
    getBounds(offset: Vector2, size: Vector2, vertices: number[]): void
    findSlot(slotName: string): Slot | null
    findBone(boneName: string): Bone | null
  }

  class Bone {
    data: BoneData
    skeleton: Skeleton
    parent: Bone | null
    x: number
    y: number
    rotation: number
    scaleX: number
    scaleY: number
    worldX: number
    worldY: number
    worldRotation: number
    worldScaleX: number
    worldScaleY: number
  }

  class Slot {
    data: SlotData
    skeleton: Skeleton
    bone: Bone
    color: number
    attachment: Attachment | null
    setAttachment(attachment: Attachment | null): void
    getAttachment(): Attachment | null
  }

  class Animation {
    name: string
    duration: number
    timelines: Timeline[]
    apply(skeleton: Skeleton, lastTime: number, time: number, loop: boolean, events: Event[]): void
  }

  class Timeline {
    getPropertyId(): number
  }

  class Event {
    int: number
    float: number
    stringValue: string
    time: number
    data: EventData
  }

  class EventData {
    name: string
    intValue: number
    floatValue: number
    stringValue: string
  }

  class AnimationStateData {
    skeletonData: SkeletonData
    mix: number
    mixSolid: number
    constructor(skeletonData: SkeletonData)
    setMix(fromName: string, toName: string, duration: number): void
  }

  class AnimationState {
    data: AnimationStateData
    tracks: TrackEntry[]
    timeScale: number
    setAnimation(trackIndex: number, animationName: string, loop: boolean): TrackEntry
    addAnimation(trackIndex: number, animationName: string, loop: boolean, delay: number): TrackEntry
    update(delta: number): void
    apply(skeleton: Skeleton): void
    clearTracks(): void
    clearTrack(trackIndex: number): void
    addListener(listener: AnimationStateListener): void
    removeListener(listener: AnimationStateListener): void
    clearListeners(): void
  }

  interface TrackEntry {
    animation: Animation
    loop: boolean
    mix: number
    mixBlend: MixBlend
    trackTime: number
    animationTime: number
    timeScale: number
  }

  interface AnimationStateListener {
    start?: (entry: TrackEntry) => void
    interrupt?: (entry: TrackEntry) => void
    end?: (entry: TrackEntry) => void
    dispose?: (entry: TrackEntry) => void
    complete?: (entry: TrackEntry) => void
    event?: (entry: TrackEntry, event: Event) => void
  }

  enum MixBlend {
    setup, first, replace, add
  }

  class SkeletonJson {
    constructor(loader: AtlasAttachmentLoader)
    readSkeletonData(json: string): SkeletonData
  }

  class SkeletonBinary {
    constructor(loader: AtlasAttachmentLoader)
    readSkeletonData(binary: Uint8Array): SkeletonData
  }

  class AtlasAttachmentLoader {
    constructor(atlas: TextureAtlas)
  }

  class TextureAtlas {
    pages: TextureAtlasPage[]
    regions: TextureAtlasRegion[]
  }

  class TextureAtlasPage {
    name: string
    width: number
    height: number
    texture: WebGLTexture
  }

  class TextureAtlasRegion extends TextureRegion {
    name: string
    index: number
    x: number
    y: number
    width: number
    height: number
    originalWidth: number
    originalHeight: number
    rotate: boolean
    splits: number[]
    pads: number[]
  }

  namespace webgl {
    class ManagedWebGLRenderingContext {
      gl: WebGLRenderingContext
      constructor(canvas: HTMLCanvasElement, contextAttributes?: WebGLContextAttributes)
    }

    class Shader {
      static SAMPLER: string
      static MVP_MATRIX: string
      static newTwoColoredTextured(context: ManagedWebGLRenderingContext): Shader
      static newColored(context: ManagedWebGLRenderingContext): Shader
      bind(): void
      unbind(): void
      setUniformi(name: string, value: number): void
      setUniform4x4f(name: string, values: Float32Array): void
    }

    class PolygonBatcher {
      constructor(context: ManagedWebGLRenderingContext)
      begin(shader: Shader): void
      draw(triangleVertices: number[], offset: number, count: number, texture: WebGLTexture): void
      end(): void
    }

    class Matrix4 {
      values: Float32Array
      ortho2d(x: number, y: number, width: number, height: number): void
    }

    class SkeletonRenderer {
      premultipliedAlpha: boolean
      constructor(context: ManagedWebGLRenderingContext)
      draw(batcher: PolygonBatcher, skeleton: Skeleton): void
    }

    class SkeletonDebugRenderer {
      drawRegionAttachments: boolean
      drawBoundingBoxes: boolean
      drawMeshHull: boolean
      drawMeshTriangles: boolean
      drawPaths: boolean
      premultipliedAlpha: boolean
      constructor(context: ManagedWebGLRenderingContext)
      draw(shapes: ShapeRenderer, skeleton: Skeleton): void
    }

    class ShapeRenderer {
      constructor(context: ManagedWebGLRenderingContext)
      begin(shader: Shader): void
      end(): void
    }

    class AssetManager {
      constructor(context: ManagedWebGLRenderingContext)
      loadBinary(path: string, success?: (path: string) => void, error?: (path: string, message: string) => void): void
      loadTextureAtlas(path: string, success?: (path: string) => void, error?: (path: string, message: string) => void): void
      get(path: string): any
      isLoadingComplete(path: string): boolean
    }
  }
}
