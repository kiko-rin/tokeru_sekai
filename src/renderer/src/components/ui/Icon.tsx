import * as Icons from '@icon-park/react'
import type { IIconProps } from '@icon-park/react/lib/runtime'

export type IconName =
  | 'back' | 'home' | 'folder' | 'settings' | 'help'
  | 'close' | 'minimize' | 'maximize' | 'restore'
  | 'prev' | 'prev-frame' | 'play' | 'pause' | 'next' | 'next-frame'
  | 'record'
  | 'undo' | 'redo' | 'save' | 'export' | 'screenshot'
  | 'magnet' | 'cut' | 'razor'
  | 'move' | 'zoom' | 'zoom-in' | 'zoom-out'
  | 'text' | 'pen'
  | 'fill' | 'gradient' | 'eraser' | 'brush' | 'pencil'
  | 'new' | 'delete' | 'copy' | 'merge' | 'lock' | 'unlock' | 'eye' | 'eye-off'
  | 'layer' | 'group'
  | 'toolbox' | 'palette' | 'trash' | 'download' | 'upload' | 'search'
  | 'chevron-down' | 'chevron-up' | 'chevron-left' | 'chevron-right'
  | 'plus' | 'minus' | 'check' | 'close-small'
  | 'note' | 'audio' | 'video' | 'image' | 'file'
  | 'time' | 'clock' | 'marker' | 'marker-in' | 'marker-out'
  | 'fullscreen' | 'split'
  | 'volume' | 'mute' | 'solo' | 'speaker'
  | 'tag' | 'link' | 'info' | 'user' | 'list' | 'flag'

const IconMap: Record<string, React.ComponentType<IIconProps>> = {
  play: Icons.PlayOne,
  pause: Icons.PauseOne,
  'prev-step': Icons.ToBottom,
  'prev-frame': Icons.ToBottom,
  'next-step': Icons.ToTop,
  'next-frame': Icons.ToTop,
  prev: Icons.LeftC,
  next: Icons.RightC,
  back: Icons.ArrowLeft,
  save: Icons.Save,
  undo: Icons.Undo,
  redo: Icons.Redo,
  export: Icons.Export,
  screenshot: Icons.ScreenshotOne,
  settings: Icons.Setting,
  help: Icons.Help,
  close: Icons.Close,
  minimize: Icons.Minus,
  maximize: Icons.FullScreenPlay,
  restore: Icons.OffScreen,
  home: Icons.Home,
  folder: Icons.Folder,
  delete: Icons.Delete,
  copy: Icons.Copy,
  lock: Icons.Lock,
  unlock: Icons.Unlock,
  eye: Icons.Eyes,
  'eye-off': Icons.Eyes,
  search: Icons.Search,
  'chevron-down': Icons.Down,
  'chevron-up': Icons.Up,
  'chevron-left': Icons.Left,
  'chevron-right': Icons.Right,
  plus: Icons.Add,
  minus: Icons.Minus,
  check: Icons.Check,
  download: Icons.Download,
  upload: Icons.Upload,
  file: Icons.FileText,
  image: Icons.Pic,
  video: Icons.VideoFile,
  audio: Icons.Music,
  note: Icons.Music,
  move: Icons.Move,
  zoom: Icons.Zoom,
  'zoom-in': Icons.ZoomIn,
  'zoom-out': Icons.ZoomOut,
  text: Icons.Text,
  pen: Icons.ElectronicPen,
  crop: Icons.Fullwidth,
  fill: Icons.Fill,
  gradient: Icons.Fullwidth,
  eraser: Icons.Erase,
  brush: Icons.FormatBrush,
  pencil: Icons.Pencil,
  razor: Icons.Scissors,
  cut: Icons.Scissors,
  merge: Icons.Merge,
  tag: Icons.Tag,
  link: Icons.Link,
  info: Icons.Info,
  user: Icons.User,
  volume: Icons.VolumeNotice,
  mute: Icons.VolumeMute,
  solo: Icons.Speaker,
  speaker: Icons.SpeakerOne,
  marker: Icons.Flag,
  'marker-in': Icons.Flag,
  'marker-out': Icons.Flag,
  layer: Icons.Layers,
  group: Icons.Group,
  clock: Icons.AlarmClock,
  time: Icons.Time,
  record: Icons.VideoOne,
  magnet: Icons.Magnet,
  split: Icons.Split,
  fullscreen: Icons.FullScreenPlay,
  trash: Icons.RecycleBin,
  list: Icons.ViewList,
  flag: Icons.Flag,
  new: Icons.Add,
  toolbox: Icons.Toolkit,
  palette: Icons.Platte,
  'close-small': Icons.CloseSmall,
}

interface IconProps {
  name: IconName
  size?: number | string
  color?: string
  onClick?: () => void
  style?: React.CSSProperties
}

export function Icon({ name, size = 16, color = 'currentColor', onClick, style }: IconProps) {
  const Comp = IconMap[name]
  if (!Comp) {
    return <span style={{ fontSize: size as number, color, cursor: onClick ? 'pointer' : undefined, ...style }}>?</span>
  }
  return (
    <Comp
      size={size}
      fill={color}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, display: 'inline-flex', ...style }}
      strokeWidth={4}
    />
  )
}
