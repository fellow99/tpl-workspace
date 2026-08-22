# 用户注册及登录 技术方案（As-Built）

> 本文件为跨工程聚合技术方案，记录「tpl-workspace」用户模块在各子工程的实际落地方式。
> 模块：002-user-auth
> 对应规格：[spec.md](./spec.md)
> 更新日期：2026-08-13

---

## 1. 技术上下文

### 1.1 跨子工程落地

| 子工程 | 角色 | 实现状态 |
|--------|------|---------|
| tpl-app-api | 后端（认证服务） | ✅ 已实现 |
| tpl-app-web | 用户端 Web | ✅ 已实现 |
| tpl-manage | 管理后台后端 | ✅ 登录（简化版） |
| tpl-manage-ui | 管理后台前端 | ✅ 登录（品牌定制） |
| tpl-app-android / harmony / mini | 多端 | 📋 规划中 |

### 1.2 关键差异

| 维度 | tpl-app-api（用户端） | tpl-manage（管理端） |
|------|---------------------|-------------------|
| 认证模型 | Sa-Token JWT（仅登录态） | Sa-Token 完整 RBAC |
| 用户表 | sys_user + tpl_user_profile 扩展 | sys_user + RBAC 扩展 |
| 验证码 | 图形（支持开关） | 禁用（MVP） |
| 登录方式 | 密码（+短信/微信规划） | 用户名+密码 |

---

## 2. 宪法合规

- ✅ 原则 2：sys_user 零修改，业务字段进 tpl_user_profile
- ✅ 原则 3：表 `tpl_user_profile`、视图 `tpl_user_view`、包 `org.fellow99.tpl.appapi`
- ✅ 原则 6：扩展表含 create_time/update_time，用户表继承 RuoYi del_flag
- ⚠️ 原则 9：JWT 密钥硬编码（已知问题 I-001）

---

## 3. 数据模型

### 3.1 表结构

```
sys_user（RuoYi，不改）──1:1──▶ tpl_user_profile（扩展表）
                                     │ user_id UNIQUE FK
                                     │ birth_date
                                     ▼
                            tpl_user_view（视图，登录查询用）
```

### 3.2 读写策略

| 操作 | 目标 | 说明 |
|------|------|------|
| 注册 | sys_user + tpl_user_profile | 同一事务写两张表 |
| 登录读取 | tpl_user_view | 一次查询获取全部字段 |
| 修改信息 | sys_user + tpl_user_profile | 按字段归属写对应表 |

---

## 4. 接口契约（tpl-app-api）

### 4.1 公开接口（无需 Token）

| 方法 | 路径 | 说明 | 加密 |
|------|------|------|:--:|
| POST | `/auth/register` | 用户注册 | ✅ |
| POST | `/auth/login` | 统一登录 | ✅ |
| GET | `/auth/code` | 图形验证码 | — |
| GET | `/resource/sms/code` | 短信验证码 | — |

### 4.2 需 Token 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/logout` | 登出 |
| GET | `/system/user/getInfo` | 个人信息 |
| PUT | `/system/user/profile` | 修改信息 |
| PUT | `/system/user/password` | 修改密码 |

### 4.3 统一响应

```json
{ "code": 200, "msg": "success", "data": { "access_token": "..." } }
```

---

## 5. 实现策略（tpl-app-api）

### 5.1 三层架构

```
AuthController（/auth/*）──▶ AuthService（BCrypt + Redis 验证码）──▶ Mapper（MyBatis-Plus）
```

关键类：`AuthController`、`AuthService`、`CaptchaUtils`（图形验证码）、`SaTokenConfigure`（拦截器）、`CorsConfig`（跨域）。

### 5.2 注册流程

```
1. 注册开关检查（sys_config）
2. 图形验证码校验（Redis captcha_codes:{uuid}）
3. 用户名/手机号唯一性校验
4. BCrypt 加密密码
5. 同一事务写 sys_user + tpl_user_profile
```

### 5.3 登录流程

```
1. 校验 client + grantType（sys_client）
2. 校验图形验证码（Redis）
3. 查询 tpl_user_view
4. BCrypt.checkpw 校验
5. 登录错误限制（Redis 计数器）
6. StpUtil.login 签发 Token
7. 记录 login_ip/login_date
```

---

## 6. 前端实现（tpl-app-web）

### 6.1 页面结构

| 页面 | 路由 | 功能 |
|------|------|------|
| 登录页 | `/login` | 密码登录表单 + 图形验证码 |
| 注册页 | `/register` | 用户名/密码/验证码 |
| 个人中心 | `/profile` | 登录后首页 |

### 6.2 状态管理

`stores/user.ts`（Pinia）管理 token / userInfo，`router/index.ts` 全局路由守卫校验登录态。

### 6.3 请求封装

`api/index.ts`（axios 实例）请求拦截器注入 `Authorization`，响应拦截器统一处理 401 登出。`api/auth.ts` 封装登录/注册/验证码/登出接口。

---

## 7. 文件清单

| 子工程 | 关键文件 |
|--------|---------|
| tpl-app-api | `controller/AuthController.java`、`service/AuthService.java`、`util/CaptchaUtils.java`、`config/SaTokenConfigure.java`、`entity/UserView.java`、`entity/UserProfile.java` |
| tpl-app-web | `views/LoginPage.vue`、`views/RegisterPage.vue`、`stores/user.ts`、`api/auth.ts` |
| tpl-manage | `controller/AuthController.java`（简化登录）、`controller/CaptchaController.java` |
| tpl-manage-ui | `views/login.vue`、`views/register.vue`（品牌定制） |

---

## 8. 关联子工程规格

| 文档 | 路径 |
|------|------|
| tpl-app-api 认证规格 | `../tpl-app-api/specs/002-user-auth/spec.md` |
| tpl-app-web 认证规格 | `../tpl-app-web/specs/002-user-auth/spec.md` |
| tpl-manage 认证规格 | `../tpl-manage/specs/feature-121-tpl-auth/spec.md` |
| tpl-manage-ui 品牌定制 | `../tpl-manage-ui/specs/feature-123-branding/spec.md` |

---

## 9. 微信登录集成实现（跨工程落地）

> 技术设计详见 `docs/002-用户注册及登录设计-微信登录集成.md` §八。本节记录跨工程实现策略与关键决策。

### 9.1 落地矩阵

| 工程 | 实现 | 微信机制 | 后端 grantType | 参考源 |
|------|------|---------|:--:|------|
| tpl-app-api | social/xcx 策略 + 绑定接口 | `sns/oauth2/access_token` / `jscode2session` | — | RuoYi-Vue-Plus 后端 |
| tpl-app-web | 微信扫一扫登录 | `qrconnect`（scope=snsapi_login） | social（source=wechat_open） | RuoYi-Vue-Plus-UI |
| tpl-app-android | 微信登录（拉起） | OpenSDK `SendAuth.Req` | social（source=wechat_app） | — |
| tpl-app-harmony | 微信登录（拉起） | OpenSDK `SendAuthReq` | social（source=wechat_app） | — |
| tpl-app-mini | 微信一键登录 | `wx.login` → `jscode2session` | xcx | — |
| tpl-manage | 后端接口保留（不配 justauth） | — | — | 不动 |
| tpl-manage-ui | 删除第三方登录入口 | — | — | 删除 social-panel |

### 9.2 账号打通规则（关键决策）

- **身份锚点 = 手机号**（本系统「手机号即用户名」），`openid` 是挂在账号上的快捷登录凭证。
- `sys_social.auth_id = source + openid`（唯一），`source` ∈ {`wechat_open`(网站), `wechat_app`(移动), `wechat_xcx`(小程序)}，`union_id` 有则存（为未来 unionid 方案预留，无迁移成本）。
- 登录匹配顺序：`auth_id`（source+openid）→ 命中直接登录；social 未命中返回「未绑定」+openid；xcx 未命中经 `phoneCode` 换手机号后绑定/建号。
- **不依赖 unionid**（个人主体限制，见设计文档 §五.5 方案 C）。

### 9.3 tpl-app-api 实现要点

- 包名 **`org.fellow99.tpl.appapi`**（与 tpl-manage 的 `org.fellow99.tpl` 命名空间统一）。
- 依赖：`io.github.windtool:JustAuth:3.0.1`（windtool fork，依赖 Jackson 3，与 Spring Boot 4.1 兼容）。
- 新增类（`org.fellow99.tpl.appapi.*`）：
  - `config/properties/WechatProperties`（prefix=`justauth`，`Map<String,SocialLoginConfigProperties> type`）+ `SocialLoginConfigProperties`
  - `util/WechatAuthUtils`（`loginAuth(source, code, state)` + `getAuthRequest` switch：`wechat_open`/`wechat_app` → `AuthWeChatOpenRequest`；`wechat_xcx` → `AuthWechatMiniProgramRequest`）
  - `util/AuthRedisStateCache`（`io.github.windtool.cache.AuthStateCache`，key `tpl:social_auth_codes:{state}`，3 分钟 TTL）
  - `entity/SysSocial`（`@TableName("sys_social")`，零 DDL）+ `mapper/SysSocialMapper` + `service/SysSocialService`
  - `service/strategy/IAuthStrategy`（静态 `login(body, grantType)` → bean `grantType+"AuthStrategy"`）、`SocialAuthStrategy`（`@Service("socialAuthStrategy")`）、`XcxAuthStrategy`（`@Service("xcxAuthStrategy")`）
  - `model/dto/SocialLoginBody`、`XcxLoginBody`
- 现有 `AuthService.login()` 的 grantType if/else 改造为 `IAuthStrategy.login()` Bean 分发；`password`/`sms` 保留现有逻辑（if/else 兜底）。
- **不引入 `sys_client` 校验**（tpl-app-api 现状无 SysClient 实体/种子数据，`clientId` 仅透传，最小改动）。
- 现有 `captchaService.validate()` 仅在 password/sms 分支保留；social/xcx 分支**跳过图形验证码**。
- 接口扩展：`POST /auth/login`（social/xcx）、`GET /auth/binding/{source}`、`POST /auth/social/callback`、`DELETE /auth/unlock/{socialId}`、`GET /system/social/list`。
- 配置：`wechat.enabled: ${WECHAT_LOGIN_ENABLED:true}` + `justauth.type.{wechat_open,wechat_app,wechat_xcx}`（client-id/client-secret/redirect-uri 均环境变量注入）。
- **授权变更回调（消息推送）本阶段不做**（设计文档 §4.1 第 5 点为后续合规项）。

### 9.4 各端实现要点

- **tpl-app-web**：`src/api/social.ts`（`authRouterUrl`/`socialLogin`/`socialCallback`）、`views/SocialCallback.vue`（读 code/state/source → 无 token 调 socialLogin / 有 token 调 socialCallback → 存 token → 跳 `/profile`）、`/social-callback` 路由（**不可加 `meta.guest`**，须登录/未登录均可达）、`LoginPage.vue` 加微信按钮（`source='wechat_open'`）、`.env` 加 `VITE_APP_WECHAT_LOGIN_ENABLED=true` + `VITE_APP_CLIENT_ID`。**注意**：tpl-app-web 拦截器已 unwrap 到 `data.data`，`authRouterUrl` 直接返回 URL 字符串。
- **tpl-app-mini**：新建 `utils/config.ts`（`export const WECHAT_LOGIN_ENABLED = true`）、`login.ts` 加 `handleWechatLogin()`（`wx.login()` → `POST /auth/login {grantType:'xcx', clientId:'mini', xcxCode}`，未命中走 getPhoneNumber + `phoneCode`）、`login.wxml` 复用已存在的 `.wechat-btn`/`.separator` 样式、`typings/auth.d.ts` 加 `XcxLoginRequest`。
- **tpl-app-android**：包 `org.fellow99.tpl.TplAppAndroid`，`wxapi/WXEntryActivity.kt`、`libs.versions.toml` 加 `wechat-sdk-android:6.8.0`、`AndroidManifest.xml` 加 `<queries>` + WXEntryActivity、`buildConfigField` 加 `WECHAT_LOGIN_ENABLED`/`WECHAT_APP_ID`、`AuthApi.socialLogin`（`@Headers("isToken: false","isEncrypt: true")`）、`LoginFragment`/`ProfileFragment` 入口。
- **tpl-app-harmony**：入口 Ability 为 `DefaultAbility.ets`（非 EntryAbility）、`oh-package.json5` 加 `@tencent/wechat_open_sdk`、`module.json5` 加 `queryscheme`、`buildProfileFields` 加 `WECHAT_LOGIN_ENABLED`/`WECHAT_APP_ID`、`AuthService.socialLogin`、`LoginForm.ets`/`ProfilePage.ets` 入口。
- **tpl-manage-ui**：删除 `src/views/login.vue` 的 `.social-panel`（含 5 按钮、`doSocialLogin`、`authRouterUrl` import、`HttpStatus` import、相关 CSS）+ `lang/zh_CN.ts`/`en_US.ts` 的 `login.social.*` 文案；**不删**框架 `@/api/system/social/auth.ts`（继承自 RVP-UI，被 `thirdParty.vue` 引用）。
- **tpl-manage**：零改动（社交接口在 `ruoyi-admin` AuthController，本就不在 tpl-manage 运行时 classpath；仅 `ruoyi-system` 的 `/system/social/list` 生效）。
