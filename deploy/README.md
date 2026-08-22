# tpl-workspace 部署指南


---

## 架构概览

```
                        ┌──────────────────────────────┐
                        │       Nginx 总网关 :80        │
                        │   (反向代理 + 负载均衡)        │
                        └──────┬────────────┬──────────┘
                               │            │
                  /api/*       │            │       /
                  ┌────────────┘            └──────────┐
                  ▼                                    ▼
        ┌─────────────────┐                ┌──────────────────┐
        │   tpl-manage     │                │   tpl-manage-ui   │
        │  Spring Boot    │                │   Vue SPA :80    │
        │     :8081       │                │   (Nginx 静态)    │
        └────────┬────────┘                └──────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
  ┌──────────┐     ┌──────────┐
  │PostgreSQL│     │  Redis   │
  │  :5432   │     │  :6379   │
  └──────────┘     └──────────┘

        ┌─────────────────┐          ┌──────────────────┐
        └─────────────────┘          └──────────────────┘
```

| 服务 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| **postgres** | `postgres:18-alpine` | 35432 | 业务数据库 `tpl_manage` |
| **redis** | `redis:8-alpine` | 36379 | 缓存 + Session |
| **tpl-manage** | 多阶段构建产物 | 38081 | Spring Boot 3.x 管理后台服务 |
| **tpl-manage-ui** | 多阶段构建产物 | 80(内部) | Vue 3 + Element Plus 前端 SPA |
| **tpl-app-api** | 多阶段构建产物 | 38082 | 核心业务后端服务 |
| **tpl-app-web** | 多阶段构建产物 | 80(内部) | 用户端 Vue SPA |
| **nginx** | `nginx:latest` | **38088** | 总网关，反向代理分发 |

---

## 前置要求

| 软件 | 最低版本 | 说明 |
|------|---------|------|
| Docker Desktop | 24.0+ | 需启用 BuildKit（默认开启） |
| 磁盘空间 | ≥ 10 GB | 含镜像、数据卷、构建缓存 |
| 内存 | ≥ 8 GB | 推荐 16 GB 以加速 Maven 构建 |

> **注意**: 首次构建需要下载 Maven 依赖（约 500 MB），请确保网络通畅。

---

## 快速开始

### 1. 启动全部服务

```bash
# 在项目根目录执行
docker compose -f deploy/docker-compose.yml up --build -d
```

首次构建流程：
1. **tpl-manage**: 下载 Maven 镜像 → 编译 RuoYi-Vue-Plus（约 41 个模块）→ 编译 tpl-manage-admin → 打包 Spring Boot fat jar（约 208 MB）
2. **tpl-manage-ui**: 下载 Node 镜像 → pnpm install → vite build → 生成 dist 静态文件 → 打包 Nginx 镜像

> **预计首次构建时间**: 10 ~ 30 分钟（取决于网络和 CPU）

### 2. 查看服务状态

```bash
docker compose -f deploy/docker-compose.yml ps
```

健康状态检查:

```bash
# 检查 PostgreSQL
docker exec tpl-postgres pg_isready -U postgres -d tpl_manage

# 检查 Redis
docker exec tpl-redis redis-cli ping

# 检查 tpl-manage Actuator
curl http://localhost:38081/actuator/health

# 检查 tpl-app-api Actuator
curl http://localhost:38082/actuator/health


# 检查 tpl-manage-ui
curl -I http://localhost:38088/manage/
```

### 3. 访问地址

| 地址 | 说明 |
|------|------|
| http://localhost:38088/manage/ | tpl-workspace 管理后台登录页 |
| http://localhost:38088/web/ | tpl-workspace 用户端 SPA |
| http://localhost:38081/actuator/health | 管理后端健康检查 |
| http://localhost:38082/actuator/health | 用户侧后端健康检查 |
| http://localhost:38082/auth/code | 图形验证码接口 |

### 4. 查看日志

```bash
# 查看所有服务日志
docker compose -f deploy/docker-compose.yml logs -f

# 查看特定服务日志
docker compose -f deploy/docker-compose.yml logs -f tpl-manage
docker compose -f deploy/docker-compose.yml logs -f tpl-manage-ui
docker compose -f deploy/docker-compose.yml logs -f tpl-app-api
docker compose -f deploy/docker-compose.yml logs -f nginx
```

### 5. 停止服务

```bash
# 停止所有服务（保留数据卷）
docker compose -f deploy/docker-compose.yml down

# 停止并删除数据卷（⚠️ 数据将丢失）
docker compose -f deploy/docker-compose.yml down -v
```

### 6. 数据库初始化

数据库表结构会在 PostgreSQL 容器**首次启动时自动完成**，无需手动操作。

初始化脚本位于 `deploy/sql/01-init-db.sh`，按依赖顺序自动加载：
1. `postgres_ry_vue.sql` — 核心系统表 (用户/角色/菜单/部门等)
2. `postgres_ry_job.sql` — 定时任务调度表
3. `postgres_ry_ai.sql` — AI 模块表
4. `postgres_ry_workflow.sql` — 工作流引擎表

> **验证初始化结果**:
> ```bash
> docker logs tpl-postgres | grep -A2 "initialization"
> # 或直接查看表
> docker exec tpl-postgres psql -U postgres -d tpl_manage -c "\dt"
> ```

> **⚠️ 重新初始化**: 如需重新初始化数据库，删除数据卷后重启：
> ```bash
> docker compose -f deploy/docker-compose.yml down -v
> docker compose -f deploy/docker-compose.yml up -d
> ```

---

## 配置说明

### 环境变量

环境变量统一放在 `deploy/.env` 文件中，由 docker compose 自动加载（shell 环境变量优先级高于 `.env`）。核心变量：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `POSTGRES_DB` | `tpl_manage` | 数据库名 |
| `POSTGRES_USER` | `postgres` | 数据库用户 |
| `POSTGRES_PASSWORD` | `postgres` | 数据库密码 |
| `REDIS_PASSWORD` | `postgres` | Redis 密码 |


> **生产环境**: 务必修改默认密码，移除端口对外暴露（`ports` 中的 `35432:5432` 和 `36379:6379`），或通过防火墙限制访问。



| 文件/目录 | 说明 |
|-----------|------|



### Spring Profile

项目使用 `docker` profile 运行，对应配置文件：`tpl-manage-admin/src/main/resources/application-docker.yml`

关键差异（vs `dev` profile）：
- 数据源连接: 使用 Docker 服务名 `postgres` 替代 `localhost`
- Redis 连接: 使用 Docker 服务名 `redis` 替代 `localhost`
- 关闭非必需服务: 邮件、短信、snail-job、snail-ai

### 数据持久化

| 数据卷 | 用途 | 路径 |
|--------|------|------|
| `pgdata` | PostgreSQL 数据文件 | Docker 管理 |
| `redisdata` | Redis RDB/AOF | Docker 管理 |
| `tpl-manage-logs` | 应用日志 | Docker 管理 |
| `tpl-app-api-logs` | 应用日志 | Docker 管理 |
| `nginx-logs` | Nginx 访问日志 | Docker 管理 |

---

## 目录结构

```
deploy/
├── docker-compose.yml       # 服务编排主文件
├── .env                     # 环境变量（密码 / API Key，docker compose 自动加载）
├── Dockerfile.tpl-manage     # 后端多阶段构建 (Maven → JRE)
├── Dockerfile.tpl-manage-ui  # 前端多阶段构建 (pnpm → Nginx)
├── Dockerfile.tpl-app-api    # 核心业务后端多阶段构建
├── Dockerfile.tpl-app-web    # 用户端前端多阶段构建
├── nginx/
│   ├── nginx.conf           # Nginx 总网关配置 (路由分发)
│   └── tpl-manage-ui.conf    # 前端容器内部 Nginx 配置 (SPA 服务)
├── sql/
└── README.md                # 本文件
```

> Dockerfile 与 `.dockerignore` 现已统一归档到 `deploy/` 目录（`docker-compose.yml` 中通过 `dockerfile: deploy/Dockerfile.tpl-*` 引用，`context` 保持仓库根目录 `..`）。

---

## 常见问题

### 1. Maven 构建失败

**现象**: `Could not resolve dependencies` 或 下载超时

**解决**:
```bash
# 方法1: 重试（网络问题通常自愈）
docker compose -f deploy/docker-compose.yml build --no-cache tpl-manage

# 方法2: 使用国内镜像（已经在 pom.xml 中配置华为云镜像）
# 如果仍然失败，检查 Docker 网络：
docker run --rm maven:3.9-eclipse-temurin-21 mvn --version
```

### 2. pnpm 构建失败

**现象**: `failed to resolve import` 从 `@plus-ui/` 路径

**解决**: 确保 `RuoYi-Vue-Plus-UI` 目录存在且未在 `.dockerignore` 中排除。

### 3. 端口冲突

**现象**: `port is already allocated`

**解决**:
```bash
# 检查端口占用
netstat -ano | findstr :38088
netstat -ano | findstr :38081

# 修改 docker-compose.yml 中的端口映射，例如：
#   ports:
#     - "8082:8081"  # 将宿主机端口改为 8082
```

### 4. 数据库连接失败

**现象**: `Connection refused` 或 `Unable to connect to postgres`

**解决**: 检查服务启动顺序和健康检查：
```bash
# 查看 PostgreSQL 日志
docker logs tpl-postgres

# 手动测试连接
docker exec tpl-postgres psql -U postgres -d tpl_manage -c "SELECT 1;"
```

### 5. 清理重建

```bash
# 完全清理并重建
docker compose -f deploy/docker-compose.yml down -v
docker compose -f deploy/docker-compose.yml build --no-cache
docker compose -f deploy/docker-compose.yml up -d
```

---

## 版本信息

| 组件 | 版本 |
|------|------|
| tpl-manage | 1.0.0-SNAPSHOT |
| RuoYi-Vue-Plus | 6.0.0 |
| Spring Boot | 4.1.0 |
| JDK | 21 (Eclipse Temurin) |
| PostgreSQL | 18-alpine |
| Redis | 8-alpine |
| Node.js | 24-alpine |
| pnpm | 10.34.5 |
| Vue | 3.5.40 |
| Nginx | alpine (latest) |
