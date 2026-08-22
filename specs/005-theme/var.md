# 样式变量定义（var.md）

> 模块：005-theme（主题皮肤支持）
> 定位：全产品线前端子工程的**颜色单一事实源（Single Source of Truth）**
> 来源：DESIGN.md「破茧」设计系统 + 各前端子工程现状色值综合
> 更新日期：2026-08-18

---

## 1. 设计原则

1. **角色命名为主**：变量描述「颜色在界面上扮演的角色」（`--color-primary` / `--color-bg`），暗色切换时角色不变、值变。
2. **色彩名别名保留**：DESIGN.md 色彩名（`--indigo` / `--gold` 等）作为别名映射到角色变量，供 tpl-app-web 平滑迁移。
3. **两套皮肤**：同一变量名提供 `default`（破茧亮色）与 `dark`（护眼暗色）两套取值。
4. **品牌主色统一**：全产品线主色统一为靛青 `#3B5998`。
5. **手工映射**：本文档为文档型事实源，各端手工映射到原生格式，不引入生成脚本。

---

## 2. 变量命名规范

```
--color[-<域>]-<语义>
```

| 规则 | 说明 | 示例 |
|------|------|------|
| 前缀 | 统一 `--color-` | `--color-primary` |
| 语义段 | kebab-case 英文 | `--color-text-secondary` |
| 各端转换 | CSS/WXSS 原样；Android/Harmony `-`→`_` 且去 `--` | `--color-primary` → `color_primary` |

---

## 3. 品牌色（Brand）

| CSS 变量 | 色值 | 色标名 | 用途 |
|----------|------|--------|------|
| `--color-primary` | `#3B5998` | 靛青 Indigo | 主品牌色：主按钮、标题、导航选中态 |
| `--color-accent` | `#E8923C` | 金曦 Gold | CTA 强调色：核心操作、重要高亮 |
| `--color-success` | `#4AA878` | 青绿 Verdigris | 成功色：正确反馈、完成状态 |
| `--color-danger` | `#D94E3C` | 朱砂 Cinnabar | 错误色：错误提示、删除确认 |

---

## 4. 中性色（Neutral）

| CSS 变量 | 色值 | 色标名 | 用途 |
|----------|------|--------|------|
| `--color-bg` | `#F7F5F0` | 素笺 Paper | 页面背景 |
| `--color-surface` | `#FFFFFF` | 净白 White | 卡片、弹窗、输入框背景 |
| `--color-text` | `#292522` | 墨墨 Ink | 正文主色 |
| `--color-text-secondary` | `#6E6A65` | 砚灰 Inkstone | 次要文字、图标 |
| `--color-border` | `#D9D4CC` | 银线 Silver | 分割线、卡片边框、禁用描边 |
| `--color-disabled` | `#EEECE6` | 霜白 Frost | 禁用背景、骨架屏 |

---

## 6. 扩展色（Extension，DESIGN.md 未定义，综合各端现状补齐）

| CSS 变量 | 色值 | 用途 | 来源 |
|----------|------|------|------|
| `--color-wechat` | `#07C160` | 微信品牌绿（微信登录按钮/绑定状态） | tpl-app-web / harmony / mini |
| `--color-placeholder` | `#B0ADA8` | 输入框占位文字 | tpl-app-harmony |
| `--color-divider` | `#F0ECE6` | 极浅分割线（≈ Frost 变体） | tpl-app-harmony |

> 说明：`--color-primary-10`（靛青 10% 透明 `#3B59981A`）等透明度衍生色按需由各端用「基础色 + alpha」生成，不在本清单单独枚举。

---

## 7. 主题皮肤取值（default / dark）

同一变量名两套取值，支撑皮肤切换（暗色值遵循 DESIGN.md §2.7「反色但保留靛青/金曦品牌识别度」，实现时经视觉 QA 微调定稿）：

| CSS 变量 | default（破茧亮色） | dark（护眼暗色） |
|----------|--------------------|------------------|
| `--color-primary` | `#3B5998` | `#5B7DB1`（提亮靛青，保证深底对比度） |
| `--color-accent` | `#E8923C` | `#E8923C`（保留金曦品牌识别度） |
| `--color-success` | `#4AA878` | `#7BC49A` |
| `--color-danger` | `#D94E3C` | `#E0705F` |
| `--color-bg` | `#F7F5F0` | `#1A1C1E`（深色背景） |
| `--color-surface` | `#FFFFFF` | `#26282B`（深色卡片） |
| `--color-text` | `#292522` | `#E8E4DE`（暖调浅色正文） |
| `--color-text-secondary` | `#6E6A65` | `#A8A29A` |
| `--color-border` | `#D9D4CC` | `#3A3A38` |
| `--color-disabled` | `#EEECE6` | `#2E3033` |

> 品牌色与中性色在暗色下微调明度提升可读性，具体值在实现暗色皮肤时定稿。

**扩展色暗色取值**（§6 扩展色在 dark 皮肤下的取值，default 值见 §6）：

| CSS 变量 | dark 取值 | 说明 |
|----------|-----------|------|
| `--color-wechat` | `#07C160` | 微信品牌绿，固定不变 |
| `--color-placeholder` | `#B0ADA8` | 占位灰，深底仍可读，保持 default |
| `--color-divider` | `#2E3033` | 分割线反色为深底（对齐 disabled 深底） |

---

## 8. DESIGN.md 色彩名别名映射

DESIGN.md 色彩名作为别名保留，映射到角色变量（供 tpl-app-web 平滑迁移，其余端直接用角色名）：

| 色彩名别名 | 角色变量 | 色值 |
|-----------|----------|------|
| `--indigo` | `--color-primary` | `#3B5998` |
| `--gold` | `--color-accent` | `#E8923C` |
| `--verdigris` | `--color-success` | `#4AA878` |
| `--cinnabar` | `--color-danger` | `#D94E3C` |
| `--paper` | `--color-bg` | `#F7F5F0` |
| `--white` | `--color-surface` | `#FFFFFF` |
| `--ink` | `--color-text` | `#292522` |
| `--inkstone` | `--color-text-secondary` | `#6E6A65` |
| `--silver` | `--color-border` | `#D9D4CC` |
| `--frost` | `--color-disabled` | `#EEECE6` |

---

## 9. 各端映射规则

| 变量格式 | Web / Mini | Android | Harmony |
|----------|-----------|---------|---------|
| 表达式 | `--color-primary`（CSS 变量） | `color_primary`（资源名） | `color_primary`（`name` 字段） |
| 转换 | 原样 | `--` 去除，`-`→`_` | `--` 去除，`-`→`_` |
| 落点 | `:root` / `[data-theme]` | `res/values/colors.xml` + `values-night/` | `resources/base|dark/element/color.json` |
