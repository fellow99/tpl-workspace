# tpl-workspace 技术选型

> 项目：tpl-workspace（多端业务应用框架 · 父工程）
> 版本：v1.0
> 日期：2026-08-22

---

## 一、技术栈总览

tpl-workspace 采用 **前后端分离 + 多平台前端** 架构，由 12 个子工程构成（含 2 个纯前端桌面工作台工程）。整体技术栈遵循「管理后台继承 RuoYi-Vue-Plus 生态，用户侧独立轻量」的双轨策略；桌面工作台为整体平台的前端门户模块，采用 wujie 微前端架构。

| 层级 | 技术 | 说明 |
|------|------|------|
| 后端框架 | Spring Boot 4.1（双后端统一） | tpl-manage: 4.1.0 + JDK 21；tpl-app-api: 4.1.0 + JDK 21 |
| 认证授权 | Sa-Token | tpl-manage 完整 RBAC；tpl-app-api JWT 轻量认证 |
| ORM | MyBatis-Plus | 通用 CRUD + 分页 + 数据权限插件 |
| 数据库 | PostgreSQL 15+ | 业务主存储，两后端共享 |
| 缓存 | Redis 7/8 | 缓存、会话、验证码、分布式锁 |
| 对象存储 | MinIO | 用户上传文件 |
| 前端 Web | Vue 3 + TypeScript + Vite | 用户侧无 UI 框架，管理端 Element Plus |
| 移动端 | Kotlin / ArkTS / 微信小程序 | 三端原生 |
| 桌面工作台 | Vue 3 + Vite + Element Plus + wujie | 纯前端，微前端宿主 + 插件子应用 |
| 部署 | Docker Compose | 7 服务编排 + Nginx 总网关 |

---

## 二、后端技术栈

### 2.1 tpl-manage（管理后台 · 继承 RuoYi-Vue-Plus）

| 技术 | 版本 | 用途 |
|------|------|------|
| Spring Boot | 4.1.0 | 应用框架（RVP 依赖管理统一版本） |
| JDK | 21 LTS | 基础运行环境 |
| Sa-Token | 1.45.0 | 认证 + RBAC + JWT |
| MyBatis-Plus | 3.5.17 | ORM + 分页 + 数据权限插件 |
| PostgreSQL | 15+ | 业务数据库（相对 RVP 原生 MySQL 的替换） |
| Redis + Redisson | 7.0+ / 4.6.1 | 缓存 + 分布式锁 |
| MinIO | — | 文件存储（Bucket: `tpl-manage`） |
| Jetty | 12.x | Web 容器（基于 Netty） |
| SpringDoc | — | API 文档（javadoc 零注解） |

### 2.2 tpl-app-api（用户侧 · 独立轻量工程）

| 技术 | 版本 | 用途 |
|------|------|------|
| Spring Boot | 4.1.0 | REST API 容器（嵌入式 Tomcat） |
| JDK | 21 LTS | 基础运行环境 |
| Sa-Token | 1.45.0 | JWT 模式 + Redis 会话（仅登录态校验） |
| MyBatis-Plus | 3.5.17 | BaseMapper CRUD + 自定义注解 SQL |
| PostgreSQL | 15+ | 与 tpl-manage 共享数据库 |
| Redis | 7.x（Lettuce） | 验证码临时存储、Token 会话 |
| Hutool | 5.8.47 | 工具类库 |
| JustAuth | 3.0.1 | 微信第三方登录 |
| Lombok | — | 代码简化 |

> **双后端差异**：tpl-manage 是完整 RBAC 管理平台（聚合 RVP 41 个模块）；tpl-app-api 是独立轻量工程（参考 RVP 技术选型，但不引入 RVP 依赖）。

---

## 三、前端技术栈

### 3.1 tpl-app-web（用户侧 · 无 UI 框架）

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.13 | 前端框架（Composition API + `<script setup>`） |
| TypeScript | 5.6.3 | 类型系统（strict 模式） |
| Vite | 6.1.0 | 构建工具 |
| Vue Router | 4.5.0 | SPA 路由（History 模式，base `/web/`） |
| Pinia | 2.3.0 | 状态管理 |
| Axios | 1.7.9 | HTTP 客户端（拦截器模式） |
| lucide-vue-next | 0.469.0 | 图标库 |
| 样式 | 纯 CSS + Design Tokens | 无 UI 组件库，遵循 DESIGN.md |

### 3.2 tpl-manage-ui（管理后台 · alias 继承 RVP-UI）

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.40 | 前端框架 |
| TypeScript | 6.0.3 | 类型系统 |
| Vite + Rolldown | 8.1.5 | 构建工具 |
| Element Plus | 2.14.3 | UI 组件库 |
| Pinia | 4.0.2 | 状态管理 |
| Vue Router | 5.2.0 | 路由 |
| Axios | 1.18.1 | HTTP 客户端 |
| UnoCSS (Wind3) | 66.7.5 | 原子化 CSS |
| vue-i18n | 11.4.8 | 国际化 |
| ECharts | 6.1.0 | 图表 |
| vxe-table | 4.20.8 | 增强表格 |
| oxlint / oxfmt | — | 代码质量 |

---

## 四、多端客户端技术栈

| 端 | 语言/框架 | 关键组件 | 说明 |
|----|----------|---------|------|
| **Android** | Kotlin 2.x | Jetpack Navigation 2.8、Material 3、Retrofit 2 + OkHttp、EncryptedSharedPreferences、AES+RSA | MVVM 架构，minSdk 29 / targetSdk 36 |
| **HarmonyOS** | ArkTS | ArkUI 声明式、Stage Model、HAP+HAR 多模块、Hypium 测试 | Hvigor 6.1.0 构建，API 5.1~6.1 |
| **微信小程序** | TypeScript | Skyline 渲染引擎、glass-easel 组件框架、wx.request、wx.storage | 基础库 ≥ 3.0.0，CommonJS 模块 |

---

## 五、桌面工作台技术栈（前端门户）

### 5.1 tpl-desktop（wujie 微前端宿主）

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.39 | 组件框架（Composition API + `<script setup>`） |
| Vite + @vitejs/plugin-vue | ^8.1.4 / ^6.0.8 | 构建工具 |
| wujie + wujie-vue3 | ^2.1.0 | 微前端宿主框架（加载插件子应用） |
| Element Plus | ^2.11.7 | 对话框/抽屉/树形控件/消息提示 |
| GridStack.js | ^11.5.1 | 小部件拖拽网格 |
| Swiper + Embla Carousel | ^14.0.1 / ^8.6.0 | 页面翻页 / 背景选择轮播 |
| Sass (SCSS) | ^1.101.0 | CSS 预处理（浅色/深色主题变量） |
| jsencrypt | ^3.5.4 | RSA 登录加密 |
| vue3-markdown | ^1.2.17 | Markdown 小部件渲染 |
| @number-flow/vue | ^0.4.8 | 数字滚动动画 |
| dayjs | ^1.11.19 | 时钟格式化 |
| Lodash (cloneDeep) | ^4.17.21 | 属性编辑副本隔离 |

### 5.2 tpl-desktop-plugin-demo（wujie 微前端子应用）

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.39 | 组件框架 |
| Vite + @vitejs/plugin-vue | ^8.1.4 / ^6.0.8 | 构建工具 + `import.meta.glob` |
| dayjs | ^1.11.19 | DemoClock 时间格式化 |
| @number-flow/vue | ^0.4.8 | DemoNumber 数字动画 |
| Sass (SCSS) | ^1.101.0 | SCSS 编译 |

> 注：`tpl-desktop-plugin-demo` 不直接依赖 wujie 包，运行时通过宿主注入的 `window.__POWERED_BY_WUJIE__` / `window.$wujie` 切换沙箱/独立调试双模式。

---

## 六、构建与部署技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Maven | 3.9+ | tpl-manage（聚合 + 级联编译）、tpl-app-api 构建 |
| pnpm | 10.x | 前端依赖管理（tpl-app-web、tpl-manage-ui） |
| Gradle (Kotlin DSL) | 8.x | Android 构建 |
| Hvigor | 6.1.0 | HarmonyOS 构建 |
| Docker / Compose | 24.0+ | 7 服务容器化编排 |
| Nginx | latest (alpine) | 总网关反向代理 + SPA 静态资源 |
| PostgreSQL | 18-alpine | 容器化数据库 |
| Redis | 8-alpine | 容器化缓存 |

---

## 七、开发环境要求

| 软件 | 版本 | 说明 |
|------|------|------|
| JDK | 21（双后端统一） | 双后端统一 |
| Maven | 3.9+ | 或 mvnw Wrapper |
| Node.js | 18~24 | 前端构建 |
| pnpm | 10.x | 前端包管理 |
| PostgreSQL | 15+ | 本地开发或 Docker |
| Redis | 7.0+ | 本地开发或 Docker |
| Docker Desktop | 24.0+ | 一键部署 |
| DevEco Studio | — | 鸿蒙开发 |
| 微信开发者工具 | Nightly 版 | 小程序（Skyline） |
