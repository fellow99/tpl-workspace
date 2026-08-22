# 主题皮肤支持 技术方案

> 本文件为跨工程聚合技术方案，记录主题皮肤在各子工程的落地方式。
> 模块：005-theme
> 对应规格：[spec.md](./spec.md)、[样式变量定义 var.md](./var.md)
> 更新日期：2026-08-18

---

## 1. 技术上下文

### 1.1 主题架构总览

```
父工程 specs/005-theme/var.md（颜色单一事实源：角色命名 + default/dark 两套取值）
        │  手工映射
        ├──────────────┬──────────────┬──────────────┬──────────────┐
        ▼              ▼              ▼              ▼              ▼
   tpl-app-web     tpl-app-android tpl-app-harmony tpl-app-mini    tpl-manage-ui
   (CSS 变量)      (colors.xml)   (color.json)   (WXSS 变量)     (沿用 RVP，不改动)
   [data-theme]    (DayNight)      (资源限定符)    (darkmode)     主色 #409EFF
```

数据流：用户切换主题（登录页按钮 / 个人中心「切换主题」）→ 写本地持久化 → 解析三态（light/dark/system）→ 切换生效变量集合 → 界面即时重渲染。

### 1.2 跨子工程落地

| 子工程 | 角色 | 主题机制 | 变量落点 | 切换入口 | 状态 |
|--------|------|-----------|---------|---------|------|
| 父工程 | 事实源 | var.md（角色命名 + 两套皮肤） | `specs/005-theme/var.md` | — | 📋 新建 |
| tpl-app-web | Web 端 | CSS 变量 `[data-theme]` | `src/style.css` | 登录页按钮 + 个人中心 | 📋 实现 |
| tpl-app-android | Android | colors.xml + DayNight | `res/values{,-night}/colors.xml` | 登录页按钮 + 个人中心 | 📋 实现 |
| tpl-app-harmony | 鸿蒙 | color.json + 资源限定符 | `resources/{base,dark}/element/color.json` | 登录页按钮 + 个人中心 | 📋 实现 |
| tpl-app-mini | 小程序 | WXSS 变量 + darkmode | `app.wxss` + `app.json` | 登录页按钮 + 个人中心 | 📋 实现 |
| tpl-manage-ui | 管理前端 | 沿用 RVP 体系 | —（本轮不改动） | 已内置 | ⏸ 排除 |
| 后端 | — | 无主题需求 | — | — | ⏸ 排除 |

---

## 2. 宪法合规

- ✅ 原则 1（框架继承不复制）：tpl-manage-ui 沿用 RVP 体系，不 fork RVP/RVP-UI 源码。
- ✅ 原则 3（命名规范）：变量 kebab-case、语义段 camelCase；各端资源名 `.`/`-`→`_`。
- ✅ 原则 4（模块编号对齐）：模块编号 `005` 在父工程与各用户端一致。
- ✅ 原则 8（设计系统统一）：色彩对齐 DESIGN.md「破茧」色板，掌握度三色贯穿全端。
- ✅ 原则 9/9.1（安全基线）：主题为纯本地偏好，无敏感配置、无后端存储。

---

## 3. 主题切换机制设计（三态）

### 3.1 状态模型

| 状态 | 值 | 语义 | 解析 |
|------|-----|------|------|
| 浅色 | `light` | 强制亮色 | 直接生效 default 皮肤 |
| 深色 | `dark` | 强制暗色 | 直接生效 dark 皮肤 |
| 跟随系统 | `system`（默认） | 跟随系统深浅色 | 读系统主题 → 映射 light/dark |

> 登录页按钮为 **light↔dark 两态显式切换**（点击即覆盖 system 默认）；「切换主题」入口提供三态或等价选择。

### 3.2 各端三态实现对照

| 端 | 持久化 | 三态解析 | 切换 API |
|----|--------|---------|---------|
| tpl-app-web | localStorage `theme` | `system` → `matchMedia('(prefers-color-scheme: dark)')` | `documentElement.dataset.theme` |
| tpl-app-android | SharedPreferences `theme` | `system` → `MODE_NIGHT_FOLLOW_SYSTEM` | `AppCompatDelegate.setDefaultNightMode` |
| tpl-app-harmony | Preferences `theme` | `system` → `COLOR_MODE_NOT_SET` | `setColorMode` |
| tpl-app-mini | wx.storage `theme` | `system` → `wx.getSystemInfoSync().theme` | `data-theme` + `wx.setTabBarItem` |

### 3.3 登录页按钮交互

- 圆形按钮（emoji），固定登录页右上角。
- 亮色显示 `🌙`（点击切暗），暗色显示 `☀️`（点击切亮）。
- 点击显式写 `light`/`dark` 并即时生效；最小点击区域 ≥ 44px。

---

## 4. 实现策略

### 4.1 父工程（事实源）

1. 建立 `specs/005-theme/`：`spec.md`（需求规格）+ `var.md`（样式变量）+ `plan.md`（本文档）。
2. 关联 `docs/005-主题皮肤支持.md` 分析报告。

### 4.2 tpl-app-web（Vue 3 + 纯 CSS）

1. `src/style.css`：`：root` 挂 default 值 + DESIGN.md 色彩名别名；`[data-theme="dark"]` 挂 dark 值。
2. 新建 `src/stores/theme.ts`（Pinia）：`theme: 'light'|'dark'|'system'` + `useStorage('theme', 'system')`；解析三态 + 监听 `matchMedia` 变化。
3. `index.html` 内联脚本首屏防闪烁（读 localStorage 解析三态设 `data-theme`）。
4. `LoginPage.vue` 右上角加圆形 emoji 按钮；`ProfilePage.vue`「切换语言」下加「切换主题」。
5. `main.ts` 挂载 theme store。

### 4.3 tpl-app-android（Kotlin + Material Components）

1. `colors.xml` 色值对齐：`tpl_primary #1976D2→#3B5998`；新增 `values-night/colors.xml`（dark 变体）。
2. 新建 ThemeStore（或复用现有偏好）：三态 + `AppCompatDelegate.setDefaultNightMode`。
3. 登录 Fragment 右上角圆形 emoji 按钮；个人中心「切换语言」下加「切换主题」。
4. 清理 `side_nav_bar.xml` 茶绿渐变等模板残留。

### 4.4 tpl-app-harmony（ArkTS + ArkUI）

1. 收敛硬编码色到 `resources/base/element/color.json`；新增 `resources/dark/element/color.json`（dark 变体）。
2. 主题状态存 AppStorage/Preferences，`setColorMode` 三态映射。
3. 登录页右上角圆形 emoji 按钮；个人中心「切换语言」下加「切换主题」。

### 4.5 tpl-app-mini（微信小程序）

1. `app.wxss` 定义 CSS 变量（default + dark）；`app.json` 开启 `darkmode` + `themeLocation`。
2. `config.ts` STORAGE_KEYS 加 `THEME`，`storage.ts` 加 `getTheme/setTheme`，`app.ts` 解析三态。
3. 登录页右上角圆形 emoji 按钮；个人中心「切换语言」下加「切换主题」。
4. `wx.setTabBarItem`/`wx.setNavigationBarColor` 联动，品牌主色 `#07c160→#3B5998`。

---

## 5. 文件清单

| 子工程 | 关键文件 | 改动 |
|--------|---------|------|
| 父工程 | `specs/005-theme/{spec,var,plan}.md` | 新增规格 |
| tpl-app-web | `src/style.css`、`src/stores/theme.ts`、`src/views/LoginPage.vue`、`ProfilePage.vue`、`index.html`、`main.ts` | 变量 + 切换 + 按钮 |
| tpl-app-android | `res/values{,-night}/colors.xml`、ThemeStore、登录/个人中心 Fragment | 变量 + 切换 + 按钮 |
| tpl-app-harmony | `resources/{base,dark}/element/color.json`、主题状态、登录/个人中心页 | 变量 + 切换 + 按钮 |
| tpl-app-mini | `app.wxss`、`app.json`、`config.ts`、`storage.ts`、`app.ts`、登录/个人中心页 | 变量 + 切换 + 按钮 |

---

## 6. 分阶段实施顺序

| 阶段 | 内容 | 验收 |
|------|------|------|
| 1 | 父工程 `specs/005-theme/`（spec + var + plan） | 变量体系完整、决策记录清晰 |
| 2 | tpl-app-web（变量 + 三态切换 + 按钮） | 登录页/个人中心切换、持久化、系统跟随 |
| 3 | tpl-app-harmony → tpl-app-android → tpl-app-mini | 各端切换 + 持久化 + 品牌色统一 |

---

## 7. 关联文档

| 文档 | 路径 |
|------|------|
| 分析报告 | `../../docs/005-主题皮肤支持.md` |
| 样式变量定义 | `./var.md` |
| 功能规格 | `./spec.md` |
| 宪法原则 | `../constitution.md` |
| 设计系统 | `../../DESIGN.md` |
