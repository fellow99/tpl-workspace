# tpl-workspace 宪法原则

> 项目：tpl-workspace（多端业务应用框架 · 父工程）
> 版本：v1.0
> 日期：2026-08-22

---

## 一、文档说明

本宪法是「tpl-workspace」产品线的**产品线级开发原则**，从现有代码与文档中提取的、跨子工程共同遵守的约束。各子工程另有各自的 `constitution.md`，本宪法定义的是**跨工程不可违反的底线原则**。

---

## 二、核心原则

### 原则 1：框架继承，不复制源码（Inherit, Not Fork）

**声明**：tpl-manage / tpl-manage-ui 必须通过依赖/引用机制继承上游框架，**禁止**修改或复制 RuoYi-Vue-Plus / RuoYi-Vue-Plus-UI 的源代码。

- tpl-manage 通过 Maven `<modules>` 聚合 RVP，`scanBasePackages` 双包扫描
- tpl-manage-ui 通过 Vite `@plus-ui` alias 引用 RVP-UI `src`
- 定制代码独立维护在 `org.fellow99.tpl` / `src/` 命名空间

**理由**：上游框架可独立升级，业务代码与框架代码解耦，避免 fork 导致的技术债。

### 原则 2：RuoYi 标准表零修改（sys_* Frozen）

**声明**：RuoYi-Vue-Plus 标准表（`sys_user`、`sys_role`、`sys_menu`、`sys_dict_type`、`sys_dict_data`、`sys_config`、`sys_social`、`sys_client` 等）**不做任何 DDL 修改**。

- 业务扩展统一通过 `tpl_*` 表实现
- 业务查询通过 `tpl_*_view` 视图糅合标准表与业务表
- 业务字典通过 INSERT 新的 `tpl_*` 前缀字典类型扩展

**理由**：保证框架可平滑升级，业务数据与框架数据物理隔离。

### 原则 3：命名规范统一（Naming Convention）

| 类型 | 规范 | 示例 |
|------|------|------|
| 业务表 | `tpl_<功能名>`，全小写下划线 | `tpl_user_profile` |
| 业务视图 | `tpl_<功能名>_view` | `tpl_user_view` |
| 后端包名 | `org.fellow99.tpl.<模块>` | `org.fellow99.tpl.appapi` |
| API 路径 | `/api/<模块>/<操作>` | `/auth/login` |
| 模块英文名 | camelCase | `userAuth` |

### 原则 4：模块编号跨端对齐（Module ID Alignment）

**声明**：同一产品功能在**所有子工程**使用一致的模块编号，保证跨端可追溯。

| 编号 | 模块 | 全端一致 |
|------|------|---------|
| 001 | 应用外壳 | tpl-app-web / android / harmony / mini |
| 002 | 用户注册及登录 | 全部业务子工程 |

### 原则 5：数据库共享与隔离（Shared DB, Isolated Namespace）

**声明**：tpl-app-api 与 tpl-manage 共享同一 PostgreSQL 数据库（`tpl_manage`），通过命名空间（`sys_*` vs `tpl_*`）隔离。

- 用户侧业务表由 tpl-app-api 读写
- 管理侧业务表由 tpl-manage 读写
- 跨域数据（如用户）通过视图 `tpl_user_view` 统一访问

### 原则 6：软删除与审计字段（Soft Delete & Audit Fields）

**声明**：所有 `tpl_*` 业务表必须包含标准字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT | 主键（独立业务表） |
| `create_time` | DATETIME | 创建时间 |
| `update_time` | DATETIME | 更新时间 |
| `del_flag` | CHAR(1) | 软删除标记（`0` 正常 / `2` 删除） |

- 禁止 CASCADE DELETE，统一软删除
- 查询时全局过滤 `del_flag = '0'`

### 原则 7：设计系统统一（Unified Design System）

**声明**：用户侧（tpl-app-web / android / harmony / mini）遵循 `DESIGN.md` 设计系统。

- 色彩：靛青 `#3B5998` / 金曦 `#E8923C` / 青绿 `#4AA878` / 朱砂 `#D94E3C`
- 管理后台（tpl-manage-ui）沿用 RuoYi 默认主题，但共享色彩语义

### 原则 8：安全基线（Security Baseline）

| 约束 | 说明 |
|------|------|
| JWT 密钥 | 生产环境必须通过环境变量注入强随机密钥，禁止硬编码弱密钥 |
| 密码存储 | 统一 BCrypt 加密 |
| 传输加密 | 登录/注册请求走 AES+RSA 加密通道 |
| 验证码 | 生产环境必须启用图形验证码 |
| 容器密码 | 生产环境修改默认密码，移除对外暴露的数据库/缓存端口 |
| 密钥注入 | 所有 publicKey/privateKey/secret/password 禁止硬编码，只能通过环境变量注入（详见原则 8.1） |

### 原则 8.1：密钥与 .env 治理（Key & .env Governance）

**声明**：所有敏感配置（`publicKey` / `privateKey` / `secret` / `password`）禁止以明文硬编码在任何配置文件中，只能通过环境变量（或 `.env` 文件）注入。

**规则**：

| # | 规则 | 说明 |
|---|------|------|
| 1 | 配置文件零硬编码密钥 | `application.yml` / `application-*.yml` 中的 `publicKey` / `privateKey` / `secret` / `password` / `jwt-secret-key` / `client-secret` / `access-key-secret` 等字段 MUST 使用 `${ENV_NAME}` 占位符，禁止出现具体值 |
| 2 | 禁止硬编码默认值 | 环境变量占位符 MUST NOT 携带真实默认值（如 `${JWT_SECRET:abc123}` 中的 `abc123`）；默认值只能为空串 `${ENV_NAME:}` |
| 3 | Java 环境支持 .env | Spring Boot 后端（tpl-app-api / tpl-manage）MUST 支持从 `.env` 文件加载环境变量（如集成 `me.paulschwarz:spring-dotenv` 或等价机制），与前端各端 `.env` 治理对齐 |
| 4 | .env.sample 仅简单样例 | `.env.sample`（模板，提交仓库）中的密钥 MUST 仅使用简单占位样例（如 `changeMe`、`123456`、`your-secret-here`），禁止使用真实密钥 |
| 5 | .env 不提交仓库 | 开发环境、运行环境、docker 环境的 `.env`（含 `.env.development` / `.env.production` 等实际生效文件）MUST 加入 `.gitignore`，MUST NOT 提交到仓库 |
| 6 | 环境变量注入 | 实际密钥通过宿主环境变量或未提交的 `.env` 注入；docker 环境统一由 `deploy/.env` 注入（`deploy/.env` 已 gitignore） |

**参考**：
- `deploy/.env.sample` 为环境变量样例模板（仅简单占位值），`deploy/.env` 为本地实际配置（已 gitignore，不提交）。
- 前端各端构建时注入密钥的方式：web=`VITE_APP_*`、android=`buildConfigField`、harmony=`buildProfileFields`、mini=常量。

### 原则 9：构建与部署一致（Build & Deploy Consistency）

**声明**：所有子工程统一通过 `deploy/docker-compose.yml` 编排部署，环境变量统一放在 `deploy/.env`。

- 后端使用 `docker` Spring Profile
- 前端多阶段构建（pnpm → Nginx 静态）
- 服务依赖关系通过 `depends_on` + healthcheck 保证启动顺序

---

## 三、治理规则

### 3.1 修改上游框架

任何需要修改 RuoYi-Vue-Plus / RuoYi-Vue-Plus-UI 源码的需求，必须先在产品线层面评估，优先通过配置覆盖、继承扩展、独立模块解决，而非直接改源码。

### 3.2 新增业务模块

1. 在 `docs/` 编写模块设计文档（编号遵循 `NNN-模块名.md`）
2. 在父工程 `specs/` 建立对应模块目录（spec.md + plan.md）
3. 在各子工程 `specs/` 建立对应的实现文档
4. 业务表遵循 `tpl_*` 命名

### 3.3 新增子工程

1. 在 `docs/产品概念设计.md` 的「子工程清单」登记
2. 确定其模块编号对齐方案
3. 建立独立 `specs/` 文档目录
4. 纳入 `deploy/docker-compose.yml` 编排

---

## 四、文档分工治理规则

> 本规则定义「tpl-workspace」产品线中**父工程与各子工程规范文档的分工契约**，所有工程 MUST 遵守。它是各子工程 `constitution.md` 中「文档分工治理规则」章节的权威来源。

### 4.1 模块编号对齐

父工程的模块编号 MUST 与各子工程的模块编号对齐。同一产品功能（如 002 用户注册及登录）在父工程与所有相关子工程中使用一致的编号，确保跨工程可追溯。

### 4.2 父工程侧重需求规格

父工程的规范文档 MUST 主要描述**需求规格**，重点在 `spec.md`。父工程 `spec.md` 是产品功能需求的权威定义（WHAT/WHY），以 RFC 2119 语言描述功能需求（FR）、用户故事、验收场景，不涉及具体工程实现细节。

### 4.3 父工程模块 plan 侧重实现逻辑

父工程各模块的 `plan.md` MUST 主要描述模块功能的**实现逻辑**（跨工程落地视角），说明该功能在哪些子工程、以何种方式实现，而非单一工程的代码细节。

### 4.4 子工程侧重落地实现

各子工程的规范文档 MUST 主要描述模块功能在本工程中的**落地实现**，重点在 `plan.md`（实现方案）与 `test-cases.md`（测试用例），详细记录本工程的代码结构、技术实现与测试覆盖。

### 4.5 子工程 spec 引用父工程

各子工程的 `spec.md` SHOULD 引用父工程对应的 `spec.md`（作为需求规格基准），再补充本工程必要的特有规格，避免重复编写已在父工程定义的需求。

### 4.6 文档分工总览

| 层级 | 侧重点 | 核心文档 | 次要文档 |
|------|--------|---------|---------|
| 父工程 | 需求规格、实现逻辑 | `spec.md`、`plan.md` | — |
| 子工程 | 落地实现、测试 | `plan.md`、`test-cases.md` | `spec.md`（引用父工程） |

---

## 五、宪法合规检查（当前状态）

| 原则 | tpl-manage | tpl-manage-ui | tpl-app-api | tpl-app-web | 多端 |
|------|-----------|-------------|-----------|-----------|------|
| 1 框架继承不复制 | ✅ 聚合 | ✅ alias | ✅ 参考不依赖 | N/A | N/A |
| 2 sys_* 零修改 | ✅ | N/A | ✅ | N/A | N/A |
| 3 命名规范 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 模块编号对齐 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 数据库共享隔离 | ✅ | N/A | ✅ | N/A | N/A |
| 6 软删除审计字段 | ✅ | N/A | ✅ | N/A | N/A |
| 7 设计系统统一 | 部分（RuoYi 主题） | 部分 | N/A | ✅ | ⚠️ 脚手架 |
| 8 安全基线 | ⚠️ JWT 硬编码 | ⚠️ 默认密码 | ⚠️ JWT 硬编码 | N/A | N/A |
| 9 构建部署一致 | ✅ | ✅ | ✅ | ✅ | 部分 |

> 说明：`⚠️` 标记为 MVP 阶段已知待改进项，详见各子工程 README「已知问题」章节。

> **桌面工作台（前端门户）**：`tpl-desktop` / `tpl-desktop-plugin-demo` 为纯前端工程（无数据库、无后端、不依赖 RuoYi），故原则 1（框架继承）、2（sys_* 零修改）、5（数据库共享隔离）、6（软删除审计字段）、9（构建部署一致，未纳入 docker 编排）不适用（N/A）；原则 3（命名规范）、7（设计系统）、8（安全基线）部分适用。其各自合规状态见 `tpl-desktop/specs/constitution.md` 与 `tpl-desktop-plugin-demo/specs/constitution.md`。
