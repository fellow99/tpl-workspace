# tpl-workspace 整体架构

> 项目：tpl-workspace（多端业务应用框架 · 父工程）
> 版本：v1.0
> 日期：2026-08-22

---

## 一、架构总览

tpl-workspace 是一个 **多工程聚合的业务应用框架**，采用「管理后台继承成熟框架 + 用户侧独立轻量」的双轨架构，通过 Docker Compose 统一编排部署。

```
┌──────────────────────────────────────────────────────────────────┐
│                         客户端层（Client）                        │
│  tpl-app-web      tpl-app-android    tpl-app-harmony   tpl-app-mini   │
│  (Vue3+TS)       (Kotlin)          (ArkTS)          (微信小程序)   │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS REST（Sa-Token JWT）
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Nginx 总网关（:80，宿主机 38088）              │
│        /web/* → tpl-app-web   /tpl-manage-ui → tpl-manage-ui        │
│        /api/*、/auth/* → tpl-app-api   /admin/* → tpl-manage       │
└───────────┬───────────────────────────┬──────────────────────────┘
            │                           │
            ▼                           ▼
┌───────────────────────┐   ┌──────────────────────────────────────┐
│   tpl-app-api :8082     │   │        tpl-manage :8081               │
│   Spring Boot 4.1.0    │   │   Spring Boot 4.1（RuoYi-Vue-Plus）  │
│   JDK 21 / 独立工程     │   │   JDK 21 / Maven 聚合 RVP            │
│                        │   │                                      │
│   · 用户注册/登录        │   │   · 用户管理 / 角色权限               │
│   · 个人中心           │   │   · 数据字典 / 系统配置              │
│                        │   │   · 继承 RVP 全部模块                │
└───────────┬───────────┘   └───────────┬──────────────────────────┘
            │                           │
            └───────────┬───────────────┘
                        ▼
        ┌───────────────┴──────────────────────────┐
        │               数据层                      │
        │  PostgreSQL(业务数据)  Redis(缓存/会话)     │
        │  MinIO(文件存储)                          │
        └──────────────────────────────────────────┘
```

---

## 二、子工程依赖关系

### 2.1 继承关系（不复制源码）

```
RuoYi-Vue-Plus (后端框架 v6.0.0)          RuoYi-Vue-Plus-UI (前端框架 v6.0.0)
       │ Maven <modules> 聚合                     │ @plus-ui alias
       ▼                                          ▼
   tpl-manage (管理后端)    ── REST API ──▶   tpl-manage-ui (管理前端)
```

| 工程 | 继承方式 | 定制比例 |
|------|---------|---------|
| tpl-manage | `pom.xml` 通过 `<modules>` 逻辑聚合 RVP，`scanBasePackages` 双包扫描 | 少量自定义 Java 文件 |
| tpl-manage-ui | Vite `@plus-ui` alias 指向 RVP-UI `src`，视图覆盖 + barrel re-export | 约 15% 定制 |

### 2.2 独立关系

```
tpl-app-api (独立 Spring Boot)  ◀──参考技术选型──  RuoYi-Vue-Plus
       ▲                                          （不引入依赖）
       │ REST API
       ├── tpl-app-web   (Vue3 用户端)
       ├── tpl-app-android (Kotlin)
       ├── tpl-app-harmony (ArkTS)
       └── tpl-app-mini   (微信小程序)
```

### 2.3 数据库共享

tpl-app-api 与 tpl-manage **共享同一 PostgreSQL 数据库**（`tpl_manage`），通过命名空间隔离：

| 命名空间 | 归属 | 说明 |
|---------|------|------|
| `sys_*` | RuoYi 标准表 | 用户/角色/菜单/字典等，**不做修改** |
| `tpl_*` | 业务表 | 用户扩展等 |
| `tpl_*_view` | 业务视图 | 糅合 RuoYi 表与业务表 |

---

## 三、数据流

### 3.1 用户侧核心流程（注册 → 登录 → 个人中心）

```
用户注册（tpl-app-web / 多端）
    │
    ▼
1. POST /auth/register（tpl-app-api）
   → 校验图形验证码 → 短信验证码（短信登录时）
   → 写 sys_user + tpl_user_profile
    │
    ▼
2. POST /auth/login（tpl-app-api）
   → 密码 / 短信 / 微信 三种方式
   → 签发 JWT Token
    │
    ▼
3. GET /system/user/getInfo（tpl-app-api）
   → 查询 tpl_user_view（token 续期）
    │
    ▼
4. 进入个人中心，展示用户信息
```

### 3.2 管理后台流程

```
管理员（tpl-manage-ui）
    │ REST API（Sa-Token RBAC）
    ▼
tpl-manage（继承 RVP 全部能力）
    ├── 用户管理 → sys_user + tpl_user_profile
    ├── 数据字典 → sys_dict_type / sys_dict_data
    └── 系统配置 → sys_config
```

### 3.3 服务间通信

| 调用方向 | 方式 | 说明 |
|---------|------|------|
| 客户端 → tpl-app-api | REST（Sa-Token JWT） | 用户侧业务请求 |
| 客户端 → tpl-manage | REST（Sa-Token RBAC） | 管理后台请求 |
| tpl-manage/tpl-app-api → PostgreSQL | JDBC | 共享业务数据库 |
| tpl-manage/tpl-app-api → Redis | Redisson/Lettuce | 缓存/会话/验证码 |

---

## 四、部署拓扑（Docker Compose）

```
                          ┌─────────────────────┐
                          │   nginx :38088→80   │
                          │   (总网关/反向代理)   │
                          └──────┬──────────────┘
                ┌────────────────┼────────────────┐
                │                │                │
       ┌────────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
       │ tpl-manage-ui  │  │ tpl-app-web  │  │ 后端路由分发  │
       │ (SPA 内部80)   │  │ (SPA 内部80) │  └──────┬──────┘
       └───────────────┘  └─────────────┘         │
                                  ┌───────────────┼───────────────┐
                          ┌───────▼──────┐  ┌─────▼─────┐
                          │  tpl-manage   │  │ tpl-app-api │
                          │  :38081→8081 │  │:38082→8082 │
                          └──────┬───────┘  └─────┬──────┘
                                 │                │
                     ┌───────────┴────────────────┴───────────┐
                     │                                          │
             ┌───────▼──────┐                    ┌──────────────▼────────┐
             │  postgres    │                    │        redis           │
             │ :35432→5432  │                    │      :36379→6379       │
             └──────────────┘                    └────────────────────────┘
```

### 服务清单

| 服务 | 镜像 | 宿主机端口 | 容器端口 | 依赖 |
|------|------|-----------|---------|------|
| postgres | postgres:18-alpine | 35432 | 5432 | — |
| redis | redis:8-alpine | 36379 | 6379 | — |
| tpl-manage | 多阶段构建 | 38081 | 8081 | postgres、redis |
| tpl-manage-ui | 多阶段构建 | — | 80 | tpl-manage |
| tpl-app-api | 多阶段构建 | 38082 | 8082 | postgres、redis |
| tpl-app-web | 多阶段构建 | — | 80 | tpl-app-api |
| nginx | nginx:latest | 38088 | 80 | 上述全部 |

### 数据卷

| 卷名 | 用途 |
|------|------|
| pgdata | PostgreSQL 数据文件 |
| redisdata | Redis RDB/AOF |
| tpl-manage-logs / tpl-app-api-logs | 应用日志 |
| nginx-logs | Nginx 访问日志 |

---

## 五、关键架构决策

| 决策项 | 结论 | 理由 |
|--------|------|------|
| 双后端拆分 | tpl-app-api（用户侧）+ tpl-manage（管理侧） | 职责隔离，用户侧无需 RBAC 复杂度 |
| 框架继承 | 不修改 RVP 源码，Maven 聚合 + alias 引用 | 框架可升级，业务可扩展 |
| RuoYi 表隔离 | `sys_*` 不改，业务用 `tpl_*` | 避免连锁改动，便于框架升级 |
| 数据共享 | 双后端共享 PostgreSQL + Redis | 减少运维复杂度，MVP 阶段单库 |
| 数据库选型 | PostgreSQL（非 RVP 原生 MySQL） | 与框架统一，支持 JSONB/tsvector |
| 认证策略 | 用户侧 JWT 轻量，管理端 RBAC 完整 | 用户侧无需组织架构与角色 |
| 前端双轨 | 用户侧纯 CSS 定制，管理端 Element Plus | 用户侧需品牌差异化，管理端求效率 |

---

## 六、模块与子工程映射

| 产品功能模块 | tpl-app-api | tpl-app-web | tpl-manage | tpl-manage-ui | 多端（android/harmony/mini） |
|-------------|-----------|-----------|-----------|-------------|---------------------------|
| 002 用户注册登录 | ✅ 已实现 | ✅ 已实现 | ✅ 登录 | ✅ 登录 | 脚手架/规划 |
