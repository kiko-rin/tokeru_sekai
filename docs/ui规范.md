# 二维工坊 — UI需求规范

## 一、色彩体系

### 1.1 灰阶基底

| 变量 | 色值 | 用途 |
|------|------|------|
| `--ho-bg-primary` | `#141414` | 最深层背景 |
| `--ho-bg-secondary` | `#1c1c1c` | 面板/侧栏背景 |
| `--ho-bg-tertiary` | `#242424` | 输入框/卡片/轨道条 |
| `--ho-bg-elevated` | `#2a2a2a` | 悬浮态/弹出层 |
| `--ho-surface` | `#202020` | 表面色 |

### 1.2 边框

| 变量 | 色值 | 用途 |
|------|------|------|
| `--ho-border` | `rgba(255,255,255,0.04)` | 默认分割线 |
| `--ho-border-active` | `rgba(255,255,255,0.08)` | hover/激活边框 |

### 1.3 文字层级（仅三级）

| 变量 | 色值 | 用途 |
|------|------|------|
| `--ho-text-primary` | `rgba(255,255,255,0.82)` | 标题/关键数据 |
| `--ho-text-secondary` | `rgba(255,255,255,0.40)` | 正文/标签 |
| `--ho-text-tertiary` | `rgba(255,255,255,0.20)` | 辅助说明/占位符 |

### 1.4 莫代尔点缀色 `#7a9ec4`

唯一强调色，仅用于关键交互指示：

| 变量 | 色值 | 用途 |
|------|------|------|
| `--ho-accent` | `#7a9ec4` | 时间码 / tab指示条 / 主按钮 / toggle / 播放头 / 关键帧 / 输入聚焦 |
| `--ho-accent-hover` | `#8aaed0` | 主按钮hover |
| `--ho-accent-pressed` | `#6a8eb4` | 主按钮pressed |
| `--ho-accent-bg` | `rgba(122,158,196,0.08)` | 选中态背景/toggle激活背景 |

**使用规则：** 每个界面区域莫代尔色不超过3处同时出现。

### 1.5 功能色（VU/响度/状态）

| 变量 | 色值 | 用途 |
|------|------|------|
| `--ho-safe` | `#6b9e7a` | VU安全区 / 波形正常段 |
| `--ho-warning` | `#c4a86a` | VU过渡区 / 旗标标记 |
| `--ho-peak` | `#b47a7a` | VU过载 / 削波指示 |

**渐变方向：** `linear-gradient(90deg, safe → warning → peak)` 或 `linear-gradient(to top, safe → warning → peak)`

### 1.6 时间线轨道色

低饱和度灰彩色，仅用于区分轨道：

| 变量 | 色值 | 轨道 |
|------|------|------|
| `--ho-track-v1` | `#6a8aaa` | V1 视频轨（蓝灰） |
| `--ho-track-v2` | `#7a9a6a` | V2 叠加轨（绿灰） |
| `--ho-track-v3` | `#8a7aaa` | V3 字幕轨（紫灰） |
| `--ho-track-a1` | `#aa8a6a` | A1 主音频（暖灰） |
| `--ho-track-a2` | `#8a6a8a` | A2 背景音乐（冷灰） |

**片段样式：** `background: rgba(轨道色, 0.12); border-left: 2px solid var(--ho-track-xx);`

### 1.7 旗标色

| 变量 | 色值 | 用途 |
|------|------|------|
| `--ho-marker` | `#c4a86a` | 时间线入点/出点/转场标记 |

---

## 二、字体系统

### 2.1 字体族

| 角色 | 字体 | 备选链 |
|------|------|--------|
| **标题** | 老京华体 | `老京华体 → LaoJingHua → Noto Serif SC → Source Han Serif CN → serif` |
| **正文** | MiSans | `MiSans → Mi Sans → Noto Sans SC → -apple-system → sans-serif` |
| **等宽** | JetBrains Mono | `JetBrains Mono → Fira Code → monospace` |

### 2.2 字号体系

| 级别 | 字号 | 字重 | 用途 |
|------|------|------|------|
| `--ho-font-size-xs` | 11px | 400 | 辅助标签/元数据 |
| `--ho-font-size-sm` | 12px | 400 | 按钮/表格/工具栏 |
| `--ho-font-size-base` | 13px | 400 | 正文/面板内容 |
| `--ho-font-size-md` | 14px | 400 | 编辑器正文 |
| `--ho-font-size-lg` | 16px | 600 | 小标题 |
| `--ho-font-size-xl` | 20px | 600 | 面板标题（老京华） |
| `--ho-font-size-2xl` | 24px | 400 | 统计数字（老京华） |

---

## 三、组件规范

### 3.1 按钮

| 类型 | 高度 | 背景 | 文字色 | 边框 | 字号 |
|------|------|------|--------|------|------|
| `.ho-btn` 默认 | 32px | transparent | secondary | 1px border-active | 12px |
| `.ho-btn-primary` | 32px | accent | `#0e1318` | none | 12px 500 |
| `.ho-btn-ghost` | 32px | transparent | secondary | none | 12px |
| `.ho-btn-icon` | 30×30px | transparent | secondary | none | — |

**圆角：** `var(--ho-radius-sm)` 6px

### 3.2 输入框

- 高度：30px
- 背景：`var(--ho-bg-tertiary)`
- 边框：1px `var(--ho-border)`
- 聚焦：border → accent，`box-shadow: 0 0 0 2px var(--ho-accent-bg)`
- 圆角：`var(--ho-radius-sm)` 6px

### 3.3 滑条（iOS 26外形）

- 轨道：4px高，pill圆角，`rgba(255,255,255,0.08)`
- 滑块：20px圆形白色，微阴影
- hover：`transform: scale(1.1)`
- active：`transform: scale(0.95)`

### 3.4 Toggle开关

- 尺寸：40×22px，圆角11px
- off态：`var(--ho-bg-tertiary)` + `var(--ho-border)`
- on态：`var(--ho-accent)` 填充，白色圆点
- 动画：圆点 `translateX(18px)` 0.2s

### 3.5 面板/卡片

- 背景：`var(--ho-bg-secondary)`
- 边框：1px `var(--ho-border)`
- 圆角：`var(--ho-radius-md)` 8px
- 阴影：none（无阴影设计）

### 3.6 滚动条

- 宽度：6px
- 轨道：transparent
- 滑块：`rgba(255,255,255,0.1)` 圆角3px
- hover：`rgba(255,255,255,0.18)`

### 3.7 标签 Tag

- 圆角pill形，10px
- 背景：`rgba(255,255,255,0.04)`
- 文字：`var(--ho-text-secondary)`
- 功能标签可使用对应功能色（MR混合=accent，静态图像=safe，动画=warning）

---

## 四、页面结构

### 4.1 主界面（项目管理）

- 侧边导航栏：48px宽，垂直icon
- 顶部栏：48px高
- 统计卡片：4个横排
- 项目网格：`auto-fill, minmax(260px, 1fr)`

### 4.2 视频工程界面

**顶部栏：** 48px高
- 左：返回 + 项目名（contenteditable）+ 类型tag
- 右：保存 + 撤销/重做 + 导出 + 设置

**底部Tab栏：** 44px高，居中，8秒无操作自动折叠
- 折叠后显示小尾巴（48×20px，底部居中）
- 小尾巴：点击展开，向上拖拽展开
- 7个tab：大纲 / 快编 / 剪辑台 / 创绘 / 调色 / 调音 / 发布

**Tab内容区：** flex:1 填充剩余空间

### 4.3 设置界面

- 左侧导航：200px
- 右侧内容区：max-width 700px

---

## 五、各Tab布局

| Tab | 布局 | 区域 |
|------|------|------|
| 项目大纲 | 三栏flex | 左240px树 / 中flex脚本 / 右280px素材库 |
| 快速编排 | 三栏flex | 左240px素材 / 中flex故事板 / 右240px属性 |
| 剪辑台 | 五区grid | 工具栏/素材库240px/监看/时间线200px/控件280px |
| 创绘空间 | 三栏flex | 左200px图层 / 中flex画布 / 右280px工具 |
| 调色面板 | 两栏flex | 左flex监看+缩略图 / 右320px调色工具 |
| 调音面板 | 两栏+底 | 左flex音频轨 / 右360px频谱效果器 / 底120px响度 |
| 发布页面 | 居中卡片 | max-width 800px |

---

## 六、动画规范

| 参数 | 值 |
|------|------|
| 缓动曲线 | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 快速 | 120ms |
| 常规 | 200ms |
| 折叠/展开 | 350ms |

---

## 七、设计原则

1. **灰阶为骨** — 所有界面仅用黑-白-灰阶调
2. **莫代尔点缀** — `#7a9ec4` 仅用于关键交互指示，每区域≤3处
3. **功能色克制** — 绿/黄/红仅用于VU表和状态指示
4. **无阴影** — `box-shadow: none`
5. **无渐变** — 缩略图/背景纯灰阶
6. **无emoji** — 用纯文字/符号替代
7. **标题老京华** — 面板标题/section标题/分组标题
8. **正文MiSans** — 所有正文/按钮/标签
9. **滑条iOS 26** — 白色圆形滑块+极细轨道
10. **日式极简** — 克制、安静、留白、功能优先