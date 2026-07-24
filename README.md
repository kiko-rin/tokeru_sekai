# 二维工坊 (Tokeru Sekai)

> 融合媒体制作桌面应用 — 视频编辑、调色、音频混音、手绘、Spine动画一体化

![Electron](https://img.shields.io/badge/Electron-31.7.7-47848F?logo=electron)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-Apache_2.0-blue)

---

## 功能概览

| Tab | 功能 |
|-----|------|
| **大纲** | 项目场景树 + 富文本脚本编辑器 + 素材库 |
| **快编** | 拖拽式故事板 + 过渡效果 + 素材属性调节 |
| **剪辑台** | 五区Grid：素材库 / 实时监看 / 多轨时间线 / 控件面板 / 音频响度 |
| **创绘** | 双模式切换：手绘(图层/笔刷/MR合成) + 人偶(Spine动画) |
| **调色** | WebGL2 GPU加速管线：基础校色 / 曲线 / HSL色轮 / LUT / 示波器 |
| **调音** | 多轨音频 + EQ/压缩器/混响效果器 + 频谱分析 + 响度控制 |
| **发布** | 编码联动 + 预设系统 + 视频/音频/输出全参数 |

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Electron 31 + electron-vite 2.3 |
| 前端 | React 18 + TypeScript 5.5 strict |
| 构建 | Vite 5 + Terser |
| 状态 | Zustand 4.5 (7 stores) |
| 图标 | IconPark (ByteDance) — 2000+ 图标 |
| 调色 | WebGL2 着色器 (custom ColorGrade class) |
| 编解码 | @ffmpeg/ffmpeg 0.12 (WebAssembly) |
| 动画 | Spine 2D runtime 动态加载 |
| 设计 | CSS Custom Properties — 灰阶基底 + 莫代尔点缀 #7a9ec4 |

## 项目结构

```
src/
  main/                 # Electron 主进程
    index.ts            # 窗口管理 + IPC handlers (dialog/fs/project)
  preload/
    index.ts            # contextBridge API
    index.d.ts          # ElectronAPI 类型声明
  shared/
    types.ts            # 共享类型 (20+ enum/interface)
  renderer/
    index.html
    src/
      App.tsx           # 路由
      main.tsx          # React 入口
      styles/           # CSS 设计系统
      components/
        layout/         # TitleBar / TabBar / SideNav
        ui/             # Button / Input / Slider / Toggle / Tag / Panel / Icon
        tabs/           # 7个工作区 + drawing/ puppet/ 子组件
        tabs/drawing/   # 画布 / 工具栏 / 图层面板 / 笔刷 / MR / K帧
        tabs/puppet/    # Spine加载器 / 动画列表 / 皮肤选择
      pages/
        ProjectManager.tsx  # 项目管理 (侧栏/统计/网格)
        ProjectView.tsx     # 项目编辑 (Tab切换/顶栏)
      hooks/            # useTabCollapse / useKeyboardShortcuts / useDragDrop
      stores/           # 7个 Zustand stores
      lib/
        color/          # ColorGrade / Scopes / LUTParser / ColorSpace / ACE Pipeline
        drawing/        # BrushEngine / LayerManager / CanvasEngine / MRComposer / …
        ffmpeg/         # FFmpegService / codecConfig / colorConversion
        input/          # PointerHandler / PressureCurve
        spine/          # SpineRuntime / SpineRenderer / type declarations
```

## 快速开始

```bash
# 安装依赖
npm install

# 确保 ELECTRON_RUN_AS_NODE 未设置 (否则 Electron 以 Node.js 模式运行)
$env:ELECTRON_RUN_AS_NODE = $null   # PowerShell

# 开发模式
npm run dev

# 类型检查
npm run typecheck

# 生产构建
npm run build
```

## 色彩规范

设计语言遵循 **灰阶基底 + 莫代尔点缀** 原则：

- 背景层级：`#141414` → `#1c1c1c` → `#242424` → `#2a2a2a`
- 强调色：`#7a9ec4` (仅用于关键交互，每区域不超过3处)
- 功能色：绿(`#6b9e7a`) / 黄(`#c4a86a`) / 红(`#b47a7a`) — 仅 VU 表
- 轨道色：V1(蓝灰) / V2(绿灰) / V3(紫灰) / A1(暖灰) / A2(冷灰)
- 无阴影、无渐变、无 emoji

## 编解码支持

| 编码 | 编码器 | 色度子采样 | 色深 |
|------|--------|-----------|------|
| AVC (H.264) | libx264 | 420/422/444 | 8/10bit |
| HEVC (H.265) | libx265 | 420/422/444 | 8/10/12/16bit |
| ProRes 422/4444 | prores_ks | 422/444 | 10bit |
| Sony XAVC/X-OCN | — | 422/444 | 10/12/16bit |

## LUT 支持

- 格式：`.cube` / `.3dl` / `.csp`
- 插值：四面体插值 (Tetrahedral)
- 内置 14 个还原 LUT (S-Log2/3, C-Log2/3, V-Log, N-Log, D-Log 等)
- Canon LUT 库 (42 个 .bin 文件)

## 协议

Apache 2.0 — 详见 [LICENSE](LICENSE)
