# tpl-workspace 整体技术方案

> 项目：tpl-workspace（多端业务应用框架 · 父工程）
> 版本：v1.0
> 日期：2026-08-22
> 类型：系统级技术方案（HOW，跨工程落地视角）

---

## 一、技术上下文

### 1.1 工程拓扑

tpl-workspace 由 **12 个子工程** 组成，分属四类角色：

| 角色 | 子工程 | 运行时 |
|------|--------|--------|
| 上游框架（不编译） | RuoYi-Vue-Plus、RuoYi-Vue-Plus-UI | 被引用 |
| 管理后台 | tpl-manage、tpl-manage-ui | Spring Boot 4.1 + Vue3/Element Plus |
| 用户侧 | tpl-app-api、tpl-app-web、tpl-app-android、tpl-app-harmony、tpl-app-mini、tpl-website | Spring Boot 4.1.0 + 多端 + 静态官网 |
| 桌面工作台（前端门户） | tpl-desktop、tpl-desktop-plugin-demo | 整体平台前端门户，纯前端 wujie 微前端（宿主 + 插件子应用） |

### 1.2 双后端策略

```
用户侧链路：tpl-app-web/android/harmony/mini ──▶ tpl-app-api（轻量 JWT）──▶ PostgreSQL/Redis
管理端链路：tpl-manage-ui ──▶ tpl-manage（完整 RBAC，聚合 RVP）──▶ PostgreSQL/Redis/MinIO
```

| 维度 | tpl-app-api | tpl-manage |
|------|-----------|-----------|
| 构建 | 独立 Maven 工程 | Maven 聚合 RVP（级联编译） |
| 认证 | Sa-Token JWT（仅登录态） | Sa-Token + 完整 RBAC |
| 依赖 | 参考 RVP 不引入 | 全量 RVP 模块 |
| 端口 | 8082 | 8081 |
| 包名 | `org.fellow99.tpl.appapi` | `org.fellow99.tpl.manage` |

---

## 二、宪法合规检查

| 原则 | 实现情况 |
|------|---------|
| 框架继承不复制 | tpl-manage Maven 聚合、tpl-manage-ui alias 继承 ✅ |
| sys_* 零修改 | 业务表全 `tpl_*`，视图 `tpl_*_view` ✅ |
| 命名规范 | 全产品线统一 `tpl_*` / `org.fellow99.tpl` / `/api/` ✅ |
| 模块编号对齐 | 002 全端一致 ✅ |
| 数据库共享隔离 | 双后端共享 `tpl_manage` 库，命名空间隔离 ✅ |
| 软删除审计字段 | `tpl_*` 表统一 `id/create_time/update_time/del_flag` ✅ |
| 设计系统统一 | tpl-app-web 完整遵循，多端脚手架阶段 ⚠️ |
| 安全基线 | JWT 密钥硬编码待改（各子工程已知问题）⚠️ |
| 构建部署一致 | docker-compose 统一编排 ✅ |

---

## 三、关键实现策略

### 3.1 用户数据扩展（sys_user + tpl_user_profile + 视图）

```
sys_user（RuoYi 标准表，不改）──1:1──▶ tpl_user_profile（扩展：birth_date）
                                              │
                                              ▼ (JOIN)
                                     tpl_user_view（查询视图）
```

- 注册：同一事务写 `sys_user` + `tpl_user_profile`
- 登录读取：查 `tpl_user_view` 一次获取全部字段
- 第三方绑定：复用 `sys_social` 表

### 3.2 认证与授权

| 端 | 方案 |
|----|------|
| 用户侧 | Sa-Token JWT，Token 有效期 30 天，Redis 会话存储 |
| 管理端 | Sa-Token 完整 RBAC（角色-菜单-按钮三级） |

- 三种登录方式：密码登录、短信免密登录、微信登录（复用 sys_social）
- AES+RSA 混合加密传输敏感请求（登录/注册/修改密码）

### 3.3 前端架构

| 端 | 架构 | 关键点 |
|----|------|--------|
| tpl-app-web | 纯 CSS + Design Tokens | 无 UI 框架，`src/style.css` 集中定义 |
| tpl-manage-ui | alias 继承 RVP-UI | `@plus-ui` alias + 视图覆盖 + barrel re-export |
| Android | MVVM | Fragment + ViewModel + Repository + Retrofit |
| HarmonyOS | HAP+HAR 多模块 | Stage Model + ArkUI + AppStorage 状态共享 |
| 小程序 | glass-easel Component | Skyline 渲染 + wx.request 封装 |
| tpl-desktop | wujie 宿主 + Composition 单例 | 多页面桌面 + GridStack + import.meta.glob 注册 |
| tpl-desktop-plugin-demo | wujie 子应用 | import.meta.glob 零代码注册 + plugin:ready 事件 |

---

## 四、横切关注点

### 4.1 错误处理

- 统一响应格式 `{code, msg, data}`（code=200 成功 / 500 异常）
- 各子工程需补充全局异常处理器（当前缺失，已知问题）

### 4.2 数据字典

- 复用 RuoYi `sys_dict_type` / `sys_dict_data` 表
- 前端通过 `GET /system/dict/data/type/{dictType}` 获取

### 4.3 文件存储

- MinIO 统一对象存储
- 用户头像等文件
- Bucket：`tpl-manage`

---

## 五、测试策略

| 层 | 策略 | 状态 |
|----|------|------|
| tpl-app-api | JUnit 5 + Mockito 单元测试 | ⚠️ 无测试目录 |
| tpl-app-web | vue-tsc 类型检查 + 测试用例文档 | ✅ 测试用例文档已编写 |
| tpl-manage | RVP 自带单测 + 构建验证 | ✅ 构建验证 |
| 多端 | 各端测试用例文档 | ✅ 文档已编写，代码待实现 |
| 集成 | Playwright 端到端（注册→登录→个人中心） | 规划中 |

**端到端验收标准**：
1. 注册用户完成
2. 使用注册用户名密码登录完成
3. 个人中心能展示当前用户信息

---

## 六、部署策略

### 6.1 部署架构

见 [ARCHITECTURE.md](./ARCHITECTURE.md) 第四节。核心：Nginx 总网关（38088）→ 路由分发 → 后端（tpl-manage 38081 / tpl-app-api 38082）+ 前端 SPA。

### 6.2 构建流程

| 服务 | 构建方式 | 产物 |
|------|---------|------|
| tpl-manage | Maven 多阶段（级联编译 RVP 41 模块） | Spring Boot fat jar（~208MB） |
| tpl-manage-ui | pnpm → vite build | dist 静态 + Nginx |
| tpl-app-api | Maven 多阶段 | Spring Boot fat jar |
| tpl-app-web | pnpm → vite build | dist 静态 + Nginx |

### 6.3 环境配置

- 后端 Spring Profile：`dev`（本地）/ `docker`（容器）
- docker profile 关键差异：数据源用服务名 `postgres`/`redis`，关闭非必需服务（邮件/短信/snail-job）
- 环境变量统一在 `deploy/.env`

---

## 七、已知风险与改进项

| # | 风险 | 严重度 | 建议 |
|---|------|:--:|------|
| R-001 | JWT 密钥硬编码弱密钥（tpl-app-api + tpl-manage） | 高 | 环境变量注入强随机密钥 |
| R-002 | 无自动化测试（tpl-app-api 无 src/test） | 中 | 补充单元/集成测试 |
| R-003 | 无全局异常处理器 | 低 | @ControllerAdvice 统一处理 |
| R-004 | 多端（android/harmony/mini）仅脚手架 | 中 | 按各端 specs 逐步实现 |
| R-005 | 容器默认密码/端口暴露 | 高 | 生产环境修改 `.env` + 防火墙 |

---

## 八、推进路径（三阶段）

### Phase 1 — MVP（当前）

- tpl-app-api + tpl-app-web：注册、登录
- tpl-manage + tpl-manage-ui：管理后台框架落地（登录 + RVP 全能力）

### Phase 2 — 功能扩展

- 短信/微信登录完善
- 多端应用外壳完善

### Phase 3 — 多平台覆盖

- Android / HarmonyOS / 微信小程序
- 业务域功能由框架使用方扩展
