# TODO_ICON — IconPark 全量替换清单

**目标：** 将项目中所有文本图标替换为 @icon-park/react 图标组件

---

## 高优先级（操作/交互图标）

### 1. EditorPanel.tsx (9处)

| 行 | 当前文本 | 替换为 | IconPark 组件 |
|----|---------|--------|--------------|
| 163 | `'|<'` | `<Icon name="prev" size={12} />` | Icons.LeftC |
| 164 | `'<<'` | `<Icon name="prev-frame" size={12} />` | Icons.ToBottom |
| 166 | `'||'` / `'>'` | `<Icon name={playing?'pause':'play'} size={14} />` | Icons.PauseOne / PlayOne |
| 167 | `'>>'` | `<Icon name="next-frame" size={12} />` | Icons.ToTop |
| 168 | `'>|'` | `<Icon name="next" size={12} />` | Icons.RightC |
| 170 | `I` (入点) | `<Icon name="marker-in" size={12} />` | Icons.Flag |
| 171 | `x` (清标记) | `<Icon name="close-small" size={12} />` | Icons.CloseSmall |
| 172 | `O` (出点) | `<Icon name="marker-out" size={12} />` | Icons.Flag |
| 194 | `+` (加轨) | `<Icon name="plus" size={10} />` | Icons.Add |
| 195 | `o` (删轨) | `<Icon name="minus" size={10} />` | Icons.Minus |

### 2. ProjectManager.tsx (10处)

| 行 | 当前文本 | 替换为 | 备注 |
|----|---------|--------|------|
| 126 | `[=]` | `<Icon name="home" size={16} />` | 应用图标 |
| 174 | `<span>+</span>` | `<Icon name="plus" size={14} />` | 新建按钮 |
| 188 | `U` | `<Icon name="user" size={16} />` | 用户头像 |
| 284 | `[=]` | `<Icon name="grid" size={14} />` | 网格视图 |
| 369 | `<span>+</span>` | `<Icon name="plus" size={24} />` | 新建卡片 |

### 3. ToolBar.tsx (16处)

| 行 | 当前文本 | 替换为 |
|----|---------|--------|
| 33 | `/` | `<Icon name="brush" size={14} />` |
| 33 | `/` | `<Icon name="pencil" size={14} />` |
| 33 | `/` | `<Icon name="brush" size={14} />` (喷枪→airbrush not avail, reuse brush) |
| 33 | `/` | `<Icon name="eraser" size={14} />` |
| 33 | `/` | `<Icon name="fill" size={14} />` |
| 33 | `/` | `<Icon name="gradient" size={14} />` |
| etc | `/` | 每个工具对应 IconPark 图标 |

---

## 中优先级（功能性图标）

### 4. QuickEditPanel.tsx (7处)

| 行 | 当前文本 | 替换为 |
|----|---------|--------|
| 107 | `#` (缩略图) | `<Icon name="image" size={12} />` |
| 181 | `*`/`<>`/`[+]`/`()`/`=` | 各过渡对应图标 |

### 5. OutlinePanel.tsx (4处)

| 行 | 当前文本 | 替换为 |
|----|---------|--------|
| 122 | `[ ` | `<Icon name="folder" size={12} />` / `<Icon name="folder-open" size={12} />` |
| 138 | `>` | `<Icon name="chevron-right" size={10} />` |
| 173 | `B` | `<Icon name="text-bold" size={12} />` 或保留 B |
| 174 | `I` | `<Icon name="text-italic" size={12} />` 或保留 I |
| 175 | `U` | `<Icon name="text-underline" size={12} />` 或保留 U |

### 6. SettingsPage.tsx (1处)

| 行 | 当前文本 | 替换为 |
|----|---------|--------|
| 111 | `E` (编辑) | `<Icon name="pen" size={12} />` |

### 7. PuppetControls.tsx (1处)

| 行 | 当前文本 | 替换为 |
|----|---------|--------|
| 27 | `R` (循环) | `<Icon name="refresh" size={12} />` |

---

## 低优先级（状态/装饰图标）

### 8. PublishPanel.tsx (1处)

| 行 | 当前文本 | 替换为 |
|----|---------|--------|
| 100 | `>` (播放) | `<Icon name="play" size={18} />` |

### 9. SpineSetupGuide.tsx (1处)

| 行 | 当前文本 | 替换为 |
|----|---------|--------|
| 7 | `?` (帮助) | `<Icon name="help" size={20} />` |

### 10. ColorPanel.tsx (1处)

| 行 | 当前文本 | 替换为 |
|----|---------|--------|
| 231 | `+` | `<Icon name="plus" size={14} />` |

---

## 进度

开始时间：2026-07-24 14:45

| 文件 | 状态 |
|------|------|
| EditorPanel.tsx (9处) | ⏳ |
| ProjectManager.tsx (10处) | ❌ |
| ToolBar.tsx (16处) | ❌ |
| QuickEditPanel.tsx (7处) | ❌ |
| OutlinePanel.tsx (5处) | ❌ |
| SettingsPage.tsx (1处) | ❌ |
| PuppetControls.tsx (1处) | ❌ |
| PublishPanel.tsx (1处) | ❌ |
| SpineSetupGuide.tsx (1处) | ❌ |
| ColorPanel.tsx (1处) | ❌ |
| PuppetCanvas.tsx (1处) | ❌ |
| LayerPanel.tsx (1处) | ❌ |
