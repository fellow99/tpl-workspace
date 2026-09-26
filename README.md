# tpl-workspace

> 多端业务应用框架 —— 一套工程骨架，覆盖 Web / Android / HarmonyOS / 微信小程序 / 管理后台，内置认证、国际化、主题与部署编排。

[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-brightgreen)](./tpl-app-api)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs)](./tpl-app-web)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql)](./)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?logo=redis)](./)
[![HarmonyOS](https://img.shields.io/badge/HarmonyOS-6.1-FF6A00)](./tpl-app-harmony)

---

## 简介

**tpl-workspace** 是一个**多端业务应用框架**，提供一套可复用的工程骨架与基础设施，用于快速构建面向多终端的业务应用。框架本身不绑定任何具体业务领域，而是沉淀了多端开发所需的通用能力：统一的工程结构、双后端服务、跨端一致的设计系统、国际化与主题支持，以及一键化的容器编排部署。

在此框架之上，接入具体业务即可快速产出覆盖 Web、Android、HarmonyOS、微信小程序与 Web 管理后台的完整产品。

此外，本平台还包含统一的**桌面工作台**模块（整体平台的前端门户）：`tpl-desktop`（多页面可视化桌面应用，wujie 微前端宿主）与 `tpl-desktop-plugin-demo`（wujie 微前端子应用插件示例）。

---

## 核心特性

| 能力 | 说明 |
|------|------|
| **多端覆盖** | 用户端 Web、Android、HarmonyOS、微信小程序，加 Web 管理后台，一套架构贯穿五端 |
| **品牌官网** | 纯原生 HTML/CSS/JS 介绍官网，浅色/暗色主题，随框架一键部署，承载对外品牌展示 |
| **双后端服务** | 用户端 API（独立 Spring Boot 服务）+ 管理端（RuoYi-Vue-Plus），职责清晰、可独立演进 |
| **统一设计系统** | 一套 Design Tokens（色彩 / 字体 / 间距）跨端复用，保证多端视觉一致 |
| **国际化** | 三语言（zh-CN / en-US / zh-TW）语料单一事实源，脚本自动同步到各端 |
| **主题支持** | light / dark / system 三态主题，深浅色皮肤联动 |
| **基础能力** | 内置用户认证、个人中心等通用模块，开箱即用 |
| **部署编排** | Docker Compose 一键编排 PostgreSQL / Redis / 双后端 / 前端 / Nginx 网关 |
| **桌面工作台** | 整体平台的前端门户，多页面可视化桌面（tpl-desktop），wujie 微前端宿主，插件化扩展 Widget / App / 背景 / UI 组件 |

---

## 系统架构

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    桌面工作台层（前端门户 · Portal）                     │
│   tpl-desktop（多页面可视化桌面 · wujie 微前端宿主）                     │
│     └─ wujie 加载 ─▶ tpl-desktop-plugin-demo（插件子应用）               │
│        提供 Widget / App / 背景 / UI 组件                                │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼──────────────────────────────────────┐
│                           客户端层（Client）                             │
│  tpl-app-web    tpl-app-android    tpl-app-harmony    tpl-app-mini       │
│  (Vue 3)        (Kotlin)           (ArkTS)            (小程序)           │
│  tpl-website（品牌官网）   tpl-manage-ui（管理后台）                      │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │
                       ┌────────────┴────────────┐
                       │       Nginx (Gateway)    │
                       └─────┬──────────────┬─────┘
                             │              │
                ┌────────────┴────┐   ┌─────┴──────────────┐
                │   tpl-app-api   │   │    tpl-manage      │
                │  (用户端 API)    │   │   (管理后台服务)    │
                │  Spring Boot 4  │   │  RuoYi-Vue-Plus    │
                │  Sa-Token       │   │  Spring Boot       │
                └─────┬───────────┘   └─────┬──────────────┘
                      │                     │
                      └──────────┬──────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
         ┌──────┴──────┐  ┌──────┴──────┐  ┌─────┴──────┐
         │ PostgreSQL  │  │    Redis    │  │    MinIO   │
         │  (数据存储)  │  │ (缓存/会话)  │  │ (文件存储)  │
         └─────────────┘  └─────────────┘  └────────────┘
```

**数据流**：各端客户端通过 Nginx 网关路由 → 用户端请求进入 `tpl-app-api`，管理端请求进入 `tpl-manage` → 统一持久化到 PostgreSQL / Redis / MinIO。

> **桌面工作台（前端门户）**：`tpl-desktop` 是整体平台的统一前端入口（多页面可视化桌面），`tpl-desktop-plugin-demo` 是其插件子应用示例。桌面工作台作为 wujie 微前端宿主，通过 `public/PLUGINS.json` 加载插件子应用；子应用通过 `plugin:ready` 事件总线向宿主暴露组件与元数据。当前认证模块内置 mock 降级机制（后端不可达时降级），后续接入 `tpl-app-api`。

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **用户端 Web** | Vue 3 + TypeScript + Vite | SPA，纯 CSS 设计系统，无 UI 框架依赖 |
| **品牌官网** | 原生 HTML + CSS + JS | 介绍官网（简体中文），浅色/暗色主题，无框架、无构建 |
| **管理端 Web** | RuoYi-Vue-Plus-UI（Vue 3 + Element Plus） | 开箱即用的后台管理系统 |
| **用户端后端** | Spring Boot 4.1 + JDK 21 + Sa-Token + MyBatis-Plus | 独立 REST API 服务 |
| **管理端后端** | RuoYi-Vue-Plus 6.0（Spring Boot + JDK 21） | 后台管理服务 |
| **Android** | Kotlin + Jetpack + Material 3 | 原生客户端 |
| **HarmonyOS** | ArkTS + ArkUI（Stage 模型） | 鸿蒙原生客户端 |
| **微信小程序** | TypeScript + Skyline 渲染 + glass-easel | 原生小程序 |
| **桌面工作台** | Vue 3.5 + Vite 8 + Element Plus + GridStack.js 11 + Swiper 14 + wujie | 整体平台前端门户：`tpl-desktop` 宿主 + `tpl-desktop-plugin-demo` 插件子应用 |
| **数据库** | PostgreSQL | 主数据存储 |
| **缓存** | Redis | 缓存、会话、验证码 |
| **对象存储** | MinIO | 文件存储 |
| **部署** | Docker Compose + Nginx | 容器化编排与反向代理 |

---

## 工程结构

```
tpl-workspace/
├── tpl-app-web/          # 用户端 Web 应用 (Vue 3 + TypeScript)
├── tpl-website/          # 品牌介绍官网 (原生 HTML/CSS/JS，浅色/暗色主题)
├── tpl-app-api/          # 用户端后端 (Spring Boot 4.1)
├── tpl-manage/           # 管理后台服务 (RuoYi-Vue-Plus)
├── tpl-manage-ui/        # 管理后台前端 (Vue 3 + Element Plus)
├── tpl-app-android/      # Android 客户端 (Kotlin)
├── tpl-app-harmony/      # 鸿蒙客户端 (ArkTS)
├── tpl-app-mini/         # 微信小程序
├── tpl-desktop/          # 桌面工作台（前端门户，wujie 微前端宿主，多页面可视化桌面）
├── tpl-desktop-plugin-demo/ # 桌面工作台插件示例（wujie 微前端子应用）
├── RuoYi-Vue-Plus/       # 上游参考：管理端后端
├── RuoYi-Vue-Plus-UI/    # 上游参考：管理端前端
├── docs/                 # 产品文档与设计文档
├── i18n/                 # 多语言语料单一事实源
├── specs/                # 产品线级规范文档
├── sql/                  # 数据库初始化脚本
├── deploy/               # 部署编排 (docker-compose + Nginx + Dockerfile)
├── DESIGN.md             # 设计系统
└── README.md             # 本文件
```

---

## 快速开始

```bash
# 1. 克隆仓库（含子模块）
git clone --recurse-submodules <repo-url> && cd tpl-workspace

# 2. 一键启动全套服务（PostgreSQL / Redis / 双后端 / 前端 / Nginx）
docker compose -f deploy/docker-compose.yml up -d --build

# 3. 访问
#   品牌官网：    http://localhost:38088/
#   用户端 Web：  http://localhost:38088/web/
#   管理后台：    http://localhost:38088/manage/
```

> 各子工程的独立开发与启动方式见对应子工程 `README.md`。数据库连接、密钥等敏感配置通过 `deploy/.env` 注入（不入库，模板见 `deploy/.env.sample`）。

---

## License

本项目基于 [MIT License](./LICENSE) 开源。
