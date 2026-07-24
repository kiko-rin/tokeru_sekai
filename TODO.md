# TODO — 二维工坊 v1.0.0 修复清单

## 一、核心引擎缺陷

- [ ] 1. DrawingCanvas 笔刷画不出连续线条 — onMove 闭包 `isDrawing` 永远为 false
- [ ] 2. ColorPanel WebGL2 监看黑屏 — createTexture 从未调用
- [ ] 3. FFmpegService WASM 路径错误，`-f null` 不兼容，日志捕获无效

## 二、UI ↔ Store 数据流连接

- [ ] 4. 剪辑台: 硬编码 CLIPS → timelineStore.tracks
- [ ] 5. 时间线 seek(click-to-seek) → setCurrentTime
- [ ] 6. 时间线 I/O 旗标渲染 + 入点/出点操作
- [ ] 7. 时间线缩放滑条 → 片段位置缩放
- [ ] 8. 拖拽素材到时间线 → addClip
- [ ] 9. 项目管理器: mock 数据 → projectStore
- [ ] 10. 新建项目 → projectStore.addProject()
- [ ] 11. 调色面板: LUT 导入 → parseLUT + applyLUT
- [ ] 12. 调色预设下拉 → setParams
- [ ] 13. HSL 滑块 defaultValue → value
- [ ] 14. 调色 undo/redo → UI 按钮
- [ ] 15. 效果器链弹出 → audioStore.addEffect()
- [ ] 16. 图层面板 useState → creativeStore.layers
- [ ] 17. 音频播放头 currentTime 绑定
- [ ] 18. 元数据面板随 selectedClipId 变化

## 三、UI 功能完善

- [ ] 19. 音频频谱: CSS 占位 → AnalyserNode FFT
- [ ] 20. 音频导出: dialog → Web Audio API 离线处理
- [ ] 21. 发布渲染: 弹框 → FFmpegService.transcode()
- [ ] 22. 大纲: 添加场景/镜头/导入素材 → 对话框
- [ ] 23. 快编: 自动编排/清空/发送到剪辑台
- [ ] 24. 笔刷预设选中态 + 针管/油漆桶工具参数面板
- [ ] 25. MR 合成应用/重置 → MRComposer
- [ ] 26. 关键帧添加/删除 → KeyframeEngine
- [ ] 27. Spine 文件加载 → SpineRenderer
- [ ] 28. 人偶播放 → 时间码动画同步
- [ ] 29. 删除键(Delete/Backspace)移除选中片段

## 四、快捷键系统

- [ ] 30. Space: 播放/暂停
- [ ] 31. B/E/V/Z/I/G/N/O: 工具切换
- [ ] 32. I/O: 入点/出点
- [ ] 33. Delete/Backspace: 删除
- [ ] 34. Ctrl+S/Z/Shift+Z: 保存/撤销/重做
- [ ] 35. 左右箭头: 帧步进

## 五、设置页面

- [ ] 36. GPU 加速/硬件解码 toggle → settingsStore
- [ ] 37. 预览质量/帧率 select → state
- [ ] 38. 内存/缓存滑条 → state
- [ ] 39. 插件开关 state
- [ ] 40. 导入 LUT / 清理空间 / 获取更多插件
- [ ] 41. 自动保存间隔 ↔ 自动保存 toggle 联动

## 六、小缺陷

- [ ] 42. TabBar 左键检测
- [ ] 43. 示波器 vectorscope 颜色角度修正
- [ ] 44. 音频响度面板 LR 声道渐变修复

## 七、待接入文档规范

- [ ] 45. 人偶模式完整工作流
- [ ] 46. AI 合成 (MiDaS/RMBG/FastNERF)
- [ ] 47. 片段入点/出点吸附
- [ ] 48. 调音: 延迟/合唱/失真/限制器参数面板
- [ ] 49. 发布: 高级参数折叠区

## 修复进度

开始修复时间: 2026-07-24

### 当前修复: 一-1 DrawingCanvas 闭包缺陷
