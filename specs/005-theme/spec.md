# 主题皮肤支持 功能规格

> 模块：005-theme（需求编号 005-theme）
> 状态：实现中
> 更新日期：2026-08-18
> 关联文档：[分析报告](../../docs/005-主题皮肤支持.md)、[样式变量定义](./var.md)

---

## 1. 模块概述

### 1.1 目的

在父工程建立一套**跨端复用的样式变量定义**（`var.md`）作为全产品线颜色的**单一事实源**；四个用户端（tpl-app-web / tpl-app-android / tpl-app-harmony / tpl-app-mini）基于各自技术栈，实现「亮 + 暗」两套固定皮肤与「浅色 / 深色 / 跟随系统」三态切换，并提供**登录页右上角圆形 emoji 切换按钮**与**个人中心「切换主题」入口**。

### 1.2 解决的问题

- 各端颜色散落硬编码，品牌色不一致（mini 的微信绿 `#07c160` 与靛青 `#3B5998` 矛盾、android 的 Material 蓝 `#1976D2` 脱节）。
- 无主题切换能力，夜间/护眼场景体验差。
- 缺少「颜色语义名 → 各端原生格式」的统一映射规范。

### 1.3 范围

**包含**：父工程 `specs/005-theme/var.md`；四个用户端的主题变量定义、三态切换机制、本地持久化、登录页切换按钮、个人中心「切换主题」入口。

**排除**：tpl-manage-ui（沿用 RuoYi-Vue-Plus 既有暗黑/换肤体系，主色保持 `#409EFF`，本轮不改动）；后端（tpl-manage / tpl-app-api 无主题需求）；用户自定义主题色（仅两套固定皮肤）。

---

## 2. 用户故事

- 作为用户，我可在登录页右上角点击圆形按钮，一键切换亮色/暗色主题。
- 作为用户，登录后可在「个人中心」的「切换语言」下找到「切换主题」，随时切换亮/暗。
- 作为用户，我切换主题后刷新页面或重启 App，主题选择仍被保留。
- 作为用户，首次使用未手动选择时，主题默认跟随系统深浅色。
- 作为开发者，我只需参考父工程 `var.md` 的变量定义，即可在各端落地一致的品牌色与语义色。

---

## 3. 功能需求

### 3.1 样式变量定义（var.md）

- FR-005-001: 父工程 MUST 建立 `specs/005-theme/var.md`，作为全产品线颜色的唯一事实源。
- FR-005-002: var.md MUST 采用**角色命名为主 + DESIGN.md 色彩名别名保留**的变量体系（`--color-primary` 主，`--indigo: var(--color-primary)` 别名）。
- FR-005-004: var.md MUST 为同一变量名提供「default（破茧亮色）」与「dark（护眼暗色）」两套取值。
- FR-005-005: 品牌主色 MUST 全产品线统一为靛青 `#3B5998`（含 mini 微信绿收敛、android 主色迁移）。
- FR-005-006: 各端映射规则 MUST 在 var.md 明确：CSS/WXSS 原样 `--color-*`，Android/Harmony `-`→`_` 且去 `--`。

### 3.2 主题切换机制

- FR-005-007: 各用户端 MUST 支持三态主题：`light`（浅色）/ `dark`（深色）/ `system`（跟随系统），默认 `system`。
- FR-005-008: 主题选择 MUST 本地持久化（web：localStorage；android：SharedPreferences；harmony：Preferences/AppStorage；mini：wx.storage），**不涉及后端**。
- FR-005-009: `system` 态 MUST 跟随系统深浅色，系统深浅色变化时实时联动。
- FR-005-010: 主题切换 MUST 即时生效，无需整页刷新或重启。

### 3.3 登录页切换按钮

- FR-005-011: 登录页右上角 MUST 放置一个**圆形图标按钮（emoji）**，用于切换亮色/暗色主题。
- FR-005-012: 按钮点击 MUST 在 light↔dark 之间切换（显式选择，覆盖 `system` 默认）。
- FR-005-013: 按钮 MUST 反映当前生效主题：亮色时显示 `🌙`，暗色时显示 `☀️`。
- FR-005-014: 按钮 MUST 不遮挡登录表单、不影响登录主流程，且具备最小点击区域（≥ 44px）。

### 3.4 个人中心「切换主题」

- FR-005-015: 登录后的「个人中心」页面，在「切换语言」功能下 MUST 增加「切换主题」功能。
- FR-005-016: 「切换主题」MUST 与登录页按钮共享同一主题状态与持久化键，切换后两处入口同步一致。
- FR-005-017: 「切换主题」交互 SHOULD 提供三态选择（浅色/深色/跟随系统）或等价切换能力。

### 3.5 范围约束

- FR-005-018: 本轮 MUST 不改动 tpl-manage-ui（沿用 RuoYi-Vue-Plus 体系，主色保持 `#409EFF`）。
- FR-005-019: 后端（tpl-manage / tpl-app-api）MUST 无主题相关改动。

---

## 4. 关键契约

### 4.1 主题状态模型

| 状态 | 值 | 语义 |
|------|-----|------|
| 浅色 | `light` | 强制「破茧」亮色皮肤 |
| 深色 | `dark` | 强制「护眼暗色」皮肤 |
| 跟随系统 | `system`（默认） | 跟随系统深浅色，动态解析 |

> 登录页按钮为两态切换（light↔dark，显式选择）；`system` 仅作为首次使用的默认值。

### 4.2 变量命名规范

```
--color[-<域>]-<语义>
```

| 前缀 | 域 | 示例 |
|------|-----|------|
| `--color-` | 无（品牌/中性） | `--color-primary`、`--color-bg` |

DESIGN.md 色彩名别名：`--indigo: var(--color-primary)`、`--gold: var(--color-accent)` 等（见 var.md）。

### 4.3 各端主题落点

| 子工程 | 变量落点 | 暗色切换机制 | 持久化键 |
|--------|---------|-------------|---------|
| tpl-app-web | `src/style.css`（`:root` / `[data-theme="dark"]`） | `documentElement.dataset.theme` | `theme` |
| tpl-app-android | `res/values/colors.xml` + `values-night/` | `AppCompatDelegate.setDefaultNightMode` | `theme`（SharedPreferences） |
| tpl-app-harmony | `resources/base|dark/element/color.json` | `setColorMode` + 资源限定符 | `theme`（Preferences） |
| tpl-app-mini | `app.wxss`（CSS 变量）+ `app.json` darkmode | `data-theme` + `wx.setTabBarItem`/`setNavigationBarColor` | `theme`（wx.storage） |

---

## 5. 验收场景

- **登录页一键切换**：Given 登录页（亮色），When 点击右上角按钮，Then 主题切换为暗色、按钮由 `🌙` 变 `☀️`，全程无刷新。
- **个人中心切换**：Given 已登录，When 在个人中心点击「切换主题」，Then 主题切换且与登录页状态一致。
- **持久化**：Given 已切换为暗色，When 刷新页面/重启 App，Then 仍为暗色。
- **系统跟随**：Given 未手动选择（`system`），When 系统切换为深色，Then 应用实时切换为暗色。
- **两入口同步**：Given 登录页切为暗色，When 登录进入个人中心，Then 显示为暗色且「切换主题」状态正确。
- **品牌色一致**：Given 任一用户端主色，Then 均为靛青 `#3B5998`（非微信绿/非 Material 蓝）。

---

## 6. 非功能需求

- 颜色定义 MUST 单一来源（父工程 `var.md` 一处维护）。
- 主题切换 MUST 即时生效、无白屏、无闪烁（web 端需首屏防闪烁内联脚本）。
- 暗色皮肤 MUST 遵循 DESIGN.md「反色但保留靛青/金曦品牌识别度」原则。
- 各端原生格式 MUST 与 var.md 语义名一一对应（手工映射）。

---

## 7. 约束与假设

- **皮肤形态**：仅「亮 + 暗」两套固定皮肤，不预留多皮肤扩展、不做用户自定义主题色。
- **命名**：角色命名为主，DESIGN.md 色彩名仅作别名。
- **切换模型**：登录页按钮为 light↔dark 两态显式切换；`system` 为默认值，由「切换主题」入口提供三态或等价选择。
- **tpl-manage-ui**：沿用 RVP 体系、主色保持 `#409EFF`，本轮不改动。

---

## 8. 依赖

- 上游：父工程 `DESIGN.md`（「破茧」设计系统色板）、`specs/constitution.md`（原则 1/3/8）。
- 下游：tpl-app-web / tpl-app-android / tpl-app-harmony / tpl-app-mini（各端落地实现）。
- 参考：RuoYi-Vue-Plus-UI（CSS 变量 + `html.dark` 切换 + `useDark` 持久化）。
- 无后端依赖（主题为纯前端本地偏好）。
