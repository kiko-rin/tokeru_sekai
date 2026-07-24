# TODO — 二维工坊 v1.0.0 修复清单

进度：已完成 14 项，剩余 35 项

## ✅ 已修复

| # | 问题 | 文件 | 状态 |
|---|------|------|------|
| 1 | DrawingCanvas 闭包缺陷 (isDrawing 永远 false) | `drawing/DrawingCanvas.tsx` | 已修 |
| 2 | ColorPanel WebGL2 监看初始化 + scope 渲染 + LUT 导入 | `ColorPanel.tsx` | 已修 |
| 3 | EditorPanel CLIPS → timelineStore | `EditorPanel.tsx` | 已修 |
| 4 | 时间线 click-to-seek | `EditorPanel.tsx` | 已修 |
| 5 | I/O 旗标渲染 | `EditorPanel.tsx` | 已修 |
| 6 | 时间线缩放滑条控制片段位置 | `EditorPanel.tsx` | 已修 |
| 7 | 剪辑台UI恢复精确布局 (5区JSON对齐) | `EditorPanel.tsx` | 已修 |
| 8 | 元数据面板随 selectedClipId 变化 | `EditorPanel.tsx` | 已修 |
| 9 | 调色撤销/重做按钮 → store | `ColorPanel.tsx` | 已修 |
| 10 | LUT 导入 → parseLUT | `ColorPanel.tsx` | 已修 |
| 11 | 项目管理器 mock → projectStore | `ProjectManager.tsx` | 已修 |
| 12 | 新建项目 → projectStore.addProject() | `ProjectManager.tsx` | 已修 |
| 13 | Clip 类型增加 start/trackId | `shared/types.ts` | 已修 |
| 14 | 调色预设下拉 onChange | `ColorPanel.tsx` | 已修 |

## 📋 待修复

### 二、UI ↔ Store 数据流连接

- [ ] 15. 效果器链 → audioStore.addEffect()
- [ ] 16. 图层面板 useState → creativeStore.layers
- [ ] 17. 音频播放头 currentTime 绑定 + 走带
- [ ] 18. 拖拽素材到时间线 → addClip
- [ ] 19. 时间线左右滚动 (长于窗口)
- [ ] 20. 删除键(Delete/Backspace)移除选中片段

### 三、UI 功能完善

- [ ] 21. 音频频谱: 占位 → AnalyserNode FFT
- [ ] 22. 音频导出: dialog → Web Audio API
- [ ] 23. 发布渲染: 弹框 → FFmpegService.transcode()
- [ ] 24. 大纲: 添加场景/镜头/导入素材
- [ ] 25. 快编: 自动编排/清空/发送到剪辑台
- [ ] 26. 图层面板: 新建/删除/合并 → store
- [ ] 27. MR 合成: 应用/重置 → MRComposer
- [ ] 28. 关键帧: 添加/删除 → KeyframeEngine
- [ ] 29. Spine 人偶: 文件导入 → SpineRenderer
- [ ] 30. 人偶播放: 动画时间码同步
- [ ] 31. 笔刷预设选中态 + 参数面板

### 四、快捷键系统

- [ ] 32. Space: 播放/暂停
- [ ] 33. B/E/V/Z/I/G/N/O: 工具切换
- [ ] 34. I/O: 入点/出点标记
- [ ] 35. 左右箭头: 帧步进
- [ ] 36. Ctrl+S/Z/Shift+Z: 保存/撤销/重做

### 五、设置页面

- [ ] 37. GPU 加速/硬件解码 toggle → settingsStore
- [ ] 38. 预览质量/帧率 select 绑定
- [ ] 39. 内存/缓存滑条受控
- [ ] 40. 插件开关连接
- [ ] 41. 导入 LUT / 清理空间 / 获取更多插件

### 六、小缺陷

- [ ] 42. TabBar 左键检测
- [ ] 43. 示波器 vectorscope 颜色角度修正
- [ ] 44. 音频响度面板刻度对齐

### 七、规范补全

- [ ] 45. 人偶模式完整工作流
- [ ] 46. AI 合成 (MiDaS/RMBG/FastNERF)
- [ ] 47. 调音: 延迟/合唱/失真/限制器面板
- [ ] 48. 发布: 高级参数折叠区
