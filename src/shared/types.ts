export enum VideoCodec {
  AVC = 'AVC',
  HEVC = 'HEVC',
  XDCAM_422 = 'XDCAM_422',
  XDCAM_444 = 'XDCAM_444',
  XAVC_I = 'XAVC_I',
  XAVC_L = 'XAVC_L',
  XOCN = 'X-OCN',
  PRORES_422 = 'ProRes_422',
  PRORES_4444 = 'ProRes_4444'
}

export enum ChromaSubsampling {
  YUV420 = '420',
  YUV422 = '422',
  YUV444 = '444'
}

export type ColorDepth = 8 | 10 | 12 | 16

export enum PixelFormat {
  YUV420P = 'yuv420p',
  YUV420P10LE = 'yuv420p10le',
  YUV420P12LE = 'yuv420p12le',
  YUV422P = 'yuv422p',
  YUV422P10LE = 'yuv422p10le',
  YUV422P12LE = 'yuv422p12le',
  YUV444P = 'yuv444p',
  YUV444P10LE = 'yuv444p10le',
  YUV444P12LE = 'yuv444p12le',
  YUV444P16LE = 'yuv444p16le',
  YUVA444P10LE = 'yuva444p10le',
  RGB24 = 'rgb24',
  RGBA = 'rgba',
  RGB48LE = 'rgb48le',
  RGBAF16 = 'rgbaf16'
}

export enum ColorSpace {
  Rec709 = 'Rec709',
  Rec2020 = 'Rec2020',
  DCIP3 = 'DCI-P3',
  SLog2 = 'SLog2',
  SLog3 = 'SLog3',
  CLog = 'CLog',
  CLog2 = 'CLog2',
  CLog3 = 'CLog3',
  VLog = 'VLog',
  VLogL = 'VLogL',
  Log3G10 = 'Log3G10',
  Log3G12 = 'Log3G12',
  LogC = 'LogC',
  LogC3 = 'LogC3',
  LogC4 = 'LogC4',
  DLog = 'DLog',
  NLog = 'NLog',
  FLog = 'FLog',
  FLog2 = 'FLog2',
  HLG = 'HLG',
  BMDFilm = 'BMDFilm'
}

export enum CameraManufacturer {
  Sony = 'Sony',
  Canon = 'Canon',
  Panasonic = 'Panasonic',
  RED = 'RED',
  ARRI = 'ARRI',
  Blackmagic = 'Blackmagic',
  DJI = 'DJI',
  Nikon = 'Nikon',
  Fujifilm = 'Fujifilm'
}

export interface CameraProfile {
  manufacturer: CameraManufacturer
  logCurve: ColorSpace
  colorGamut: string
  colorDepth: ColorDepth
  chromaSubsampling: ChromaSubsampling
  lutApplied: boolean
  lutName?: string
}

export interface LUTPreset {
  id: string
  name: string
  source: 'built-in' | 'user'
  inputColorSpace: ColorSpace
  outputColorSpace: ColorSpace
  fileName: string
  filePath: string
}

export interface ACEColorSettings {
  autoRestore: boolean
  restoreLUTLibrary: 'built-in' | 'user'
  defaultRestoreLUT: string
  forceOverwrite: boolean
  autoUnify: boolean
  unifyStrength: number
  targetTemperature: number
  targetTint: number
  targetSaturation: number
  targetContrast: number
  lutStoragePath: string
}

export enum LUTFormat {
  CUBE = 'CUBE',
  THREE_DL = '3DL',
  CSP = 'CSP'
}

export enum ScopeType {
  Vectorscope = 'Vectorscope',
  WaveformLuma = 'WaveformLuma',
  WaveformRGB = 'WaveformRGB',
  Histogram = 'Histogram'
}

export interface TranscodeOptions {
  codec: VideoCodec
  chromaSubsampling: ChromaSubsampling
  colorDepth: ColorDepth
  width: number
  height: number
  fps: number
  bitrate?: number
  crf?: number
  preset?: string
  pixelFormat: string
  colorSpace: ColorSpace
}

export interface LUTData {
  title: string
  format: LUTFormat
  is3D: boolean
  size: number
  domainMin: [number, number, number]
  domainMax: [number, number, number]
  data: Float32Array
}

export interface ColorGradeParams {
  exposure: number
  contrast: number
  highlights: number
  shadows: number
  whites: number
  blacks: number
  temperature: number
  tint: number
  saturation: number
  vibrance: number
  lift: { r: number; g: number; b: number }
  gamma: { r: number; g: number; b: number }
  gain: { r: number; g: number; b: number }
  lutEnabled: boolean
  lutOpacity: number
}

export interface Clip {
  id: string
  name: string
  filePath: string
  duration: number
  width: number
  height: number
  fps: number
  codec: VideoCodec
  colorSpace: ColorSpace
  colorDepth: ColorDepth
  chromaSubsampling: ChromaSubsampling
  cameraProfile?: CameraProfile
  thumbnailPath?: string
  proxyPath?: string
}

export interface Track {
  id: string
  name: string
  type: 'video' | 'audio' | 'subtitle'
  clips: Clip[]
  muted: boolean
  locked: boolean
  volume?: number
}

export interface TimelineState {
  tracks: Track[]
  currentTime: number
  inPoint: number
  outPoint: number
  zoom: number
  playing: boolean
}

export interface ProjectSettings {
  id: string
  name: string
  width: number
  height: number
  fps: number
  colorSpace: ColorSpace
  colorDepth: ColorDepth
  chromaSubsampling: ChromaSubsampling
  aceSettings: ACEColorSettings
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  type: string
  thumbnail?: string
  settings: ProjectSettings
  createdAt: string
  updatedAt: string
}
