# TODO — 二维工坊 v1.0.0 修复清单

进度：**48/48 项已完成** ✅

## 已修复

| # | 问题 | 文件 |
|---|------|------|
| 1 | DrawingCanvas 闭包缺陷 | `drawing/DrawingCanvas.tsx` |
| 2 | ColorPanel WebGL2 监看+scope+LUT import | `ColorPanel.tsx` |
| 3-8 | EditorPanel timelineStore+seek+markers+zoom+元数据+UI恢复 | `EditorPanel.tsx` |
| 9-14 | 调色撤销重做/LUT/项目管理器→store/新建写入/Clip类型/预设 | `ColorPanel`/`ProjectManager`/`types.ts` |
| 15 | 效果器链 addEffect/removeEffect/toggleBypass → store | `AudioPanel.tsx` |
| 16 | LayerPanel → creativeStore (CRUD/可见/锁定) | `drawing/LayerPanel.tsx` |
| 17 | AudioPanel 播放头 currentTime 绑定 | `AudioPanel.tsx` |
| 18 | 拖拽素材→addClip | `EditorPanel.tsx` |
| 19 | 时间线缩放滑条控制片段位置 | `EditorPanel.tsx` |
| 20 | Delete/Backspace 移除选中片段 | `EditorPanel.tsx` |
| 21 | 频谱 requestAnimationFrame Canvas 渲染 | `AudioPanel.tsx` |
| 22 | 音频导出 Web Audio API OfflineAudioContext + WAV 编码 | `AudioPanel.tsx` |
| 23 | PublishPanel 渲染进度 + 文件保存 IPC | `PublishPanel.tsx` |
| 24 | Outline 添加场景/镜头 + 导入素材对话框 | `OutlinePanel.tsx` |
| 25 | QuickEdit 自动编排/清空/发送到剪辑台 | `QuickEditPanel.tsx` |
| 26 | 图层面板新建/删除→store | `drawing/LayerPanel.tsx` |
| 27 | MR 合成 应用/重置 → MRComposer | `drawing/MRPanel.tsx` |
| 28 | 关键帧 添加/删除 → KeyframeEngine + 插值显示 | `drawing/KeyframeTimeline.tsx` |
| 29 | SpineLoader 文件选择 → onFilesLoaded 回调 | `puppet/SpineLoader.tsx` |
| 30 | 人偶播放 controls 时间码同步 | `puppet/PuppetControls.tsx` |
| 31 | 快捷键 Space/B/E/V/I/O/Delete/Arrow/Home/End | `hooks/useKeyboardShortcuts.ts` |
| 32-36 | Ctrl+S/Z/Shift+Z/Space/箭头 全局注册 | `ProjectView.tsx` |
| 37-41 | 设置页 Slider 受控化/浏览 IPC | `SettingsPage.tsx` |
| 42 | TabBar 左键检测 (e.button !== 0) | `layout/TabBar.tsx` |
| 43 | Vectorscope 颜色角度标准化 | `lib/color/Scopes.ts` |
| 44 | 音频响度面板刻度 space-evenly 对齐 | `EditorPanel.tsx` |
