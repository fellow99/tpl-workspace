# 用户注册及登录 功能规格（重新对齐）

> 模块：002-user-auth
> 状态：重新对齐实现（tpl-app-api + 四端）
> 需求编号：002-user-auth
> 需求名称：重新对齐实现用户注册、用户登录、我的账户
> 更新日期：2026-08-14

---

## 1. 模块概述

重新对齐各端 002-user-auth 实现，统一以下能力：加密机制、短信验证码、手机注册、密码/短信登录、获取用户信息（token 续期）、「个人中心」栏目（查看/修改信息、修改密码）、**微信登录集成**（小程序一键登录 / 移动端拉起登录 / Web 扫码登录）。

> 微信登录集成的需求来源与详细技术设计见 `docs/002-用户注册及登录设计-微信登录集成.md`（§八），本文档 §11 定义其功能需求与验收标准。

### 1.1 涉及工程

| 工程 | 角色 |
|------|------|
| tpl-app-api | 后端（认证 + 用户信息服务） |
| tpl-app-web | 用户端 Web |
| tpl-app-android | Android 客户端 |
| tpl-app-harmony | HarmonyOS 客户端 |
| tpl-app-mini | 微信小程序 |

---

## 2. 加密机制（AES+RSA 混合加密）

对齐 RuoYi-Vue-Plus：**RSA 保护一次性 AES 密钥，AES 加密请求体**。详见 `docs/002-用户注册及登录设计-加密机制.md` §3.6.1 wire 契约。

### 2.1 wire 契约（四端 + 后端必须严格一致）

| 环节 | 约定 |
|------|------|
| 对称算法 | AES-256，ECB 模式，PKCS#7 填充（Java 侧 PKCS5 等价） |
| AES 密钥 | 32 字节（32 字符随机 hex 字符串的 UTF-8 字节，按原始字节使用） |
| 非对称算法 | RSA-2048，PKCS#1 v1.5（仅加密 AES 密钥） |
| 密钥传输 | `header["encrypt-key"] = RSA_pub(Base64(aesKey_utf8_bytes))` |
| 请求体 | `body = Base64(AES_encrypt(JSON字符串, aesKey))` |
| 触发标识 | 请求头 `isEncrypt: true`（客户端内部标记，发送前移除） |

### 2.2 加密白名单（仅含敏感字段的接口）

| 接口 | 加密 |
|------|:--:|
| `POST /auth/register` | ✅ |
| `POST /auth/login` | ✅ |
| `PUT /system/user/profile` | ✅ |
| `PUT /system/user/password` | ✅ |
| 其余（验证码 / 短信码 / getInfo / 登出） | ❌ |

> 后端 `ApiDecryptFilter` 对携带 `encrypt-key` 头的 POST/PUT 请求解密，无该头则透传。

### 2.3 密钥管理

- RSA 私钥：后端环境变量 `RSA_PRIVATE_KEY`（Base64 PKCS#8），禁止入前端/入仓库。
- RSA 公钥：各端构建时注入（web=`VITE_APP_RSA_PUBLIC_KEY`，android=`buildConfigField`，harmony=`BuildProfile`，mini=常量）。
- 开发默认密钥对见各端配置；生产必须轮换。

---

## 3. 认证机制（Sa-Token JWT）

- **JWT 模式**：启用 `StpLogicJwtForSimple`（签发真正的 JWT，支持登出）。
- **Token 有效期**：30 天（`sa-token.timeout: 2592000`）。
- **Token 续期**：`GET /system/user/getInfo` 调用 `StpUtil.renewTimeout` 续期。
- **Authorization 前缀**：四端统一发送**裸 token**（无 `Bearer ` 前缀）；后端不配置 `token-prefix`。
- **签名密钥**：环境变量 `SA_TOKEN_JWT_SECRET`（生产必须覆盖为强随机密钥）。

---

## 4. 短信验证码（202-sms-integration）

- 发送验证码：`GET /resource/sms/code?phoneNumber=` 调用 `SmsService.sendCode`（Spug Push）。
- 消费校验：注册/短信登录/修改密码调用 `SmsService.verifyCode`（Redis `sms_code:{phone}`，10 分钟 TTL）。
- 一个手机号仅缓存一个验证码，未过期不重复发送。

---

## 5. 功能需求

### 5.1 手机注册

表单：手机号、密码、短信验证码（右侧「获取验证码」按钮）、图形验证码（CAPTCHA）。

- 手机号即用户名，存入 `sys_user.user_name`、`phone_number`、`nick_name`。
- 密码存入 `sys_user.password`（BCrypt）。

后端流程（`POST /auth/register`）：
1. 先验证 CAPTCHA → 失败「验证码错误」；
2. 再调用 202-sms 消费校验 → 失败「短信验证码错误」；
3. 判断用户是否存在：
   - 不存在 → 新增用户 → 创建失败「无法创建用户」→ 登录失败「用户已创建，请登录」；
   - 存在 → 密码登录 → 登录失败「用户已存在且密码不正确」；
4. 成功 → 返回「注册且登录成功」+ 登录信息（**仅 token**，不含用户信息）。

### 5.2 用户登录

#### 密码登录

表单：手机号、密码、图形验证码（CAPTCHA）。
1. 先验证 CAPTCHA → 失败「验证码错误」；
2. 再验证用户/密码 → 失败「登录失败」；
3. 成功 → 返回「登录成功」+ **仅 token**。

#### 短信登录

表单：手机号、短信验证码（右侧「获取验证码」按钮）、图形验证码（CAPTCHA）。
1. 先验证 CAPTCHA → 失败「验证码错误」；
2. 再调用 202-sms 消费校验 → 失败「短信验证码错误」；
3. 验证码正确后直接生成登录信息 → 返回「登录成功」+ **仅 token**。

### 5.3 用户登录完成

- 各端登录成功后存储 token 到本端存储，token 30 天过期。

### 5.4 进入主页

- 再次打开页面/App 时，用存储的 token 调用 `GET /system/user/getInfo`（后端 token 续期）。
- 成功 → 切换到「个人中心」；失败 → 清理 token，跳转登录页。

### 5.5 「我的」栏目

显示当前用户信息（昵称、手机号、email、生日）。

- **修改用户信息**（`PUT /system/user/profile`）：昵称、email、生日、CAPTCHA；先验证 CAPTCHA → 更新。
- **修改密码**（`PUT /system/user/password`）：当前密码、新密码、确认新密码、短信验证码、CAPTCHA；先验证 CAPTCHA → 再 202-sms 消费校验 → 更新密码。**无密码账号无需校验当前密码**（见 §5.6）。

### 5.6 无密码账号（微信一键登录自动建号）

微信一键登录自动建号的账号**无密码**（`sys_user.password` 为空字符串），相关约束：

- **密码登录**：无密码账号**不允许**密码登录，登录接口返回「该账号未设置密码，请使用微信登录」。
- **修改密码**：无密码账号**无需校验当前密码**（当前密码为空也可提交），设置新密码后转为普通账号（可密码登录）。
- **判定接口**：后端提供 `GET /system/user/isEmptyPassword`（需 Token），返回当前账号是否无密码（`true`/`false`）。
- **前端**：修改密码页根据 `isEmptyPassword` 隐藏「当前密码」表单项，提交时当前密码传空字符串。

---

## 6. 接口契约

### 6.1 公开接口（无需 Token）

| 方法 | 路径 | 说明 | 加密 |
|------|------|------|:--:|
| GET | `/auth/code` | 图形验证码 `{captchaEnabled, uuid, img}` | — |
| GET | `/resource/sms/code?phoneNumber=` | 发送短信验证码 | — |
| POST | `/auth/register` | 手机注册 + 自动登录 → `{access_token}` | ✅ |
| POST | `/auth/login` | 统一登录（grantType=password/sms）→ `{access_token}` | ✅ |

### 6.2 需 Token 接口

| 方法 | 路径 | 说明 | 加密 |
|------|------|------|:--:|
| POST | `/auth/logout` | 登出 | — |
| GET | `/system/user/getInfo` | 获取用户信息（token 续期）→ UserInfoVO | — |
| GET | `/system/user/isEmptyPassword` | 当前账号是否无密码 → `true/false` | — |
| PUT | `/system/user/profile` | 修改用户信息 | ✅ |
| PUT | `/system/user/password` | 修改密码 | ✅ |

### 6.3 统一响应

```json
{ "code": 200, "msg": "success", "data": { ... } }
```

### 6.4 UserInfoVO

```json
{ "userId": 1, "userName": "13800138000", "nickName": "13800138000",
  "phoneNumber": "13800138000", "email": "a@b.com", "birthDate": "2010-01-01" }
```

> 不含 `password` 字段。

---

## 7. 相关问题解决

| # | 问题 | 解决 |
|---|------|------|
| 1 | `is-jwt` 缺失、弱密钥 | 启用 `StpLogicJwtForSimple` + 强密钥环境变量 |
| 2 | 四端 Authorization 前缀不一致（mini 发 `Bearer`） | 统一裸 token，修复 mini 去掉 `Bearer ` 前缀 |

---

## 8. 数据安全

- `UserView` 实体与 `tpl_user_view` 视图**不得**含 `password` 字段。
- 登录密码校验改查 `sys_user`（服务端内部比对，哈希不下发）。
- 新增 `UserInfoVO`（不含 password），从源头杜绝密码外泄。

---

## 9. 界面规范（跨端统一）

### 9.1 短信验证码输入框

- 短信验证码输入框统一为 **6 位数字输入框**（`maxLength=6`，数字键盘）。
- 图形验证码（CAPTCHA）输入框为 **4 位**。
- 各端（web / android / harmony / mini）注册、短信登录、修改密码中的短信验证码输入框均遵循此约定。

### 9.2 App 典型布局

移动端 App（android / harmony / mini）采用「安卓应用典型布局」：

```
┌─────────────────────────────┐
│  顶部应用栏（当前页标题）      │  ← 二级页面含返回按钮，右侧可放功能按钮
├─────────────────────────────┤
│                             │
│       中间内容区域            │
│                             │
├─────────────────────────────┤
│   底部导航栏（主菜单切换）     │  ← 个人中心
└─────────────────────────────┘
```

- **顶部应用栏**：显示当前页面标题；二级页面有返回按钮；右侧可定义功能按钮（如搜索）。
- **底部导航栏**：应用主菜单切换（个人中心）。
- **中间内容区域**：页面主体内容。

### 9.3 命名统一

- 用户信息模块统一命名为「**个人中心**」（原「我的」），涉及底部导航 tab、页面标题、入口文案，及所有规范文档。

---

## 10. 验证码开关（禁用验证码）

### 10.1 配置项

- tpl-app-api 提供图形验证码开关配置项 **`captcha.enable`**（`application.yml` / `application-dev.yml` / `application-docker.yml`）。
  - `captcha.enable: true`：启用图形验证码（生产默认）。
  - `captcha.enable: false`：**禁用图形验证码**（调试/测试环境）。

### 10.2 后端行为（禁用时）

- `CaptchaService.validate()` 在 `captcha.enable=false` 时**直接跳过校验**（不校验 uuid/code，不消费 Redis）。
- 所有调用图形验证码校验的接口（注册 / 密码登录 / 短信登录 / 修改信息 / 修改密码）在禁用时均跳过验证码校验。
- `GET /auth/code` 在禁用时返回 `{ captchaEnabled: false, uuid: "", img: "" }`。

### 10.3 各端行为（禁用时）

- 各端根据 `/auth/code` 返回的 `captchaEnabled=false`，**隐藏图形验证码表单项**（输入框 + 图片），并**禁用**相关功能（不再发起图形验证码获取、不再校验非空）。
- 短信验证码不受 `captcha.enable` 影响（短信验证码仍按 202-sms-integration 流程正常发送与校验）。

### 10.4 部署环境配置

- 为方便各端调试与测试，`deploy`（Docker Compose）环境的 tpl-app-api 配置为 **`captcha.enable: false`**（禁用验证码）。
- 生产环境（`application-docker.yml` 之外）应按需开启 `captcha.enable: true`。

---

## 11. 微信登录集成

> 需求编号 002-user-auth 的微信登录扩展。技术设计见 `docs/002-用户注册及登录设计-微信登录集成.md`（§八）。账号打通采用「**手机号主键 + openid 凭证**」策略（不依赖 unionid），openid 存 `sys_social`（`source` 区分 `wechat_open`/`wechat_app`/`wechat_xcx`）。

### 11.1 涉及工程与范围

| 工程 | 角色 | 实现 |
|------|------|------|
| tpl-app-mini | 微信小程序 | 微信一键登录（`wx.login` → `jscode2session`） |
| tpl-app-android | Android 客户端 | 微信登录（OpenSDK 拉起授权） |
| tpl-app-harmony | HarmonyOS 客户端 | 微信登录（OpenSDK 拉起授权） |
| tpl-app-web | 用户端 Web | 微信扫一扫登录（网站应用 `qrconnect`），完全参考 RuoYi-Vue-Plus-UI |
| tpl-app-api | 后端 | 配套 social/xcx 策略，完全参考 RuoYi-Vue-Plus |
| tpl-manage | 管理后端 | 后端接口保留，不配置 justauth |
| tpl-manage-ui | 管理前端 | 删除第三方登录入口（`.social-panel`） |

### 11.2 功能需求（FR）

**FR-WX-1**：各端均提供微信登录入口（mini 一键登录 / android、harmony 拉起登录 / web 扫码登录），受编译开关控制，**默认禁用（小程序一键登录已启用）**。

**FR-WX-2**：tpl-app-api `POST /auth/login` 扩展两种 grantType：
- `grantType=social`（网站扫码 + 移动拉起，`source` ∈ {`wechat_open`, `wechat_app`}，携带 `socialCode`/`socialState`）；
- `grantType=xcx`（小程序，携带 `xcxCode`，首次登录携带 `phoneCode`）。

**FR-WX-3**：账号绑定与识别规则（登录匹配顺序）：
1. 按 `sys_social.auth_id`（= `source + openid`）定位已绑定用户；
2. social 策略未命中 → 返回「未绑定」状态 + openid（前端引导手机号登录后绑定，`POST /auth/social/callback`）；
3. xcx 策略未命中 → 需 `phoneCode` 换手机号，按手机号查 `sys_user`：有 → 绑定 openid；无 → 自动建号 + 绑定（前端引导补全）。

**FR-WX-4**：微信凭据（`AppSecret`/`access_token`/`refresh_token`/`session_key`）仅服务端保存，禁止下发前端；头像 `headimgurl` 失效需自存（本阶段 MVP 可选转存 MinIO，默认存 URL）。

**FR-WX-5**：后端新增绑定/解绑/查询接口：`GET /auth/binding/{source}`（授权 URL）、`POST /auth/social/callback`（已登录绑定）、`DELETE /auth/unlock/{socialId}`（解绑）、`GET /system/social/list`（绑定列表）。

**FR-WX-6**：tpl-manage 后端社交接口保留（不删任何接口，仅不配置 `justauth.type.*`）；tpl-manage-ui 前端删除第三方登录入口（`.social-panel` 区块 + `doSocialLogin` + 相关 import + `login.social.*` 文案）。

**FR-WX-7**：微信登录请求复用既有 AES+RSA 加密通道（social/xcx 虽不含密码，仍走加密通道一致）。

### 11.3 编译开关（小程序启用，其余默认禁用）

| 工程 | 开关 | 位置 | 默认 | 关闭行为 |
|------|------|------|:--:|------|
| tpl-app-api | `wechat.enabled`（`WECHAT_LOGIN_ENABLED`） | application.yml | true | 不注册 social/xcx 策略、不开放端点 |
| tpl-app-web | `VITE_APP_WECHAT_LOGIN_ENABLED` | .env | false | 隐藏微信按钮、不注册回调路由 |
| tpl-app-android | `WECHAT_LOGIN_ENABLED` | buildConfigField | false | 隐藏微信登录/绑定入口 |
| tpl-app-harmony | `WECHAT_LOGIN_ENABLED` | buildProfileFields | false | 隐藏微信登录/绑定入口 |
| tpl-app-mini | `WECHAT_LOGIN_ENABLED` | config.ts 常量 | true | 隐藏一键登录按钮 |
| tpl-manage-ui | 无开关（物理移除） | login.vue | — | — |

### 11.4 验收标准

- [ ] AC-WX-1：小程序可用微信一键登录（新 openid 首次需手机号授权建号，老 openid 直接登录）。
- [ ] AC-WX-2：android/harmony 可拉起微信授权，回调 code 后经后端换 token 登录成功；未绑定引导手机号登录后绑定。
- [ ] AC-WX-3：Web 扫码登录闭环（授权 URL → 扫码 → `/social-callback` → token → 个人中心）。
- [ ] AC-WX-4：后端 social/xcx 策略在 `wechat.enabled=false` 时端点不开放。
- [ ] AC-WX-5：`sys_social` 表零 DDL 修改，绑定/解绑/列表接口可用。
- [ ] AC-WX-6：tpl-manage-ui 登录页无第三方登录入口；tpl-manage 后端社交接口仍可访问（未配置时返回「不支持」）。
- [ ] AC-WX-7：各端开关默认禁用（小程序端启用），关闭后对应入口隐藏。
