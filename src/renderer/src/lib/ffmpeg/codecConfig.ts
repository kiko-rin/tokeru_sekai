import { VideoCodec, ChromaSubsampling, ColorDepth, PixelFormat } from '@shared/types'

export interface CodecProfile {
  name: string
  ffmpegCodec: string
  profiles: string[]
  pixelFormats: PixelFormat[]
  bitDepths: ColorDepth[]
  defaultParams: Record<string, string>
  decodeOnly?: boolean
}

export const CODEC_CONFIG: Record<VideoCodec, CodecProfile> = {
  [VideoCodec.AVC]: {
    name: 'H.264 / AVC',
    ffmpegCodec: 'libx264',
    profiles: ['baseline', 'main', 'high', 'high10', 'high422', 'high444'],
    pixelFormats: [
      PixelFormat.YUV420P,
      PixelFormat.YUV422P,
      PixelFormat.YUV444P
    ],
    bitDepths: [8, 10],
    defaultParams: {
      preset: 'medium',
      tune: 'film',
      'x264-params': 'keyint=250:min-keyint=25'
    }
  },
  [VideoCodec.HEVC]: {
    name: 'H.265 / HEVC',
    ffmpegCodec: 'libx265',
    profiles: ['main', 'main10', 'main12', 'main422', 'main422-10', 'main444', 'main444-10', 'main444-16'],
    pixelFormats: [
      PixelFormat.YUV420P,
      PixelFormat.YUV420P10LE,
      PixelFormat.YUV420P12LE,
      PixelFormat.YUV422P,
      PixelFormat.YUV422P10LE,
      PixelFormat.YUV422P12LE,
      PixelFormat.YUV444P,
      PixelFormat.YUV444P10LE,
      PixelFormat.YUV444P12LE,
      PixelFormat.YUV444P16LE
    ],
    bitDepths: [8, 10, 12, 16],
    defaultParams: {
      preset: 'medium',
      'x265-params': 'keyint=250:min-keyint=25'
    }
  },
  [VideoCodec.XDCAM_422]: {
    name: 'Sony XDCAM 422',
    ffmpegCodec: 'mpeg2video',
    profiles: ['xdcam_422'],
    pixelFormats: [PixelFormat.YUV422P],
    bitDepths: [8],
    defaultParams: {
      b: '35000k',
      maxrate: '35000k',
      bufsize: '70000k'
    }
  },
  [VideoCodec.XDCAM_444]: {
    name: 'Sony XDCAM 444',
    ffmpegCodec: 'mpeg2video',
    profiles: ['xdcam_444'],
    pixelFormats: [PixelFormat.YUV444P],
    bitDepths: [8],
    defaultParams: {
      b: '44000k',
      maxrate: '44000k',
      bufsize: '88000k'
    }
  },
  [VideoCodec.XAVC_I]: {
    name: 'Sony XAVC Intra',
    ffmpegCodec: 'mpeg4',
    profiles: ['high422'],
    pixelFormats: [PixelFormat.YUV422P10LE],
    bitDepths: [10],
    defaultParams: {
      coder: '1',
      context: '1',
      g: '1',
      bf: '0'
    }
  },
  [VideoCodec.XAVC_L]: {
    name: 'Sony XAVC Long GOP',
    ffmpegCodec: 'libx265',
    profiles: ['main10', 'main422-10'],
    pixelFormats: [
      PixelFormat.YUV420P10LE,
      PixelFormat.YUV422P10LE
    ],
    bitDepths: [10],
    defaultParams: {
      preset: 'slow',
      tune: 'grain'
    }
  },
  [VideoCodec.PRORES_422]: {
    name: 'Apple ProRes 422',
    ffmpegCodec: 'prores_ks',
    profiles: ['proxy', 'lt', 'standard', 'hq'],
    pixelFormats: [PixelFormat.YUV422P10LE],
    bitDepths: [10],
    defaultParams: {}
  },
  [VideoCodec.PRORES_4444]: {
    name: 'Apple ProRes 4444',
    ffmpegCodec: 'prores_ks',
    profiles: ['4444', '4444xq'],
    pixelFormats: [
      PixelFormat.YUV444P10LE,
      PixelFormat.YUVA444P10LE
    ],
    bitDepths: [10],
    defaultParams: {}
  },
  [VideoCodec.XOCN]: {
    name: 'Sony X-OCN',
    ffmpegCodec: 'copy',
    profiles: ['XT', 'ST', 'LT'],
    pixelFormats: [
      PixelFormat.YUV444P12LE,
      PixelFormat.YUV422P12LE,
      PixelFormat.RGB48LE,
      PixelFormat.RGBAF16
    ],
    bitDepths: [12, 16],
    defaultParams: {},
    decodeOnly: true
  }
}

export function getPixelFormat(
  codec: VideoCodec,
  chromaSubsampling: ChromaSubsampling,
  colorDepth: ColorDepth
): string {
  const config = CODEC_CONFIG[codec]
  const depthSuffix = colorDepth > 8 ? `${colorDepth}` : ''
  const chromaMap: Record<string, string> = {
    [ChromaSubsampling.YUV420]: '420',
    [ChromaSubsampling.YUV422]: '422',
    [ChromaSubsampling.YUV444]: '444'
  }
  const chroma = chromaMap[chromaSubsampling]
  const planar = colorDepth <= 8 ? 'p' : `p${colorDepth}le`
  const pf = `yuv${chroma}${planar}` as string
  return config.pixelFormats.includes(pf as PixelFormat) ? pf : config.pixelFormats[0]
}

export function getFFmpegArgs(
  codec: VideoCodec,
  options: {
    pixelFormat: string
    width: number
    height: number
    fps: number
    bitrate?: string
    crf?: number
    extraParams?: Record<string, string>
  }
): string[] {
  const config = CODEC_CONFIG[codec]
  const args: string[] = [
    '-c:v', config.ffmpegCodec,
    '-s', `${options.width}x${options.height}`,
    '-r', `${options.fps}`,
    '-pix_fmt', options.pixelFormat
  ]

  if (options.crf !== undefined) {
    args.push('-crf', String(options.crf))
  } else if (options.bitrate) {
    args.push('-b:v', options.bitrate)
  }

  const params = { ...config.defaultParams, ...options.extraParams }
  for (const [key, value] of Object.entries(params)) {
    args.push(`-${key}`, value)
  }

  return args
}
