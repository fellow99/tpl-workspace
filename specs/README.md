# 规格文档索引

**项目名称：** tpl-workspace（多端业务应用框架）
**工程：** tpl-workspace（父工程 / 产品线级）
**技术栈：** Spring Boot 4.1（双后端统一）· Vue 3 · PostgreSQL · Redis · MinIO
**文档生成时间：** 2026-08-22
**最后更新：** 2026-08-22

---

## 一、文档总览

| 层级 | 分类 | 文档数量 | 说明 |
|------|------|---------|------|
| 整体 | 项目级顶层文档 | 5 | 架构、技术、宪法、结构、检查清单等全局文档 |
| 整体 | 整体规格文档 | 3 | overall-spec / overall-plan / overall-data-model |
| 模块 | 用户认证 | 1 目录 | 002-user-auth |
| 模块 | 基础设施 | 3 目录 | 004-i18n、005-theme、202-sms-integration |
| **合计** | **8 文件 + 4 目录** | — | — |

> 注：按任务要求，父工程不编写 `API.md`、`overall-api.md`、`overall-test-cases.md`。接口契约见各子工程 `specs/overall-api.md`，测试用例见各子工程 `specs/overall-test-cases.md` 与模块 `test-cases.md`。

---

## 二、项目级顶层文档

全局性的架构、技术、宪法等文档，定义产品线基线与开发准则。

| 文档 | 路径 | 说明 |
|------|------|------|
| **架构设计** | [ARCHITECTURE.md](./ARCHITECTURE.md) | 系统整体架构、子工程依赖关系、数据流、部署拓扑 |
| **技术选型** | [TECH.md](./TECH.md) | 全产品线技术栈选型、双后端策略、多端技术 |
| **宪法原则** | [constitution.md](./constitution.md) | 产品线级开发原则（框架继承 / 表命名 / 模块编号等） |
| **项目结构** | [STRUCTURE.md](./STRUCTURE.md) | 父工程目录结构、子工程清单、端口/路由清单 |
| **检查清单** | [SPECS_CHECKLIST.md](./SPECS_CHECKLIST.md) | 规格文档完成度追踪 |

### 整体规格文档

| 文档 | 路径 | 说明 |
|------|------|------|
| **整体规格** | [overall-spec.md](./overall-spec.md) | 系统级功能规格（技术无关） |
| **整体方案** | [overall-plan.md](./overall-plan.md) | 系统级技术方案（跨工程落地） |
| **数据模型** | [overall-data-model.md](./overall-data-model.md) | 全局数据实体、表结构、数据字典 |

---

## 三、功能模块文档

### 用户认证（002）

#### 002 — 用户注册及登录（user-auth）

> 用户账号体系入口：注册、密码/短信/微信登录、验证码、个人信息管理。MVP 已实现（tpl-app-api + tpl-app-web）。

| 文档 | 链接 | 说明 |
|------|------|------|
| 功能规格 | [002-user-auth/spec.md](./002-user-auth/spec.md) | 注册/登录/验证码/个人信息功能规格 |
| 技术方案 | [002-user-auth/plan.md](./002-user-auth/plan.md) | 跨工程落地（sys_user + tpl_user_profile 扩展架构） |

### 基础设施（004、005、202）

#### 004 — 多语言国际化支持（i18n）

> 多端国际化能力：多语言资源、语言切换、持久化。

| 文档 | 链接 | 说明 |
|------|------|------|
| 功能规格 | [004-i18n/spec.md](./004-i18n/spec.md) | 国际化功能规格 |
| 技术方案 | [004-i18n/plan.md](./004-i18n/plan.md) | 多端落地 |

#### 005 — 主题皮肤支持（theme）

> 主题皮肤切换能力：浅色/深色、跟随系统、持久化。

| 文档 | 链接 | 说明 |
|------|------|------|
| 功能规格 | [005-theme/spec.md](./005-theme/spec.md) | 主题功能规格 |
| 技术方案 | [005-theme/plan.md](./005-theme/plan.md) | 多端落地 |

#### 202 — 短信平台 API 对接（sms-integration）

> 对接 Spug Push 短信平台，实现短信验证码发送能力，封装为 tpl-app-api 的功能类供注册、登录等模块调用。

| 文档 | 链接 | 说明 |
|------|------|------|
| 功能规格 | [202-sms-integration/spec.md](./202-sms-integration/spec.md) | 短信验证码发送功能规格 |
| 技术方案 | [202-sms-integration/plan.md](./202-sms-integration/plan.md) | 跨工程落地 |

---

## 四、模块编号一览

| 编号 | 模块名 | 英文名 | 分类 |
|------|--------|--------|------|
| 002 | 用户注册及登录 | user-auth | 用户认证 |
| 004 | 多语言国际化支持 | i18n | 基础设施 |
| 005 | 主题皮肤支持 | theme | 基础设施 |
| 202 | 短信平台 API 对接 | sms-integration | 基础设施 |

> 编号与 `docs/` 设计文档一一对应。001（应用外壳）属于各子工程的工程脚手架模块，不在父工程产品功能模块范围。

> **桌面工作台（独立产品线）**：`tpl-desktop` / `tpl-desktop-plugin-demo` 使用桌面线自有模块编号（`001`~`401`、`006`/`007` 及 `001`~`004`），与上表编号相互独立，不纳入父工程产品功能模块编号。详见各自 `specs/README.md`。

---

## 五、模块文档结构规范

每个模块目录 `NNN-name/` 下包含以下标准文档：

| 文件 | 命名 | 说明 |
|------|------|------|
| 功能规格 | `spec.md` | 技术无关的功能需求、用户故事、验收标准（WHAT/WHY） |
| 技术方案 | `plan.md` | 跨工程技术落地、接口契约、实现策略（HOW） |

---

## 六、关联工程文档导航

### 6.1 产品设计文档（docs/）

| 文档 | 路径 | 说明 |
|------|------|------|
| 产品概念设计 | [../docs/产品概念设计.md](../docs/产品概念设计.md) | 框架定位、能力全景、核心决策 |
| 技术选型 | [../docs/技术选型.md](../docs/技术选型.md) | 全产品线技术栈 |
| 数据模型设计 | [../docs/数据模型设计.md](../docs/数据模型设计.md) | 数据库表结构、字典 |
| 设计系统 | [../DESIGN.md](../DESIGN.md) | 设计系统 |
| 部署指南 | [../deploy/README.md](../deploy/README.md) | Docker Compose 部署 |

### 6.2 子工程 specs

| 子工程 | 规范文档索引 |
|--------|-------------|
| tpl-app-api | [../tpl-app-api/specs/README.md](../tpl-app-api/specs/README.md) |
| tpl-app-web | [../tpl-app-web/specs/README.md](../tpl-app-web/specs/README.md) |
| tpl-manage | [../tpl-manage/specs/README.md](../tpl-manage/specs/README.md) |
| tpl-manage-ui | [../tpl-manage-ui/specs/README.md](../tpl-manage-ui/specs/README.md) |
| tpl-app-android | [../tpl-app-android/specs/README.md](../tpl-app-android/specs/README.md) |
| tpl-app-harmony | [../tpl-app-harmony/specs/README.md](../tpl-app-harmony/specs/README.md) |
| tpl-app-mini | [../tpl-app-mini/specs/README.md](../tpl-app-mini/specs/README.md) |
| tpl-desktop | [../tpl-desktop/specs/README.md](../tpl-desktop/specs/README.md) |
| tpl-desktop-plugin-demo | [../tpl-desktop-plugin-demo/specs/README.md](../tpl-desktop-plugin-demo/specs/README.md) |
| RuoYi-Vue-Plus | [../RuoYi-Vue-Plus/specs/README.md](../RuoYi-Vue-Plus/specs/README.md) |
| RuoYi-Vue-Plus-UI | [../RuoYi-Vue-Plus-UI/specs/README.md](../RuoYi-Vue-Plus-UI/specs/README.md) |

---

## 七、快速导航

| 目标读者 | 推荐阅读顺序 |
|---------|-------------|
| **新加入开发者** | constitution.md → STRUCTURE.md → overall-spec.md → 具体模块 spec.md |
| **架构师 / Tech Lead** | ARCHITECTURE.md → TECH.md → overall-plan.md → overall-data-model.md |
| **后端开发** | overall-data-model.md → 对应模块 plan.md → 子工程 specs |
| **前端开发** | STRUCTURE.md → 对应模块 spec.md + plan.md → 子工程 specs |
| **产品经理** | overall-spec.md → 对应模块 spec.md |
| **测试 / QA** | overall-spec.md → SPECS_CHECKLIST.md → 子工程 test-cases.md |

---

**文档维护者：** tpl-workspace 开发团队
