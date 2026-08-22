# tpl-workspace

> 多端业务应用框架 —— 一套工程骨架，覆盖 Web / Android / HarmonyOS / 微信小程序 / 管理后台，内置认证、国际化、主题与部署编排。

[![License](https://img.shields.io/badge/license-Proprietary-red)](./LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-brightgreen)](./tpl-app-api)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs)](./tpl-app-web)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql)](./)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?logo=redis)](./)
[![HarmonyOS](https://img.shields.io/badge/HarmonyOS-6.1-FF6A00)](./tpl-app-harmony)

---

## 简介

**tpl-workspace** 是一个**多端业务应用框架**，提供一套可复用的工程骨架与基础设施，用于快速构建面向多终端的业务应用。框架本身不绑定任何具体业务领域，而是沉淀了多端开发所需的通用能力：统一的工程结构、双后端服务、跨端一致的设计系统、国际化与主题支持，以及一键化的容器编排部署。

在此框架之上，接入具体业务即可快速产出覆盖 Web、Android、HarmonyOS、微信小程序与 Web 管理后台的完整产品。

---

## 核心特性

| 能力 | 说明 |
|------|------|
| **多端覆盖** | 用户端 Web、Android、HarmonyOS、微信小程序，加 Web 管理后台，一套架构贯穿五端 |
| **双后端服务** | 用户端 API（独立 Spring Boot 服务）+ 管理端（RuoYi-Vue-Plus），职责清晰、可独立演进 |
| **统一设计系统** | 一套 Design Tokens（色彩 / 字体 / 间距）跨端复用，保证多端视觉一致 |
| **国际化** | 三语言（zh-CN / en-US / zh-TW）语料单一事实源，脚本自动同步到各端 |
| **主题支持** | light / dark / system 三态主题，深浅色皮肤联动 |
| **基础能力** | 内置用户认证、个人中心等通用模块，开箱即用 |
| **部署编排** | Docker Compose 一键编排 PostgreSQL / Redis / 双后端 / 前端 / Nginx 网关 |

---

## 系统架构

```
┌──────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────┐│
│  │ tpl-app-  │ │ tpl-app-  │ │ tpl-app-  │ │ tpl-app-  │ │tpl-   ││
│  │ web       │ │ android   │ │ harmony   │ │ mini      │ │manage-││
│  │ (Vue 3)   │ │ (Kotlin)  │ │ (ArkTS)   │ │ (小程序)  │ │ui     ││
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └───┬───┘│
└────────┼─────────────┼─────────────┼─────────────┼───────────┼────┘
         │             │             │             │           │
         └─────────────┴──────┬──────┴─────────────┴───────────┘
                              │
                 ┌────────────┴────────────┐
                 │      Nginx (Gateway)    │
                 └─────┬──────────────┬────┘
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

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **用户端 Web** | Vue 3 + TypeScript + Vite | SPA，纯 CSS 设计系统，无 UI 框架依赖 |
| **管理端 Web** | RuoYi-Vue-Plus-UI（Vue 3 + Element Plus） | 开箱即用的后台管理系统 |
| **用户端后端** | Spring Boot 4.1 + JDK 21 + Sa-Token + MyBatis-Plus | 独立 REST API 服务 |
| **管理端后端** | RuoYi-Vue-Plus 6.0（Spring Boot + JDK 21） | 后台管理服务 |
| **Android** | Kotlin + Jetpack + Material 3 | 原生客户端 |
| **HarmonyOS** | ArkTS + ArkUI（Stage 模型） | 鸿蒙原生客户端 |
| **微信小程序** | TypeScript + Skyline 渲染 + glass-easel | 原生小程序 |
| **数据库** | PostgreSQL | 主数据存储 |
| **缓存** | Redis | 缓存、会话、验证码 |
| **对象存储** | MinIO | 文件存储 |
| **部署** | Docker Compose + Nginx | 容器化编排与反向代理 |

---

## 工程结构

```
tpl-workspace/
├── tpl-app-web/          # 用户端 Web 应用 (Vue 3 + TypeScript)
├── tpl-app-api/          # 用户端后端 (Spring Boot 4.1)
├── tpl-manage/           # 管理后台服务 (RuoYi-Vue-Plus)
├── tpl-manage-ui/        # 管理后台前端 (Vue 3 + Element Plus)
├── tpl-app-android/      # Android 客户端 (Kotlin)
├── tpl-app-harmony/      # 鸿蒙客户端 (ArkTS)
├── tpl-app-mini/         # 微信小程序
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
#   用户端 Web：  http://localhost:38088/web/
#   管理后台：    http://localhost:38088/manage/
```

> 各子工程的独立开发与启动方式见对应子工程 `README.md`。数据库连接、密钥等敏感配置通过 `deploy/.env` 注入（不入库，模板见 `deploy/.env.sample`）。

---

## License

Proprietary. All rights reserved.
