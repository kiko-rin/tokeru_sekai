# 二维工坊 — 开发规范

## 项目概述

Electron + Vite + React + TypeScript 桌面应用，融合媒体制作工具。
支持视频编辑、调色、音频混音、发布等7个工作区Tab。

## 技术栈

- Electron (主进程) + electron-vite
- React 18 + TypeScript (strict mode)
- Vite 5 构建渲染进程
- WebGL2 调色/示波器GPU加速
- @ffmpeg/ffmpeg 视频编解码
- Zustand 状态管理
- CSS Custom Properties 设计系统 (无CSS-in-JS)

## 项目结构

```
src/
  main/                 # Electron 主进程
    index.ts            # 主入口，窗口管理，IPC处理
  preload/              # 预加载脚本 (contextBridge)
    index.ts
    index.d.ts
  shared/               # 主进程与渲染进程共享类型
    types.ts
  renderer/
    index.html          # 渲染进程入口HTML
    src/
      main.tsx          # React入口
      App.tsx           # 根组件 (路由)
      styles/
        design-tokens.css   # CSS变量定义
        global.css          # 全局样式重置
      components/
        layout/         # 布局组件
          TitleBar.tsx       # 自定义标题栏 (48px)
          TabBar.tsx         # 底部Tab栏 (44px, 8秒折叠)
        ui/             # 通用UI组件
          Button.tsx         # 按钮 (default/primary/ghost/icon)
          Input.tsx          # 输入框
          Toggle.tsx         # 开关
          Slider.tsx         # 滑条 (iOS 26风格)
          Tag.tsx            # 标签
          Panel.tsx          # 面板/卡片
        tabs/           # Tab内容组件
          ColorPanel.tsx     # 调色面板
          CreativePanel.tsx  # 创绘面板 (手绘/人偶双模式)
      pages/
        ProjectManager.tsx   # 项目管理页
        ProjectView.tsx      # 项目编辑视图
      hooks/
        useTabCollapse.ts    # Tab自动折叠Hook
      lib/
        ffmpeg/
          FFmpegService.ts   # FFmpeg封装
          codecConfig.ts     # 编解码配置
          colorConversion.ts # 色彩空间转换
        color/
          ColorGrade.ts      # WebGL2调色管线
          LUTParser.ts       # LUT解析 (.cube/.3dl/.csp)
          Scopes.ts          # 向量示波器/波形图/直方图
          ColorSpace.ts      # 色彩空间定义/Delta E计算
        drawing/             # 手绘引擎
          CanvasEngine.ts    # 画布管理 (缩放/平移)
          BrushEngine.ts     # 笔刷渲染引擎
          LayerManager.ts    # 图层管理
          MRComposer.ts      # MR合成管线
          KeyframeEngine.ts  # 关键帧插值
          BrushImporter.ts   # .abr/.sai2 导入
        spine/               # Spine集成
          SpineRuntime.ts    # 动态加载spine-webgl.js
          SpineRenderer.ts   # 渲染封装
          spine-webgl.d.ts   # 类型声明
        input/
          PointerHandler.ts  # PointerEvent处理
          PressureCurve.ts   # 压感曲线映射
```

## 编码规范

### TypeScript
- 严格模式 (strict: true)
- 不添加注释，除非绝对必要
- 使用 `interface` 定义对象类型，`type` 定义联合/元组类型
- 枚举使用 `enum` 而非常量对象

### 命名规范
- 组件: PascalCase (Button.tsx, TitleBar.tsx)
- 工具/Hook: camelCase (useTabCollapse.ts, colorGrade.ts)
- 常量: UPPER_SNAKE_CASE (DEFAULT_PARAMS)
- 文件名与导出名一致

### 样式规范
- 所有颜色使用CSS变量，绝不硬编码
- 颜色体系: 灰阶基底 + 莫代尔色(#7a9ec4)点缀
- 功能色(绿/黄/红)仅用于VU表和状态指示
- 无阴影 (box-shadow: none)
- 无渐变 (缩略图/背景纯灰阶)
- 无emoji (用纯文字/符号替代)
- 过渡动画: 120ms快速 / 200ms常规 / 350ms折叠展开

### 组件规范
- 按钮高度32px，字号12px，圆角6px
- 输入框高度30px，背景bg-tertiary
- 滑条: 4px轨道 + 20px圆形白色滑块
- Toggle: 40x22px，圆角11px
- 面板: bg-secondary，1px边框，8px圆角，无阴影
- 滚动条: 6px宽，rgba(255,255,255,0.1)滑块

### 字体
- 标题: LaoJingHua (老京华体) → Noto Serif SC → serif
- 正文: MiSans → Noto Sans SC → sans-serif
- 等宽: JetBrains Mono → Fira Code → monospace

## 视频技术要求

### 编解码支持
| 编码 | FFmpeg编码器 | 色度子采样 | 色深 | 方向 |
|------|-------------|-----------|------|------|
| AVC (H.264) | libx264 | 420/422/444 | 8/10bit | 编码输出 |
| HEVC (H.265) | libx265 | 420/422/444 | 8/10/12/16bit | 编码输出 |
| Sony XDCAM 422 | mpeg2video | 422 | 8bit | 编码输出 |
| Sony XDCAM 444 | mpeg2video | 444 | 8bit | 编码输出 |
| Sony XAVC I | mpeg4 | 422 | 10bit | 编码输出 |
| Sony XAVC L | libx265 | 420/422 | 10bit | 编码输出 |
| **Sony X-OCN** | copy (需Sony插件) | 422/444 | **12/16bit** | **仅解码导入** |
| ProRes 422 | prores_ks | 422 | 10bit | 编码输出 |
| ProRes 4444 | prores_ks | 444 | 10bit | 编码输出 |

### 色彩空间
- Rec. 709, Rec. 2020, DCI-P3
- SLog2, SLog3 (Sony)
- CLog2, CLog3 (Canon)
- VLog (Panasonic)

### LUT格式
- .cube (Industry standard)
- .3dl (Autodesk)
- .csp (FilmLight)
- 四面体插值 (Tetrahedral interpolation)

### 示波器
- 向量示波器 (UV色度平面，Rec709/2020 gamut overlay)
- 亮度波形图 (Y channel)
- RGB分量波形 (R/G/B并排)
- 直方图 (RGB + Luminance, 256 bins)
- GPU加速计算 (WebGL2)

### 调色管线
- 内部处理: Linear Float32 (16-bit精度)
- WebGL2 GPU加速
- 支持: 曝光/对比/高光/阴影/白色/黑色
- 色轮: 暗部/中间调/高光 (lift/gamma/gain)
- 色温/色调/饱和度/自然饱和度
- LUT应用 (最终节点)
- ACE色彩管线: 自动色彩还原 + 自动色彩统一
- 相机厂商自动识别 (Sony/Canon/Panasonic/RED/ARRI/Blackmagic/DJI/Nikon/Fujifilm)
- LUT库本地存储 (内置14个还原LUT + 用户自定义)

### AI功能 (推荐扩展)
- AI超分辨率 (Real-ESRGAN/waifu2x)
- AI帧插值 (RIFE/FILM)
- AI场景检测
- AI自动构图
- AI人声分离/降噪
- AI运动跟踪

## 构建与开发

```bash
npm run dev          # 开发模式 (electron + vite)
npm run build        # 生产构建
npm run typecheck    # TypeScript类型检查
```

## Git规范

- feat/ 新功能
- fix/ 修复
- refactor/ 重构
- 提交信息使用中文或英文
- 每次提交一个逻辑变更
